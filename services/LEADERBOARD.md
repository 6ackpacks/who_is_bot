# 排行榜功能文档

## 概述

本文档描述了排行榜系统的完整实现，包括多种排行榜类型、缓存优化、分页支持和性能优化建议。

## 功能特性

### 1. 排行榜类型

系统支持以下8种排行榜类型：

- **global_accuracy**: 全局准确率排行榜
- **global_judgments**: 全局判定次数排行榜
- **weekly_accuracy**: 周准确率排行榜
- **weekly_judgments**: 周判定次数排行榜
- **monthly_accuracy**: 月准确率排行榜（最近30天）
- **monthly_judgments**: 月判定次数排行榜（最近30天）
- **max_streak**: 最高连胜排行榜
- **bots_busted**: AI识破数排行榜

### 2. API 接口

#### 2.1 获取排行榜

```
GET /leaderboard?type=global_accuracy&page=1&limit=50&minJudgments=5
```

**查询参数：**
- `type`: 排行榜类型（可选，默认 global_accuracy）
- `page`: 页码（可选，默认 1）
- `limit`: 每页数量（可选，默认 50，最大 100）
- `minJudgments`: 最少判定次数（可选，默认 5）

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-uuid",
      "username": "用户昵称",
      "nickname": "用户昵称",
      "avatar": "https://...",
      "level": "人机杀手",
      "rank": 1,
      "score": 95.5,
      "accuracy": 95.5,
      "totalJudged": 1000,
      "maxStreak": 50,
      "weeklyAccuracy": 96.0,
      "weeklyJudged": 100
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 500,
    "hasMore": true
  }
}
```

#### 2.2 获取用户排名

```
GET /leaderboard/rank/:userId?type=global_accuracy
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "userId": "user-uuid",
    "rank": 42,
    "score": 85.5,
    "total": 500,
    "percentile": 91.6
  }
}
```

#### 2.3 获取多个排行榜

```
GET /leaderboard/multi?types=global_accuracy,weekly_accuracy&limit=10
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "type": "global_accuracy",
      "users": [...]
    },
    {
      "type": "weekly_accuracy",
      "users": [...]
    }
  ]
}
```

#### 2.4 清除缓存

```
GET /leaderboard/cache/clear?type=global_accuracy
```

清除指定类型或全部排行榜缓存。

## 性能优化

### 1. 缓存策略

- **缓存时间**: 5分钟 TTL
- **缓存范围**: 每个查询参数组合独立缓存
- **缓存清理**: 自动清理过期缓存
- **缓存失效**: 用户统计更新时自动清除相关缓存

### 2. 数据库索引

已创建以下索引以优化查询性能：

**users 表索引：**
```sql
-- 全局准确率排行榜
idx_leaderboard_accuracy (total_judged, accuracy DESC, id)

-- 全局判定次数排行榜
idx_leaderboard_judgments (total_judged DESC, accuracy DESC, id)

-- 周准确率排行榜
idx_weekly_leaderboard_accuracy (weekly_judged, weekly_accuracy DESC, id)

-- 周判定次数排行榜
idx_weekly_leaderboard_judgments (weekly_judged DESC, weekly_accuracy DESC, id)

-- 最高连胜排行榜
idx_leaderboard_max_streak (total_judged, max_streak DESC, accuracy DESC, id)

-- AI识破数排行榜
idx_leaderboard_bots_busted (total_judged, total_bots_busted DESC, accuracy DESC, id)
```

**judgments 表索引：**
```sql
-- 月排行榜查询优化
idx_judgments_monthly_stats (user_id, created_at, is_correct)
idx_judgments_user_time (user_id, created_at DESC)
```

### 3. 查询优化

- 使用复合索引覆盖 WHERE、ORDER BY 和 SELECT 字段
- 限制返回字段，只查询必要数据
- 使用分页减少数据传输量
- 月排行榜使用 LEFT JOIN 和聚合查询

### 4. 生产环境建议

#### 4.1 使用 Redis 分布式缓存

当前实现使用单实例内存缓存，多实例部署时会导致缓存不一致。生产环境建议使用 Redis：

**安装依赖：**
```bash
npm install ioredis @nestjs/cache-manager cache-manager-ioredis
```

**配置 Redis 模块：**
```typescript
// app.module.ts
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      ttl: 300, // 5分钟
    }),
  ],
})
```

**使用 Redis Sorted Set 实现排行榜：**
```typescript
// 更新用户分数
await redis.zadd('leaderboard:accuracy', accuracy, userId);

// 获取排行榜
const userIds = await redis.zrevrange('leaderboard:accuracy', 0, 49);

