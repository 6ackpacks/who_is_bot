import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from './user.entity';
import { Judgment } from '../judgment/judgment.entity';

/**
 * 排行榜类型枚举
 */
export enum LeaderboardType {
  GLOBAL_ACCURACY = 'global_accuracy',      // 全局准确率排行
  GLOBAL_JUDGMENTS = 'global_judgments',    // 全局判定次数排行
  WEEKLY_ACCURACY = 'weekly_accuracy',      // 周准确率排行
  WEEKLY_JUDGMENTS = 'weekly_judgments',    // 周判定次数排行
  MONTHLY_ACCURACY = 'monthly_accuracy',    // 月准确率排行
  MONTHLY_JUDGMENTS = 'monthly_judgments',  // 月判定次数排行
  MAX_STREAK = 'max_streak',                // 最高连胜排行
  BOTS_BUSTED = 'bots_busted',              // AI识破数排行
}

/**
 * 排行榜查询参数
 */
export interface LeaderboardQuery {
  type: LeaderboardType;
  page?: number;
  limit?: number;
  minJudgments?: number;
}

/**
 * 排行榜响应数据
 */
export interface LeaderboardResponse {
  users: LeaderboardUser[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * 排行榜用户数据
 */
export interface LeaderboardUser {
  id: string;
  nickname: string;
  avatar: string;
  rank: number;
  score: number;
  accuracy?: number;
  totalJudged?: number;
  weeklyAccuracy?: number;
  weeklyJudged?: number;
  maxStreak?: number;
  totalBotsBusted?: number;
  level?: number;
}

/**
 * 用户排名信息
 */
export interface UserRankInfo {
  userId: string;
  rank: number;
  score: number;
  total: number;
  percentile: number;
}

/**
 * 排行榜缓存
 */
interface LeaderboardCache {
  data: LeaderboardResponse;
  timestamp: number;
}

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  // 缓存存储
  private cacheStore: Map<string, LeaderboardCache> = new Map();

  // 缓存配置
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟
  private readonly DEFAULT_LIMIT = 50;
  private readonly MAX_LIMIT = 100;
  private readonly MIN_JUDGMENTS = 5; // 最少判定次数才能上榜

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Judgment)
    private judgmentRepository: Repository<Judgment>,
  ) {}

  /**
   * 获取排行榜
   */
  async getLeaderboard(query: LeaderboardQuery): Promise<LeaderboardResponse> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(query.limit || this.DEFAULT_LIMIT, this.MAX_LIMIT);
    const minJudgments = query.minJudgments || this.MIN_JUDGMENTS;

    // 生成缓存键
    const cacheKey = this.getCacheKey(query.type, page, limit, minJudgments);

    // 检查缓存
    const cached = this.getCache(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return cached;
    }

    this.logger.debug(`Cache miss for ${cacheKey}, querying database`);
    const startTime = Date.now();

    let result: LeaderboardResponse;

    switch (query.type) {
      case LeaderboardType.GLOBAL_ACCURACY:
        result = await this.getGlobalAccuracyLeaderboard(page, limit, minJudgments);
        break;
      case LeaderboardType.GLOBAL_JUDGMENTS:
        result = await this.getGlobalJudgmentsLeaderboard(page, limit, minJudgments);
        break;
      case LeaderboardType.WEEKLY_ACCURACY:
        result = await this.getWeeklyAccuracyLeaderboard(page, limit, minJudgments);
        break;
      case LeaderboardType.WEEKLY_JUDGMENTS:
        result = await this.getWeeklyJudgmentsLeaderboard(page, limit, minJudgments);
        break;
      case LeaderboardType.MONTHLY_ACCURACY:
        result = await this.getMonthlyAccuracyLeaderboard(page, limit, minJudgments);
        break;
      case LeaderboardType.MONTHLY_JUDGMENTS:
        result = await this.getMonthlyJudgmentsLeaderboard(page, limit, minJudgments);
        break;
      case LeaderboardType.MAX_STREAK:
        result = await this.getMaxStreakLeaderboard(page, limit, minJudgments);
        break;
      case LeaderboardType.BOTS_BUSTED:
        result = await this.getBotsBustedLeaderboard(page, limit, minJudgments);
        break;
      default:
        result = await this.getGlobalAccuracyLeaderboard(page, limit, minJudgments);
    }

    const queryTime = Date.now() - startTime;
    this.logger.debug(`Query completed in ${queryTime}ms`);

    // 存入缓存
    this.setCache(cacheKey, result);

    return result;
  }

  /**
   * 获取用户排名
   */
  async getUserRank(userId: string, type: LeaderboardType): Promise<UserRankInfo | null> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return null;
      }

      let rank: number;
      let score: number;
      let total: number;

      switch (type) {
        case LeaderboardType.GLOBAL_ACCURACY:
          score = user.accuracy;
          rank = await this.calculateRank('accuracy', score, user.totalJudged, this.MIN_JUDGMENTS);
          total = await this.getTotalQualifiedUsers(this.MIN_JUDGMENTS);
          break;
        case LeaderboardType.GLOBAL_JUDGMENTS:
          score = user.totalJudged;
          rank = await this.calculateRank('totalJudged', score, user.totalJudged, this.MIN_JUDGMENTS);
          total = await this.getTotalQualifiedUsers(this.MIN_JUDGMENTS);
          break;
        case LeaderboardType.WEEKLY_ACCURACY:
          score = user.weeklyAccuracy;
          rank = await this.calculateRank('weeklyAccuracy', score, user.weeklyJudged, this.MIN_JUDGMENTS);
          total = await this.getTotalQualifiedUsers(this.MIN_JUDGMENTS, 'weekly');
          break;
        case LeaderboardType.WEEKLY_JUDGMENTS:
          score = user.weeklyJudged;
          rank = await this.calculateRank('weeklyJudged', score, user.weeklyJudged, this.MIN_JUDGMENTS);
          total = await this.getTotalQualifiedUsers(this.MIN_JUDGMENTS, 'weekly');
          break;
        case LeaderboardType.MAX_STREAK:
          score = user.maxStreak;
          rank = await this.calculateRank('maxStreak', score, user.totalJudged, this.MIN_JUDGMENTS);
          total = await this.getTotalQualifiedUsers(this.MIN_JUDGMENTS);
          break;
        case LeaderboardType.BOTS_BUSTED:
          score = user.totalBotsBusted;
          rank = await this.calculateRank('totalBotsBusted', score, user.totalJudged, this.MIN_JUDGMENTS);
          total = await this.getTotalQualifiedUsers(this.MIN_JUDGMENTS);
          break;
        default:
          score = user.accuracy;
          rank = await this.calculateRank('accuracy', score, user.totalJudged, this.MIN_JUDGMENTS);
          total = await this.getTotalQualifiedUsers(this.MIN_JUDGMENTS);
      }

      const percentile = total > 0 ? ((total - rank + 1) / total) * 100 : 0;

      return {
        userId,
        rank,
        score,
        total,
        percentile: parseFloat(percentile.toFixed(2)),
      };
    } catch (error) {
      this.logger.error(`Failed to get user rank: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * 清除所有缓存
   */
  clearAllCache(): void {
    this.cacheStore.clear();
    this.logger.debug('Cleared all leaderboard cache');
  }

  /**
   * 清除特定类型的缓存
   */
  clearCacheByType(type: LeaderboardType): void {
    const keysToDelete: string[] = [];
    for (const key of this.cacheStore.keys()) {
      if (key.startsWith(`${type}:`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cacheStore.delete(key));
    this.logger.debug(`Cleared cache for type: ${type}`);
  }

  /**
   * 全局准确率排行榜
   */
  private async getGlobalAccuracyLeaderboard(
    page: number,
    limit: number,
    minJudgments: number,
  ): Promise<LeaderboardResponse> {
    const offset = (page - 1) * limit;

    const [users, total] = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.nickname',
        'user.avatar',
        'user.accuracy',
        'user.totalJudged',
        'user.level',
        'user.maxStreak',
      ])
      .where('user.totalJudged >= :minJudgments', { minJudgments })
      .orderBy('user.accuracy', 'DESC')
      .addOrderBy('user.totalJudged', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return this.formatLeaderboardResponse(users, total, page, limit, offset, 'accuracy');
  }

  /**
   * 全局判定次数排行榜
   */
  private async getGlobalJudgmentsLeaderboard(
    page: number,
    limit: number,
    minJudgments: number,
  ): Promise<LeaderboardResponse> {
    const offset = (page - 1) * limit;

    const [users, total] = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.nickname',
        'user.avatar',
        'user.accuracy',
        'user.totalJudged',
        'user.level',
      ])
      .where('user.totalJudged >= :minJudgments', { minJudgments })
      .orderBy('user.totalJudged', 'DESC')
      .addOrderBy('user.accuracy', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return this.formatLeaderboardResponse(users, total, page, limit, offset, 'totalJudged');
  }

  /**
   * 周准确率排行榜
   */
  private async getWeeklyAccuracyLeaderboard(
    page: number,
    limit: number,
    minJudgments: number,
  ): Promise<LeaderboardResponse> {
    const offset = (page - 1) * limit;

    const [users, total] = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.nickname',
        'user.avatar',
        'user.weeklyAccuracy',
        'user.weeklyJudged',
        'user.level',
      ])
      .where('user.weeklyJudged >= :minJudgments', { minJudgments })
      .orderBy('user.weeklyAccuracy', 'DESC')
      .addOrderBy('user.weeklyJudged', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return this.formatLeaderboardResponse(users, total, page, limit, offset, 'weeklyAccuracy');
  }

  /**
   * 周判定次数排行榜
   */
  private async getWeeklyJudgmentsLeaderboard(
    page: number,
    limit: number,
    minJudgments: number,
  ): Promise<LeaderboardResponse> {
    const offset = (page - 1) * limit;

    const [users, total] = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.nickname',
        'user.avatar',
        'user.weeklyAccuracy',
        'user.weeklyJudged',
        'user.level',
      ])
      .where('user.weeklyJudged >= :minJudgments', { minJudgments })
      .orderBy('user.weeklyJudged', 'DESC')
      .addOrderBy('user.weeklyAccuracy', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return this.formatLeaderboardResponse(users, total, page, limit, offset, 'weeklyJudged');
  }

  /**
   * 月准确率排行榜（基于最近30天的判定记录）
   */
  private async getMonthlyAccuracyLeaderboard(
    page: number,
    limit: number,
    minJudgments: number,
  ): Promise<LeaderboardResponse> {
    const offset = (page - 1) * limit;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 计算每个用户最近30天的准确率
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoin(
        'judgments',
        'judgment',
        'judgment.user_id = user.id AND judgment.created_at >= :thirtyDaysAgo',
        { thirtyDaysAgo },
      )
      .select([
        'user.id',
        'user.nickname',
        'user.avatar',
        'user.level',
      ])
      .addSelect('COUNT(judgment.id)', 'monthlyJudged')
      .addSelect(
        'ROUND(SUM(CASE WHEN judgment.is_correct = true THEN 1 ELSE 0 END) * 100.0 / COUNT(judgment.id), 2)',
        'monthlyAccuracy',
      )
      .groupBy('user.id')
      .having('COUNT(judgment.id) >= :minJudgments', { minJudgments })
      .orderBy('monthlyAccuracy', 'DESC')
      .addOrderBy('monthlyJudged', 'DESC')
      .skip(offset)
      .take(limit);

    const users = await query.getRawMany();
    const totalQuery = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin(
        'judgments',
        'judgment',
        'judgment.user_id = user.id AND judgment.created_at >= :thirtyDaysAgo',
        { thirtyDaysAgo },
      )
      .select('COUNT(DISTINCT user.id)', 'count')
      .groupBy('user.id')
      .having('COUNT(judgment.id) >= :minJudgments', { minJudgments })
      .getRawMany();

    const total = totalQuery.length;

    const formattedUsers: LeaderboardUser[] = users.map((user, index) => ({
      id: user.user_id,
      nickname: user.user_nickname,
      avatar: user.user_avatar,
      level: user.user_level,
      rank: offset + index + 1,
      score: parseFloat(user.monthlyAccuracy) || 0,
      accuracy: parseFloat(user.monthlyAccuracy) || 0,
      totalJudged: parseInt(user.monthlyJudged) || 0,
    }));

    return {
      users: formattedUsers,
      total,
      page,
      limit,
      hasMore: offset + limit < total,
    };
  }

  /**
   * 月判定次数排行榜
   */
  private async getMonthlyJudgmentsLeaderboard(
    page: number,
    limit: number,
    minJudgments: number,
  ): Promise<LeaderboardResponse> {
    const offset = (page - 1) * limit;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoin(
        'judgments',
        'judgment',
        'judgment.user_id = user.id AND judgment.created_at >= :thirtyDaysAgo',
        { thirtyDaysAgo },
      )
      .select([
        'user.id',
        'user.nickname',
        'user.avatar',
        'user.level',
      ])
      .addSelect('COUNT(judgment.id)', 'monthlyJudged')
      .addSelect(
        'ROUND(SUM(CASE WHEN judgment.is_correct = true THEN 1 ELSE 0 END) * 100.0 / COUNT(judgment.id), 2)',
        'monthlyAccuracy',
      )
      .groupBy('user.id')
      .having('COUNT(judgment.id) >= :minJudgments', { minJudgments })
      .orderBy('monthlyJudged', 'DESC')
      .addOrderBy('monthlyAccuracy', 'DESC')
      .skip(offset)
      .take(limit);

    const users = await query.getRawMany();
    const totalQuery = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin(
        'judgments',
        'judgment',
        'judgment.user_id = user.id AND judgment.created_at >= :thirtyDaysAgo',
        { thirtyDaysAgo },
      )
      .select('COUNT(DISTINCT user.id)', 'count')
      .groupBy('user.id')
      .having('COUNT(judgment.id) >= :minJudgments', { minJudgments })
      .getRawMany();

    const total = totalQuery.length;

    const formattedUsers: LeaderboardUser[] = users.map((user, index) => ({
      id: user.user_id,
      nickname: user.user_nickname,
      avatar: user.user_avatar,
      level: user.user_level,
      rank: offset + index + 1,
      score: parseInt(user.monthlyJudged) || 0,
      totalJudged: parseInt(user.monthlyJudged) || 0,
      accuracy: parseFloat(user.monthlyAccuracy) || 0,
    }));

    return {
      users: formattedUsers,
      total,
      page,
      limit,
      hasMore: offset + limit < total,
    };
  }

  /**
   * 最高连胜排行榜
   */
  private async getMaxStreakLeaderboard(
    page: number,
    limit: number,
    minJudgments: number,
  ): Promise<LeaderboardResponse> {
    const offset = (page - 1) * limit;

    const [users, total] = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.nickname',
        'user.avatar',
        'user.maxStreak',
        'user.totalJudged',
        'user.accuracy',
        'user.level',
      ])
      .where('user.totalJudged >= :minJudgments', { minJudgments })
      .orderBy('user.maxStreak', 'DESC')
      .addOrderBy('user.accuracy', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return this.formatLeaderboardResponse(users, total, page, limit, offset, 'maxStreak');
  }

  /**
   * AI识破数排行榜
   */
  private async getBotsBustedLeaderboard(
    page: number,
    limit: number,
    minJudgments: number,
  ): Promise<LeaderboardResponse> {
    const offset = (page - 1) * limit;

    const [users, total] = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.nickname',
        'user.avatar',
        'user.totalBotsBusted',
        'user.totalJudged',
        'user.accuracy',
        'user.level',
      ])
      .where('user.totalJudged >= :minJudgments', { minJudgments })
      .orderBy('user.totalBotsBusted', 'DESC')
      .addOrderBy('user.accuracy', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return this.formatLeaderboardResponse(users, total, page, limit, offset, 'totalBotsBusted');
  }

  /**
   * 格式化排行榜响应
   */
  private formatLeaderboardResponse(
    users: User[],
    total: number,
    page: number,
    limit: number,
    offset: number,
    scoreField: string,
  ): LeaderboardResponse {
    const formattedUsers: LeaderboardUser[] = users.map((user, index) => {
      const baseUser: LeaderboardUser = {
        id: user.id,
        nickname: user.nickname || '匿名用户',
        avatar: this.getValidAvatar(user.avatar, user.nickname),
        rank: offset + index + 1,
        score: this.getScoreValue(user, scoreField),
        level: user.level,
      };

      // 添加额外字段
      if (user.accuracy !== undefined) baseUser.accuracy = Math.round(user.accuracy * 10) / 10;
      if (user.totalJudged !== undefined) baseUser.totalJudged = user.totalJudged;
      if (user.weeklyAccuracy !== undefined) baseUser.weeklyAccuracy = Math.round(user.weeklyAccuracy * 10) / 10;
      if (user.weeklyJudged !== undefined) baseUser.weeklyJudged = user.weeklyJudged;
      if (user.maxStreak !== undefined) baseUser.maxStreak = user.maxStreak;
      if (user.totalBotsBusted !== undefined) baseUser.totalBotsBusted = user.totalBotsBusted;

      return baseUser;
    });

    return {
      users: formattedUsers,
      total,
      page,
      limit,
      hasMore: offset + limit < total,
    };
  }

  /**
   * 获取分数值
   */
  private getScoreValue(user: User, field: string): number {
    const value = user[field];
    return typeof value === 'number' ? (field.includes('accuracy') ? Math.round(value * 10) / 10 : value) : 0;
  }

  /**
   * 获取有效头像
   */
  private getValidAvatar(avatar: string | null, nickname: string): string {
    if (avatar && !avatar.includes('example.com') && !avatar.includes('placeholder.com')) {
      return avatar;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nickname || 'user')}`;
  }

  /**
   * 计算用户排名
   */
  private async calculateRank(
    field: string,
    score: number,
    totalJudged: number,
    minJudgments: number,
  ): Promise<number> {
    const fieldMap = {
      accuracy: 'user.accuracy',
      totalJudged: 'user.totalJudged',
      weeklyAccuracy: 'user.weeklyAccuracy',
      weeklyJudged: 'user.weeklyJudged',
      maxStreak: 'user.maxStreak',
      totalBotsBusted: 'user.totalBotsBusted',
    };

    const dbField = fieldMap[field] || 'user.accuracy';
    const judgedField = field.startsWith('weekly') ? 'user.weeklyJudged' : 'user.totalJudged';

    const count = await this.userRepository
      .createQueryBuilder('user')
      .where(`${judgedField} >= :minJudgments`, { minJudgments })
      .andWhere(`${dbField} > :score`, { score })
      .getCount();

    return count + 1;
  }

  /**
   * 获取符合条件的总用户数
   */
  private async getTotalQualifiedUsers(minJudgments: number, period: 'global' | 'weekly' = 'global'): Promise<number> {
    const field = period === 'weekly' ? 'user.weeklyJudged' : 'user.totalJudged';
    return this.userRepository
      .createQueryBuilder('user')
      .where(`${field} >= :minJudgments`, { minJudgments })
      .getCount();
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(type: LeaderboardType, page: number, limit: number, minJudgments: number): string {
    return `${type}:${page}:${limit}:${minJudgments}`;
  }

  /**
   * 获取缓存
   */
  private getCache(key: string): LeaderboardResponse | null {
    const cached = this.cacheStore.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_TTL) {
      this.cacheStore.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * 设置缓存
   */
  private setCache(key: string, data: LeaderboardResponse): void {
    this.cacheStore.set(key, {
      data,
      timestamp: Date.now(),
    });

    // 清理过期缓存
    this.cleanExpiredCache();
  }

  /**
   * 清理过期缓存
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, cache] of this.cacheStore.entries()) {
      if (now - cache.timestamp > this.CACHE_TTL) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cacheStore.delete(key));

    if (keysToDelete.length > 0) {
      this.logger.debug(`Cleaned ${keysToDelete.length} expired cache entries`);
    }
  }
}
