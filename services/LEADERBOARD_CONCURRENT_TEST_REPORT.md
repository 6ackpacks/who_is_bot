# 排行榜和统计功能并发测试报告

## 测试概述

**测试日期**: 2026-02-02
**测试工具**: Node.js 自定义并发测试脚本
**测试目标**: 验证排行榜和统计功能在高并发场景下的性能和数据一致性
**并发用户数**: 20
**压力测试迭代**: 5次/用户

---

## 测试环境

- **服务器**: http://localhost:80
- **数据库**: MySQL (TencentDB CynosDB)
- **后端框架**: NestJS + TypeORM
- **测试脚本**: `leaderboard-concurrent-test.js`

---

## 测试场景与结果

### 测试1: 并发获取排行榜

**场景描述**: 20个用户同时请求排行榜数据，使用不同的limit参数（10, 20, 50, 100）

**测试结果**:
- ✅ **成功率**: 100% (20/20)
- ✅ **平均响应时间**: 48.65ms
- ✅ **数据一致性**: 通过
- ✅ **数据格式**: 正确

**关键发现**:
1. 所有并发请求都成功返回数据
2. 排行榜前10名在所有请求中保持一致
3. 响应时间在可接受范围内（< 100ms）
4. 数据格式符合预期，包含用户昵称、准确率、判定数等字段

**排行榜示例数据**:
```
1. TestUser20 - 准确率: 94.5%, 判定数: 290
2. TestUser19 - 准确率: 93.5%, 判定数: 280
3. TestUser18 - 准确率: 92.5%, 判定数: 270
```

---

### 测试2: 并发获取用户统计

**场景描述**: 20个用户同时请求各自的统计信息

**测试结果**:
- ✅ **成功率**: 100% (20/20)
- ✅ **平均响应时间**: 29.05ms
- ✅ **数据完整性**: 通过

**关键发现**:
1. 用户统计查询比排行榜查询更快（29ms vs 49ms）
2. 所有统计字段正确返回（总判定、准确率、连胜、等级等）
3. 无数据丢失或错误

**用户统计示例**:
```
用户 1:
  总判定: 290
  准确率: 94.5%
  连胜: 24 (最高: 0)
  等级: AI小白
```

---

### 测试3: 混合场景测试

**场景描述**: 10个用户查询排行榜，10个用户查询统计信息，同时进行

**测试结果**:
- ✅ **排行榜查询成功率**: 100% (10/10)
- ✅ **统计查询成功率**: 100% (10/10)
- ✅ **平均响应时间**: 22.40ms
- ✅ **排行榜平均响应**: 27.20ms
- ✅ **统计平均响应**: 17.60ms

**关键发现**:
1. 混合场景下响应时间更快（可能是数据库缓存效应）
2. 两种查询类型互不干扰
3. 系统能够良好处理不同类型的并发请求

---

### 测试4: 压力测试

**场景描述**: 20个用户各发送5次连续请求，总计100次请求

**测试结果**:
- ✅ **成功率**: 100% (100/100)
- ⚠️ **平均响应时间**: 148.41ms
- ⚠️ **吞吐量**: 432.90 请求/秒
- ⚠️ **性能下降**: 190.87%

**响应时间分布**:
- **P50**: 151ms
- **P95**: 225ms
- **P99**: 231ms

**关键发现**:
1. 系统在高负载下仍保持100%成功率
2. 响应时间随请求数增加而显著上升（73ms → 213ms）
3. 存在明显的性能下降趋势
4. P99响应时间达到231ms，接近可接受上限

---

## 总体性能指标

### 成功率
- ✅ **总请求数**: 162
- ✅ **成功请求**: 162 (100%)
- ✅ **失败请求**: 0 (0%)

### 响应时间统计
- **平均响应时间**: 104.39ms ✅ (良好)
- **最小响应时间**: 13ms
- **最大响应时间**: 231ms
- **P50**: 104ms
- **P95**: 213ms
- **P99**: 228ms