// 获取用户排名
const rank = await redis.zrevrank('leaderboard:accuracy', userId);
```

#### 4.2 数据库优化

**定期维护：**
```sql
-- 更新统计信息（每天执行）
ANALYZE TABLE users;
ANALYZE TABLE judgments;

-- 优化表（每周执行，低峰期）
OPTIMIZE TABLE users;
OPTIMIZE TABLE judgments;
```

**监控慢查询：**
```sql
-- 启用慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 0.1;

-- 查看慢查询
SELECT * FROM mysql.slow_log
WHERE sql_text LIKE '%leaderboard%'
ORDER BY query_time DESC
LIMIT 10;
```

#### 4.3 读写分离

对于高并发场景，建议使用主从复制：
- 写操作（用户统计更新）使用主库
- 读操作（排行榜查询）使用从库
- 配置 TypeORM 的读写分离

```typescript
TypeOrmModule.forRoot({
  type: 'mysql',
  replication: {
    master: {
      host: 'master-host',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'who_is_bot',
    },
    slaves: [
      {
        host: 'slave-host-1',
        port: 3306,
        username: 'root',
        password: 'password',
        database: 'who_is_bot',
      },
    ],
  },
});
```

## 使用示例

### 前端调用示例

```javascript
// 获取全局准确率排行榜
const response = await fetch('/api/leaderboard?type=global_accuracy&page=1&limit=50');
const { data, pagination } = await response.json();

// 获取用户排名
const rankResponse = await fetch(`/api/leaderboard/rank/${userId}?type=global_accuracy`);
const { data: rankInfo } = await rankResponse.json();

// 获取多个排行榜（首页展示）
const multiResponse = await fetch('/api/leaderboard/multi?types=global_accuracy,weekly_accuracy&limit=10');
const { data: leaderboards } = await multiResponse.json();
```

### 小程序调用示例

```javascript
// 获取排行榜
wx.request({
  url: 'https://api.example.com/leaderboard',
  data: {
    type: 'global_accuracy',
    page: 1,
    limit: 50
  },
  success: (res) => {
    const { data, pagination } = res.data;
    this.setData({
      leaderboard: data,
      hasMore: pagination.hasMore
    });
  }
});
```

## 测试建议

### 1. 单元测试

```typescript
describe('LeaderboardService', () => {
  it('should return global accuracy leaderboard', async () => {
    const result = await service.getLeaderboard({
      type: LeaderboardType.GLOBAL_ACCURACY,
      page: 1,
      limit: 50,
    });
    expect(result.users).toBeDefined();
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it('should return user rank', async () => {
    const rank = await service.getUserRank(userId, LeaderboardType.GLOBAL_ACCURACY);
    expect(rank).toBeDefined();
    expect(rank.rank).toBeGreaterThan(0);
  });
});
```

### 2. 性能测试

```bash
# 使用 Apache Bench 测试
ab -n 1000 -c 10 "http://localhost:3000/leaderboard?type=global_accuracy"

# 使用 wrk 测试
wrk -t4 -c100 -d30s "http://localhost:3000/leaderboard?type=global_accuracy"
```

### 3. 缓存测试

```typescript
// 测试缓存命中
const start1 = Date.now();
await service.getLeaderboard({ type: LeaderboardType.GLOBAL_ACCURACY });
const time1 = Date.now() - start1;

const start2 = Date.now();
await service.getLeaderboard({ type: LeaderboardType.GLOBAL_ACCURACY });
const time2 = Date.now() - start2;

// 第二次应该明显更快（缓存命中）
expect(time2).toBeLessThan(time1 * 0.5);
```

## 故障排查

### 1. 排行榜数据不更新

**原因**: 缓存未失效
**解决**: 调用清除缓存接口或等待 TTL 过期

### 2. 查询性能慢

**原因**: 索引未创建或未生效
**解决**:
```sql
-- 检查索引
SHOW INDEX FROM users;

-- 分析查询计划
EXPLAIN SELECT * FROM users WHERE total_judged >= 5 ORDER BY accuracy DESC LIMIT 50;

-- 更新统计信息
ANALYZE TABLE users;
```

### 3. 月排行榜查询超时

**原因**: judgments 表数据量大，聚合查询慢
**解决**:
- 确保 idx_judgments_monthly_stats 索引存在
- 考虑使用物化视图或定时任务预计算
- 增加缓存时间

## 未来优化方向

1. **实时排行榜**: 使用 Redis Sorted Set 实现实时更新
2. **分段排行榜**: 按等级、地区等维度分段
3. **历史排行榜**: 保存每日/每周/每月的历史排行榜快照
4. **排行榜奖励**: 定时任务发放排行榜奖励
5. **排行榜推送**: WebSocket 实时推送排名变化
