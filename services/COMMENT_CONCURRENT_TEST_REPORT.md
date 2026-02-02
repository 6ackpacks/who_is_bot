# 评论系统并发测试报告

## 测试概述

本测试旨在验证评论系统在高并发场景下的性能和数据一致性，特别关注可能出现的竞态条件问题。

## 测试脚本

**文件位置**: `C:\Users\li\Downloads\who-is-the-bot\services\comment-concurrent-test-improved.js`

### 改进点

相比原始的 `concurrent-comment-test.js`，改进版本具有以下优势:

1. **真实认证**: 使用 `mock-login` API 获取真实的 JWT tokens
2. **动态内容创建**: 自动创建测试内容，无需预先存在的内容ID
3. **完整的测试流程**: 从用户认证到内容创建，再到评论操作的完整流程
4. **详细的指标收集**: 收集平均响应时间、数据一致性等详细指标

## 测试场景

### 场景 1: 并发创建评论
- **目标**: 20个用户同时发表评论
- **验证点**:
  - 所有评论是否成功创建
  - JWT认证是否正常工作
  - 响应时间是否可接受
  - 评论ID是否正确返回

### 场景 2: 并发获取评论列表
- **目标**: 20个用户同时获取评论列表
- **验证点**:
  - 所有请求是否成功
  - 返回的评论数量是否一致（数据一致性）
  - 评论数量是否与创建的数量匹配
  - 响应时间是否可接受

### 场景 3: 并发删除评论
- **目标**: 10个用户同时删除自己的评论
- **验证点**:
  - 只能删除自己的评论（授权检查）
  - 删除操作是否成功
  - 403 Forbidden 响应是否正确返回
  - 响应时间是否可接受

### 场景 4: 并发点赞评论（关键测试）
- **目标**: 20个用户同时点赞同一条评论
- **验证点**:
  - 所有点赞请求是否成功
  - **点赞计数是否准确**（这是最容易出现竞态条件的地方）
  - 是否有点赞丢失
  - 响应时间是否可接受

## 竞态条件分析

### 什么是竞态条件？

在并发场景下，如果多个请求同时修改同一数据，可能会出现以下问题:

```
时间线:
T1: 用户A读取 likes = 0
T2: 用户B读取 likes = 0
T3: 用户A计算 likes = 0 + 1 = 1，写入数据库
T4: 用户B计算 likes = 0 + 1 = 1，写入数据库
结果: likes = 1 (错误！应该是 2)
```

### 当前实现分析

查看 `comment.service.ts` 的点赞实现:

```typescript
async likeComment(commentId: string) {
  const comment = await this.commentRepository.findOne({
    where: { id: commentId },
  });

  if (!comment) {
    throw new NotFoundException('评论不存在');
  }

  comment.likes += 1;  // 这里存在竞态条件！
  await this.commentRepository.save(comment);

  return {
    success: true,
    likes: comment.likes,
  };
}
```

**问题**: 这是典型的"读-修改-写"模式，在高并发下会导致点赞丢失。

### 修复方案

#### 方案 1: 使用原子递增操作（推荐）

```typescript
async likeComment(commentId: string) {
  // 使用 SQL 的原子递增操作
  const result = await this.commentRepository
    .createQueryBuilder()
    .update(Comment)
    .set({ likes: () => 'likes + 1' })
    .where('id = :id', { id: commentId })
    .execute();

  if (result.affected === 0) {
    throw new NotFoundException('评论不存在');
  }

  // 获取更新后的值
  const comment = await this.commentRepository.findOne({
    where: { id: commentId },
  });

  return {
    success: true,
    likes: comment.likes,
  };
}
```

#### 方案 2: 使用数据库事务和锁

```typescript
async likeComment(commentId: string) {
  return await this.commentRepository.manager.transaction(async (manager) => {
    // 使用悲观锁
    const comment = await manager.findOne(Comment, {
      where: { id: commentId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    comment.likes += 1;
    await manager.save(comment);

    return {
      success: true,
      likes: comment.likes,
    };
  });
}
```

#### 方案 3: 使用 Redis 缓存层

```typescript
async likeComment(commentId: string) {
  // 使用 Redis 的 INCR 命令（原子操作）
  const likes = await this.redis.incr(`comment:${commentId}:likes`);

  // 异步更新数据库
  this.updateDatabaseAsync(commentId, likes);

  return {
    success: true,
    likes: likes,
  };
}
```

## 测试配置