### 性能评级
- ✅ **成功率**: 优秀 (100%)
- ✅ **响应时间**: 良好 (100-300ms)
- ⚠️ **稳定性**: 需要改进（存在性能下降）

---

## 数据库索引分析

### 当前索引配置

**users 表**:
```sql
PRIMARY KEY (`id`)
UNIQUE KEY `uk_uid` (`uid`)
KEY `idx_total_judged` (`totalJudged`)
KEY `idx_accuracy` (`accuracy`)
KEY `idx_weekly_judged` (`weeklyJudged`)
KEY `idx_level` (`level`)
```

### 排行榜查询分析

**当前查询逻辑** (来自 `user.service.ts`):
```typescript
return this.userRepository
  .createQueryBuilder('user')
  .where('user.totalJudged >= :minJudged', { minJudged: 5 })
  .orderBy('user.accuracy', 'DESC')
  .addOrderBy('user.totalJudged', 'DESC')
  .take(limit)
  .getMany();
```

**索引使用情况**:
- ✅ 有 `idx_accuracy` 索引用于排序
- ✅ 有 `idx_total_judged` 索引用于过滤和排序
- ⚠️ 但查询需要同时使用两个字段排序，可能无法充分利用单列索引

---

## 问题与风险

### 1. 性能下降问题 ⚠️

**现象**: 在压力测试中，响应时间从73ms增长到213ms，增长190.87%

**可能原因**:
- 数据库连接池不足
- 查询未充分利用索引
- 缺少查询结果缓存
- 数据库负载增加导致查询变慢

**影响**: 在高并发场景下，用户体验可能下降

---

### 2. 缺少缓存机制 ⚠️

**现象**: 每次请求都直接查询数据库

**问题**:
- 排行榜数据变化频率低，但查询频率高
- 重复查询浪费数据库资源
- 响应时间受数据库性能限制

**影响**: 无法应对更高的并发量

---

### 3. 复合排序索引缺失 ⚠️

**现象**: 排行榜查询需要按 `accuracy DESC, totalJudged DESC` 排序

**问题**:
- 当前只有单列索引
- MySQL可能无法同时利用两个索引进行排序
- 可能需要文件排序（filesort），影响性能

**影响**: 查询效率不是最优

---

### 4. maxStreak 字段异常 ⚠️

**现象**: 测试数据显示 `maxStreak: 0`，但 `streak: 24`

**问题**:
- maxStreak 应该记录历史最高连胜
- 当前值为0不合理
- 可能是业务逻辑问题

**影响**: 数据准确性问题

---

## 优化建议

### 高优先级 🔴

#### 1. 添加复合索引

**建议**:
```sql
-- 为排行榜查询添加复合索引
ALTER TABLE `users`
ADD INDEX `idx_leaderboard` (`totalJudged`, `accuracy` DESC, `totalJudged` DESC);

-- 或者使用覆盖索引
ALTER TABLE `users`
ADD INDEX `idx_leaderboard_cover` (
  `totalJudged`,
  `accuracy` DESC,
  `id`,
  `nickname`,
  `avatar`,
  `level`,
  `maxStreak`,
  `weeklyAccuracy`
);
```

**预期效果**:
- 查询速度提升 30-50%
- 减少文件排序操作
- 更好地利用索引

---

#### 2. 实现 Redis 缓存

**建议实现**:
```typescript
// 在 UserService 中添加缓存
async getLeaderboard(limit: number = 50): Promise<User[]> {
  const cacheKey = `leaderboard:${limit}`;

  // 尝试从缓存获取
  const cached = await this.cacheManager.get(cacheKey);
  if (cached) {
    return cached;
  }

  // 查询数据库
  const users = await this.userRepository
    .createQueryBuilder('user')
    .where('user.totalJudged >= :minJudged', { minJudged: 5 })
    .orderBy('user.accuracy', 'DESC')
    .addOrderBy('user.totalJudged', 'DESC')
    .take(limit)
    .getMany();

  // 缓存结果（5分钟）
  await this.cacheManager.set(cacheKey, users, 300);

  return users;
}
```

