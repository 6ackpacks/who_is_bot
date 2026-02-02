# 并发竞态条件修复总结

## 问题描述

在并发场景下（20个用户同时提交判定），内容统计数据出现不准确的情况：
- 实际总投票数少于预期
- 数据丢失（例如：预期31票，实际只有13票，丢失18票）

## 根本原因

在 `judgment.service.ts` 的统计更新方法中使用了 **读-改-写（Read-Modify-Write）** 模式：

```typescript
// 有问题的代码
const content = await queryRunner.manager.findOne(Content, {
  where: { id: dto.contentId },
});

content.totalVotes += 1;  // 多个并发请求可能读取相同的旧值
await queryRunner.manager.save(content);
```

### 竞态条件示例

1. 事务A读取 `totalVotes = 10`
2. 事务B读取 `totalVotes = 10` (同时进行)
3. 事务A计算 `totalVotes = 11` 并保存
4. 事务B计算 `totalVotes = 11` 并保存（覆盖了A的更新）
5. 结果：应该是12，实际是11，丢失1票

## 修复方案

### 1. 内容统计更新 - 使用原子递增操作

**修改文件**: `services/src/judgment/judgment.service.ts`

**修改前**:
```typescript
private async updateContentStatsInTransaction(dto: SubmitJudgmentDto, queryRunner: any) {
  const content = await queryRunner.manager.findOne(Content, {
    where: { id: dto.contentId },
  });

  if (content) {
    content.totalVotes += 1;
    if (dto.userChoice === 'ai') {
      content.aiVotes += 1;
    } else {
      content.humanVotes += 1;
    }
    if (dto.isCorrect) {
      content.correctVotes += 1;
    }
    await queryRunner.manager.save(content);
  }
}
```

**修改后**:
```typescript
private async updateContentStatsInTransaction(dto: SubmitJudgmentDto, queryRunner: any) {
  // 使用原子递增操作，避免读-改-写的竞态条件
  await queryRunner.manager.increment(
    Content,
    { id: dto.contentId },
    'totalVotes',
    1
  );

  if (dto.userChoice === 'ai') {
    await queryRunner.manager.increment(
      Content,
      { id: dto.contentId },
      'aiVotes',
      1
    );
  } else {
    await queryRunner.manager.increment(
      Content,
      { id: dto.contentId },
      'humanVotes',
      1
    );
  }

  if (dto.isCorrect) {
    await queryRunner.manager.increment(
      Content,
      { id: dto.contentId },
      'correctVotes',
      1
    );
  }
}
```

**原理**: TypeORM的 `increment()` 方法生成 SQL: `UPDATE content SET totalVotes = totalVotes + 1 WHERE id = ?`，这是数据库级别的原子操作。

### 2. 用户统计更新 - 使用悲观锁

**修改文件**: `services/src/judgment/judgment.service.ts`

**修改前**:
```typescript
private async updateUserStatsInTransaction(dto: SubmitJudgmentDto, queryRunner: any) {
  const user = await queryRunner.manager.findOne(User, {
    where: { id: dto.userId },
  });

  if (user) {
    user.totalJudged += 1;
    // ... 其他统计更新
    await queryRunner.manager.save(user);
  }
}
```

**修改后**:
```typescript
private async updateUserStatsInTransaction(dto: SubmitJudgmentDto, queryRunner: any) {
  // 使用悲观写锁（FOR UPDATE）锁定用户记录
  const user = await queryRunner.manager
    .createQueryBuilder(User, 'user')
    .setLock('pessimistic_write')
    .where('user.id = :id', { id: dto.userId })
    .getOne();

  if (user) {
    user.totalJudged += 1;
    // ... 其他统计更新
    await queryRunner.manager.save(user);
  }
}
```

**原理**: `pessimistic_write` 锁生成 SQL: `SELECT ... FOR UPDATE`，确保同一时间只有一个事务能修改该用户记录。

### 3. 测试改进 - 从数据库验证最终状态

