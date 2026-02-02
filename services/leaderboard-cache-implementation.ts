/**
 * 排行榜缓存优化实现示例
 *
 * 此文件展示如何为排行榜功能添加 Redis 缓存
 *
 * 安装依赖:
 * npm install @nestjs/cache-manager cache-manager
 * npm install cache-manager-redis-store
 * npm install @types/cache-manager-redis-store --save-dev
 */

// ============================================
// 1. 配置 Redis 缓存模块
// ============================================

// app.module.ts
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      ttl: 300, // 默认缓存时间 5分钟
      max: 100, // 最大缓存项数
    }),
    // ... 其他模块
  ],
})
export class AppModule {}

// ============================================
// 2. 优化后的 UserService
// ============================================

// user.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  /**
   * 获取排行榜（带缓存）
   */
  async getLeaderboard(limit: number = 50): Promise<User[]> {
    const cacheKey = `leaderboard:${limit}`;

    // 1. 尝试从缓存获取
    const cached = await this.cacheManager.get<User[]>(cacheKey);
    if (cached) {
      console.log(`[Cache Hit] Leaderboard with limit ${limit}`);
      return cached;
    }

    console.log(`[Cache Miss] Querying database for leaderboard with limit ${limit}`);

    // 2. 缓存未命中，查询数据库
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.totalJudged >= :minJudged', { minJudged: 5 })
      .orderBy('user.accuracy', 'DESC')
      .addOrderBy('user.totalJudged', 'DESC')
      .take(limit)
      .getMany();

    // 3. 存入缓存（5分钟）
    await this.cacheManager.set(cacheKey, users, 300);

    return users;
  }

  /**
   * 获取用户统计（带缓存）
   */
  async findOne(id: string): Promise<User> {
    const cacheKey = `user:${id}`;

    // 尝试从缓存获取
    const cached = await this.cacheManager.get<User>(cacheKey);
    if (cached) {
      console.log(`[Cache Hit] User ${id}`);
      return cached;
    }

    console.log(`[Cache Miss] Querying database for user ${id}`);

    // 查询数据库
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (user) {
      // 存入缓存（10分钟）
      await this.cacheManager.set(cacheKey, user, 600);
    }

    return user;
  }

  /**
   * 更新用户统计（清除相关缓存）
   */
  async updateStats(
    id: string,
    accuracy: number,
    totalJudged: number,
    streak: number,
  ): Promise<User> {
    // 更新数据库
    await this.userRepository.update(id, { accuracy, totalJudged, streak });

    // 清除用户缓存
    await this.cacheManager.del(`user:${id}`);

    // 清除所有排行榜缓存
    await this.clearLeaderboardCache();

    return this.findOne(id);
  }

  /**
   * 更新排行榜统计（清除相关缓存）
   */
  async updateLeaderboardStats(
    id: string,
    totalBotsBusted: number,
    maxStreak: number,
    weeklyAccuracy: number,
    weeklyJudged: number,
    weeklyCorrect: number,
  ): Promise<User> {
    // 更新数据库
    await this.userRepository.update(id, {
      totalBotsBusted,
      maxStreak,
      weeklyAccuracy,
      weeklyJudged,
      weeklyCorrect,
    });

    // 清除用户缓存
    await this.cacheManager.del(`user:${id}`);

    // 清除所有排行榜缓存
    await this.clearLeaderboardCache();

    return this.findOne(id);
  }

  /**
   * 清除所有排行榜缓存
   */
  private async clearLeaderboardCache(): Promise<void> {
    const limits = [10, 20, 50, 100];
    for (const limit of limits) {
      await this.cacheManager.del(`leaderboard:${limit}`);
    }
    console.log('[Cache] Cleared all leaderboard caches');
  }

  /**
   * 重置周统计（清除所有缓存）
   */
  async resetWeeklyStats(): Promise<void> {
    await this.userRepository.update({}, {
      weeklyAccuracy: 0,
      weeklyJudged: 0,
      weeklyCorrect: 0,
      lastWeekReset: new Date(),
    });

    // 清除所有缓存
    await this.cacheManager.reset();
    console.log('[Cache] Cleared all caches after weekly reset');
  }
}

// ============================================
// 3. 使用拦截器自动缓存（可选）
// ============================================

// cache.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = this.getCacheKey(request);

    // 只缓存 GET 请求
    if (request.method !== 'GET') {
      return next.handle();
    }

    // 尝试从缓存获取
    const cachedResponse = await this.cacheManager.get(cacheKey);
    if (cachedResponse) {
      console.log(`[HTTP Cache Hit] ${cacheKey}`);
      return of(cachedResponse);
    }

    console.log(`[HTTP Cache Miss] ${cacheKey}`);

    // 执行请求并缓存结果
    return next.handle().pipe(
      tap(async (response) => {
        await this.cacheManager.set(cacheKey, response, 300);
      }),
    );
  }

  private getCacheKey(request: any): string {
    const { url, query } = request;
    return `http:${url}:${JSON.stringify(query)}`;
  }
}

