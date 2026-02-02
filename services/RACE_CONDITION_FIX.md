# 竞态条件修复方案

## 问题描述

当前的点赞功能在高并发场景下存在竞态条件，可能导致点赞计数不准确。

## 当前实现（存在问题）

**文件**: `src/comment/comment.service.ts`

```typescript
async likeComment(commentId: string) {
  const comment = await this.commentRepository.findOne({
    where: { id: commentId },
  });

  if (!comment) {
    throw new NotFoundException('评论不存在');
  }

  comment.likes += 1;  // ⚠️ 竞态条件！
  await this.commentRepository.save(comment);

  return {
    success: true,
    likes: comment.likes,
  };
}
```

### 问题分析

这是典型的"读-修改-写"（Read-Modify-Write）模式，在并发场景下会出现以下问题：

```
时间轴示例（20个并发请求）:
T1: 请求1读取 likes = 0
T2: 请求2读取 likes = 0
T3: 请求3读取 likes = 0
...
T20: 请求20读取 likes = 0
T21: 请求1写入 likes = 1
T22: 请求2写入 likes = 1  ← 覆盖了请求1的结果
T23: 请求3写入 likes = 1  ← 覆盖了请求2的结果
...
结果: likes = 1 (应该是 20！)
```

## 修复方案 1: 使用原子递增操作（推荐）

### 优点
- 性能最好
- 实现简单
- 数据库原生支持
- 不需要锁机制

### 实现代码

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

### 生成的 SQL

```sql
UPDATE comments SET likes = likes + 1 WHERE id = ?
```

这个操作是原子的，数据库会确保并发安全。

## 修复方案 2: 使用悲观锁

### 优点
- 完全避免并发冲突
- 适合复杂的业务逻辑

### 缺点
- 性能较差（需要等待锁）
- 可能导致死锁

### 实现代码

```typescript
async likeComment(commentId: string) {
  return await this.commentRepository.manager.transaction(
    async (manager) => {
      // 使用悲观写锁
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
    }
  );
}
```

### 生成的 SQL

```sql
BEGIN;
SELECT * FROM comments WHERE id = ? FOR UPDATE;
UPDATE comments SET likes = ? WHERE id = ?;
COMMIT;
```

## 修复方案 3: 使用乐观锁

### 优点
- 不阻塞其他请求
- 适合冲突较少的场景

### 缺点
- 需要修改数据库表结构
- 冲突时需要重试

### 实现步骤

#### 步骤 1: 修改实体类

```typescript
@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ... 其他字段

  @Column({ type: 'int', default: 0 })
  likes: number;

  @VersionColumn()
  version: number;  // 添加版本号字段

  // ... 其他字段
}
```

#### 步骤 2: 修改数据库表

```sql
ALTER TABLE comments ADD COLUMN version INT DEFAULT 0;
```

#### 步骤 3: 实现点赞逻辑

```typescript
async likeComment(commentId: string, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const comment = await this.commentRepository.findOne({
        where: { id: commentId },
      });

      if (!comment) {
        throw new NotFoundException('评论不存在');
      }

      comment.likes += 1;
      await this.commentRepository.save(comment);

      return {
        success: true,
        likes: comment.likes,
      };
    } catch (error) {
      if (error.name === 'OptimisticLockVersionMismatchError') {
        if (attempt === maxRetries - 1) {
          throw new Error('点赞失败，请重试');
        }
        // 重试
        continue;
      }
      throw error;
    }
  }
}
```

## 修复方案 4: 使用 Redis 缓存层

### 优点
- 性能最好
- 可以处理超高并发
- 减轻数据库压力

### 缺点
- 需要引入 Redis
- 增加系统复杂度
- 需要处理缓存同步

### 实现代码

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import Redis from 'ioredis';

@Injectable()
export class CommentService {
  private redis: Redis;

  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  async likeComment(commentId: string) {
    // 验证评论是否存在
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    // 使用 Redis 的原子递增
    const likes = await this.redis.incr(`comment:${commentId}:likes`);

    // 异步更新数据库（不阻塞响应）
    this.updateDatabaseAsync(commentId, likes);

    return {
      success: true,
      likes: likes,
    };
  }

  private async updateDatabaseAsync(commentId: string, likes: number) {
    try {
      await this.commentRepository
        .createQueryBuilder()
        .update(Comment)
        .set({ likes: likes })
        .where('id = :id', { id: commentId })
        .execute();
    } catch (error) {
      console.error('Failed to update database:', error);
    }
  }

  // 初始化 Redis 缓存
  async initializeCache(commentId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (comment) {
      await this.redis.set(`comment:${commentId}:likes`, comment.likes);
    }
  }
}
```

## 方案对比

| 方案 | 性能 | 复杂度 | 并发安全 | 推荐度 |
|------|------|--------|---------|--------|
| 原子递增 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 悲观锁 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 乐观锁 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Redis | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## 推荐实施步骤

### 第一阶段：立即修复（使用原子递增）

1. 修改 `src/comment/comment.service.ts` 的 `likeComment` 方法
2. 使用方案 1 的代码
3. 运行并发测试验证修复效果

### 第二阶段：性能优化（可选）

如果点赞量非常大，考虑引入 Redis:

1. 安装 Redis 和相关依赖
2. 实现方案 4 的代码
3. 添加缓存预热和同步机制

## 测试验证

修复后，运行并发测试验证:

```bash
cd services
node comment-concurrent-test-improved.js
```

### 预期结果

```
场景 4: 并发点赞评论 (竞态条件测试)
  ✓ 成功: 20/20
  ✗ 失败: 0/20
  ⏱ 总耗时: 198ms
  ⏱ 平均响应: 9.90ms
  📊 初始点赞数: 0
  📊 最终点赞数: 20
  📊 预期点赞数: 20
  ✓ 点赞计数准确性: 通过
  状态: 通过 - 没有竞态条件问题
```

## 完整的修复代码

**文件**: `src/comment/comment.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  // ... 其他方法保持不变

  /**
   * 点赞评论（修复后的版本）
   * 使用原子递增操作避免竞态条件
   */
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
}
```

## 总结

- **推荐方案**: 方案 1（原子递增操作）
- **实施难度**: 低
- **预期效果**: 完全解决竞态条件问题
- **性能影响**: 无负面影响，可能略有提升

---

**创建时间**: 2026-02-02
**作者**: Claude Sonnet 4.5
**项目**: Who is the Bot - 评论系统并发测试