**缓存策略**:
- 缓存时间: 5分钟
- 缓存键: `leaderboard:{limit}`
- 失效策略: 用户统计更新时清除缓存

**预期效果**:
- 响应时间降低到 5-10ms
- 数据库负载减少 90%+
- 支持更高并发量

---

#### 3. 优化数据库连接池

**当前配置检查**:
```typescript
// 检查 TypeORM 配置
TypeOrmModule.forRoot({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  // 添加连接池配置
  extra: {
    connectionLimit: 20,        // 最大连接数
    waitForConnections: true,   // 等待可用连接
    queueLimit: 0,              // 无限队列
    connectTimeout: 10000,      // 连接超时
  },
})
```

**建议配置**:
- 最大连接数: 20-50（根据服务器配置）
- 最小连接数: 5
- 连接超时: 10秒
- 空闲超时: 60秒

---

### 中优先级 🟡

#### 4. 实现排行榜预计算

**建议**:
```typescript
// 使用 NestJS Schedule 定时任务
@Cron('*/5 * * * *') // 每5分钟执行一次
async updateLeaderboardCache() {
  const leaderboard = await this.userRepository
    .createQueryBuilder('user')
    .where('user.totalJudged >= :minJudged', { minJudged: 5 })
    .orderBy('user.accuracy', 'DESC')
    .addOrderBy('user.totalJudged', 'DESC')
    .take(100)
    .getMany();

  await this.cacheManager.set('leaderboard:precomputed', leaderboard, 600);
}
```

**优点**:
- 查询时直接返回预计算结果
- 响应时间稳定在 5ms 以内
- 数据库负载最小化

---

#### 5. 添加查询监控

**建议**:
```typescript
// 添加查询性能监控
@Injectable()
export class QueryLogger {
  async logSlowQuery(query: string, duration: number) {
    if (duration > 100) { // 超过100ms记录
      console.warn(`Slow query detected: ${duration}ms`, query);
    }
  }
}
```

**监控指标**:
- 查询执行时间
- 慢查询日志
- 数据库连接池使用率
- 缓存命中率

---

#### 6. 修复 maxStreak 逻辑

**问题定位**:
检查判定提交时是否正确更新 maxStreak

**建议修复**:
```typescript
// 在 JudgmentService 中
if (user.streak > user.maxStreak) {
  user.maxStreak = user.streak;
}
await this.userRepository.save(user);
```

---

### 低优先级 🟢

#### 7. 实现分页优化

**当前问题**: 使用 `take(limit)` 可能在大数据量时效率低

**建议**:
```typescript
// 使用游标分页
async getLeaderboard(limit: number, cursor?: string) {
  const query = this.userRepository
    .createQueryBuilder('user')
    .where('user.totalJudged >= :minJudged', { minJudged: 5 });

  if (cursor) {
    query.andWhere('user.id > :cursor', { cursor });
  }

  return query
    .orderBy('user.accuracy', 'DESC')
    .addOrderBy('user.totalJudged', 'DESC')
    .take(limit)
    .getMany();
}
```

---

#### 8. 添加 CDN 缓存

**建议**:
- 为排行榜 API 添加 HTTP 缓存头
- 使用 CDN 缓存静态排行榜数据
- Cache-Control: max-age=300 (5分钟)

---

## 性能优化预期效果

### 优化前
- 平均响应时间: 104ms
- P95: 213ms
- P99: 228ms
- 吞吐量: 433 请求/秒

### 优化后（预期）
- 平均响应时间: **15-20ms** ⬇️ 80%
- P95: **30ms** ⬇️ 86%
- P99: **50ms** ⬇️ 78%
- 吞吐量: **2000+ 请求/秒** ⬆️ 360%