```javascript
const CONFIG = {
  BASE_URL: 'http://localhost:80',
  CONCURRENT_USERS: 20,      // 并发用户数
  DELETE_USERS: 10,          // 删除测试的用户数
  TEST_CONTENT_ID: null,     // 动态创建
};
```

## 如何运行测试

### 前提条件

1. 确保后端服务正在运行:
   ```bash
   cd services
   npm run start:dev
   ```

2. 确保数据库连接正常

### 运行测试

```bash
cd services
node comment-concurrent-test-improved.js
```

## 当前状态

### 测试执行情况

由于数据库连接问题（`read ECONNRESET`），测试无法完成。这是远程数据库连接不稳定导致的。

**错误信息**:
```
QueryFailedError: read ECONNRESET
```

### 建议

1. **检查数据库连接**
   - 验证数据库服务器是否在线
   - 检查网络连接是否稳定
   - 确认数据库凭据是否正确

2. **重试测试**
   - 在数据库连接稳定后重新运行测试
   - 可以考虑使用本地数据库进行测试

3. **监控数据库性能**
   - 在高并发测试期间监控数据库CPU和内存使用
   - 检查数据库连接池配置是否合理

## 性能基准

基于类似系统的经验，预期的性能指标:

| 操作 | 预期响应时间 | 可接受范围 |
|------|------------|----------|
| 创建评论 | < 50ms | < 100ms |
| 获取评论列表 | < 30ms | < 50ms |
| 删除评论 | < 40ms | < 80ms |
| 点赞评论 | < 20ms | < 40ms |

## 测试脚本特性

### 1. 真实认证流程
```javascript
async function setupTestUsers() {
  // 为每个测试用户调用 mock-login API
  for (let i = 1; i <= CONFIG.CONCURRENT_USERS; i++) {
    const nickname = `ConcurrentTestUser${i}_${timestamp}`;
    // 获取真实的 JWT token
    const response = await makeRequest('POST', '/auth/mock-login', { nickname });
    // 保存 token 用于后续请求
  }
}
```

### 2. 动态内容创建
```javascript
async function createTestContent(user) {
  // 使用第一个用户的 token 创建测试内容
  const response = await makeRequest('POST', '/content', {
    text: '这是用于并发测试的内容',
    isBot: false,
  }, user.token);

  return contentId;
}
```

### 3. 并发请求执行
```javascript
// 使用 Promise.allSettled 确保所有请求都完成
const promises = users.map((user, index) => {
  return makeRequest('POST', '/comments', {
    contentId: contentId,
    content: `并发测试评论 #${index + 1}`,
  }, user.token);
});

const results = await Promise.allSettled(promises);
```

### 4. 详细的结果分析
```javascript
// 分类统计结果
const successful = results.filter(r =>
  r.status === 'fulfilled' && r.value.statusCode === 201
);
const failed = results.filter(r =>
  r.status === 'rejected' || r.value.statusCode !== 201
);

// 计算性能指标
const avgResponseTime = duration / results.length;

// 验证数据一致性
const commentCounts = successful.map(r => r.value.data?.data?.total || 0);
const uniqueCounts = [...new Set(commentCounts)];
const consistent = uniqueCounts.length === 1;
```

### 5. 竞态条件检测
```javascript
// 记录初始点赞数
const initialLikes = targetComment.likes || 0;

// 执行并发点赞
await Promise.allSettled(likePromises);

// 验证最终点赞数
const finalLikes = targetComment.likes || 0;
const expectedLikes = initialLikes + successful.length;

if (finalLikes !== expectedLikes) {
  logError(`点赞计数不准确！丢失了 ${expectedLikes - finalLikes} 个点赞`);
  logError('这表明存在竞态条件问题！');
}
```

## 总结

本测试脚本提供了一个全面的并发测试框架，可以有效检测评论系统在高并发场景下的问题，特别是竞态条件。

**关键价值**:
1. 自动化测试流程，无需手动准备测试数据
2. 真实模拟高并发场景
3. 精确检测竞态条件问题
4. 提供详细的性能指标和修复建议

**下一步**:
1. 修复数据库连接问题
2. 运行完整的并发测试
3. 根据测试结果优化点赞功能实现
4. 考虑添加更多并发场景测试（如并发回复评论）

---

**测试脚本位置**: `C:\Users\li\Downloads\who-is-the-bot\services\comment-concurrent-test-improved.js`

**创建时间**: 2026-02-02

**测试工程师**: Claude Sonnet 4.5