// 在控制器中使用
// leaderboard.controller.ts
import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { HttpCacheInterceptor } from '../common/interceptors/cache.interceptor';

@Controller('leaderboard')
@UseInterceptors(HttpCacheInterceptor)
export class LeaderboardController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getLeaderboard(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 50;
    const users = await this.userService.getLeaderboard(limitNum);

    // 格式化数据
    const formattedUsers = users.map(user => ({
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anonymous',
      level: this.getLevelName(user.level),
      totalJudged: user.totalJudged,
      maxStreak: user.maxStreak,
      weeklyAccuracy: Math.round(user.weeklyAccuracy * 10) / 10,
    }));

    return {
      success: true,
      data: formattedUsers,
    };
  }

  private getLevelName(level: number): string {
    const levels = ['AI小白', '胜似人机', '人机杀手', '硅谷天才'];
    return levels[level - 1] || 'AI小白';
  }
}

// ============================================
// 4. 定时预计算排行榜（可选）
// ============================================

// leaderboard.scheduler.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserService } from '../user/user.service';

@Injectable()
export class LeaderboardScheduler {
  constructor(private readonly userService: UserService) {}

  /**
   * 每5分钟预计算排行榜
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async precomputeLeaderboard() {
    console.log('[Scheduler] Precomputing leaderboard...');

    try {
      // 预计算不同 limit 的排行榜
      const limits = [10, 20, 50, 100];

      for (const limit of limits) {
        await this.userService.getLeaderboard(limit);
        console.log(`[Scheduler] Precomputed leaderboard with limit ${limit}`);
      }

      console.log('[Scheduler] Leaderboard precomputation completed');
    } catch (error) {
      console.error('[Scheduler] Error precomputing leaderboard:', error);
    }
  }

  /**
   * 每周一凌晨重置周统计
   */
  @Cron('0 0 * * 1') // 每周一 00:00
  async resetWeeklyStats() {
    console.log('[Scheduler] Resetting weekly stats...');

    try {
      await this.userService.resetWeeklyStats();
      console.log('[Scheduler] Weekly stats reset completed');
    } catch (error) {
      console.error('[Scheduler] Error resetting weekly stats:', error);
    }
  }
}

// ============================================
// 5. 环境变量配置
// ============================================

// .env
/*
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Cache Configuration
CACHE_TTL=300
CACHE_MAX_ITEMS=100
*/

// ============================================
// 6. 缓存监控和统计
// ============================================

// cache-stats.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheStatsService {
  private hits = 0;
  private misses = 0;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  recordHit() {
    this.hits++;
  }

  recordMiss() {
    this.misses++;
  }

  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      total,
      hitRate: hitRate.toFixed(2) + '%',
    };
  }

  reset() {
    this.hits = 0;
    this.misses = 0;
  }
}

// ============================================
// 7. 使用说明
// ============================================

/*
## 安装步骤

1. 安装依赖:
   npm install @nestjs/cache-manager cache-manager cache-manager-redis-store
   npm install @types/cache-manager-redis-store --save-dev

2. 安装 Redis:
   - Windows: 下载 Redis for Windows
   - Linux: sudo apt-get install redis-server
   - macOS: brew install redis

3. 启动 Redis:
   redis-server

4. 配置环境变量:
   在 .env 文件中添加 Redis 配置

5. 更新代码:
   - 在 app.module.ts 中注册 CacheModule
   - 更新 user.service.ts 添加缓存逻辑
   - 可选: 添加定时任务预计算排行榜

6. 测试:
   运行并发测试验证性能提升

## 预期效果

- 响应时间: 从 100ms 降低到 5-10ms
- 数据库负载: 减少 90%+
- 缓存命中率: 预期 80%+
- 吞吐量: 提升 5-10倍

## 注意事项

1. 缓存失效策略:
   - 用户统计更新时清除相关缓存
   - 定期刷新排行榜缓存
   - 周统计重置时清除所有缓存

2. 缓存一致性:
   - 确保更新操作后清除缓存
   - 使用事务保证数据一致性

3. 内存管理:
   - 设置合理的 TTL
   - 限制缓存项数量
   - 监控 Redis 内存使用

4. 容错处理:
   - Redis 不可用时降级到数据库查询
   - 添加错误日志和监控
*/

export {
  UserService,
  HttpCacheInterceptor,
  LeaderboardScheduler,
  CacheStatsService,
};