---

## 实施计划

### 第一阶段（立即实施）
1. ✅ 添加复合索引
2. ✅ 实现 Redis 缓存
3. ✅ 优化数据库连接池配置

**预期时间**: 1-2天
**预期效果**: 性能提升 60-70%

---

### 第二阶段（1周内）
1. 实现排行榜预计算
2. 添加查询监控
3. 修复 maxStreak 逻辑

**预期时间**: 3-5天
**预期效果**: 性能提升 80%+，稳定性提升

---

### 第三阶段（长期优化）
1. 实现分页优化
2. 添加 CDN 缓存
3. 持续监控和调优

**预期时间**: 持续进行
**预期效果**: 支持更大规模并发

---

## 测试脚本使用说明

### 运行测试

```bash
cd services
node leaderboard-concurrent-test.js
```

### 配置参数

编辑 `leaderboard-concurrent-test.js`:

```javascript
const CONFIG = {
  host: 'localhost',           // 服务器地址
  port: 80,                    // 服务器端口
  protocol: 'http:',           // 协议
  concurrentUsers: 20,         // 并发用户数
  stressTestIterations: 5,     // 压力测试迭代次数
};
```

### 测试场景

1. **并发获取排行榜**: 测试排行榜查询的并发性能
2. **并发获取用户统计**: 测试用户统计查询的并发性能
3. **混合场景测试**: 测试混合查询场景
4. **压力测试**: 测试系统在高负载下的表现

---

## 结论

### 优点 ✅
1. **高可靠性**: 100% 成功率，无请求失败
2. **数据一致性**: 并发场景下数据保持一致
3. **基础性能良好**: 平均响应时间在可接受范围内
4. **良好的架构**: 使用 TypeORM 和 NestJS，易于扩展

### 需要改进 ⚠️
1. **性能下降**: 高负载下响应时间显著增加
2. **缺少缓存**: 重复查询浪费资源
3. **索引优化**: 复合索引可以进一步提升性能
4. **数据问题**: maxStreak 字段需要修复

### 总体评价
系统在当前负载下表现良好，但需要进行优化以支持更高的并发量。建议优先实施 Redis 缓存和复合索引优化，预计可以将性能提升 60-80%。

---

## 附录

### A. 测试数据样本

**排行榜数据**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "nickname": "TestUser20",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Anonymous",
      "level": "AI小白",
      "totalJudged": 290,
      "maxStreak": 0,
      "weeklyAccuracy": 94.5
    }
  ]
}
```

**用户统计数据**:
```json
{
  "success": true,
  "data": {
    "totalJudged": 290,
    "accuracy": 94.5,
    "correctCount": 274,
    "streak": 24,
    "maxStreak": 0,
    "weeklyAccuracy": 94.5,
    "weeklyJudged": 290,
    "level": 1,
    "levelName": "AI小白"
  }
}
```

### B. 数据库查询示例

**排行榜查询**:
```sql
SELECT * FROM users
WHERE totalJudged >= 5
ORDER BY accuracy DESC, totalJudged DESC
LIMIT 50;
```

**用户统计查询**:
```sql
SELECT * FROM users WHERE id = 'uuid';
```

### C. 相关文件

- **测试脚本**: `C:\Users\li\Downloads\who-is-the-bot\services\leaderboard-concurrent-test.js`
- **用户服务**: `C:\Users\li\Downloads\who-is-the-bot\services\src\user\user.service.ts`
- **用户控制器**: `C:\Users\li\Downloads\who-is-the-bot\services\src\user\user.controller.ts`
- **排行榜控制器**: `C:\Users\li\Downloads\who-is-the-bot\services\src\user\leaderboard.controller.ts`
- **数据库脚本**: `C:\Users\li\Downloads\who-is-the-bot\services\main.sql`

---

**报告生成时间**: 2026-02-02
**测试工程师**: Claude Code (Test Engineer)
**版本**: 1.0