**修改文件**: `services/concurrent-test.js`

**问题**: 测试使用响应中的统计数据，但响应可能在所有事务完成前就发送了。

**修改**: 在所有并发请求完成后，从数据库重新获取最终状态进行验证：

```javascript
// 从数据库重新获取最终状态
const finalContentResponse = await axios.get(`${BASE_URL}/content/feed`, {
  params: { limit: 10 },
});
const finalContentList = finalContentResponse.data.data || finalContentResponse.data;
const finalContent = finalContentList.find(c => c.id === targetContent.id);

const finalStats = {
  totalVotes: finalContent.totalVotes,
  aiVotes: finalContent.aiVotes,
  humanVotes: finalContent.humanVotes,
  correctVotes: finalContent.correctVotes,
};
```

## 技术细节

### 原子操作 vs 悲观锁的选择

1. **内容统计使用原子操作**:
   - 只需要简单的数值递增
   - 不需要读取当前值进行复杂计算
   - 性能最优，无锁等待

2. **用户统计使用悲观锁**:
   - 需要读取多个字段（totalJudged, correctCount, streak等）
   - 需要进行复杂计算（准确率、等级判定）
   - 需要根据当前值做条件判断（maxStreak = Math.max(...)）
   - 必须保证读取和更新的原子性

### SQL 执行示例

**原子递增**:
```sql
UPDATE content
SET totalVotes = totalVotes + 1
WHERE id = 'content_001';
```

**悲观锁**:
```sql
-- 事务开始
BEGIN;

-- 锁定行
SELECT * FROM user WHERE id = 'user_123' FOR UPDATE;

-- 更新（其他事务必须等待）
UPDATE user SET totalJudged = 15, accuracy = 85.5 WHERE id = 'user_123';

-- 提交
COMMIT;
```

## 测试结果

### 修复前
```
总测试数: 5
通过: 4
失败: 1
通过率: 80.00%

失败的测试:
  1. 并发提交判定 - 20/20 成功
     统计数据不准确
```

### 修复后
```
总测试数: 5
通过: 5
失败: 0
通过率: 100.00%

✓ 测试通过！系统并发性能良好。
```

### 详细验证

**测试场景**: 20个用户同时对同一内容提交判定

**第一次运行**:
- 初始统计: 总投票 53, AI投票 23, 人类投票 33
- 最终统计: 总投票 73, AI投票 33, 人类投票 43
- 预期统计: 总投票 73, AI投票 33, 人类投票 43
- 结果: ✓ 统计数据完全准确！

**第二次运行**:
- 初始统计: 总投票 77, AI投票 34, 人类投票 46
- 最终统计: 总投票 97, AI投票 44, 人类投票 56
- 预期统计: 总投票 97, AI投票 44, 人类投票 56
- 结果: ✓ 统计数据完全准确！

## 性能影响

1. **内容统计**: 使用原子操作，性能提升（无需加锁）
2. **用户统计**: 使用悲观锁，轻微性能影响（锁等待时间）
3. **整体响应时间**: 平均 1050-1100ms（20个并发请求）
4. **数据准确性**: 100%准确，无数据丢失

## 最佳实践总结

1. **简单计数器**: 使用数据库原子操作（increment/decrement）
2. **复杂统计**: 使用悲观锁保护读-改-写操作
3. **事务隔离**: 确保所有相关操作在同一事务中
4. **测试验证**: 从数据库获取最终状态，而非依赖响应数据

## 相关文件

- `services/src/judgment/judgment.service.ts` - 判定服务（已修复）
- `services/concurrent-test.js` - 并发测试脚本（已改进）
- `services/src/content/content.service.ts` - 内容服务（无需修改）

## 后续建议

1. 考虑为高并发场景添加 Redis 缓存
2. 监控数据库锁等待时间
3. 定期运行并发测试确保数据一致性
4. 考虑使用乐观锁（版本号）作为备选方案
