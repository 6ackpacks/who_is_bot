import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

/**
 * 排行榜缓存接口
 */
interface LeaderboardCache {
  data: User[];
  timestamp: number;
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  // 排行榜缓存
  private leaderboardCache: LeaderboardCache | null = null;

  // 缓存配置
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存
  private readonly CACHE_SIZE = 100; // 缓存前100名用户

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async findByUid(uid: string): Promise<User> {
    return this.userRepository.findOne({
      where: { uid },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async updateStats(id: string, accuracy: number, totalJudged: number, streak: number): Promise<User> {
    await this.userRepository.update(id, { accuracy, totalJudged, streak });

    // 清除排行榜缓存，因为用户统计已更新
    this.clearLeaderboardCache();

    return this.findOne(id);
  }

  /**
   * 获取排行榜（带缓存优化）
   *
   * 性能优化策略：
   * 1. 使用内存缓存，5分钟TTL
   * 2. 缓存前100名用户，满足大部分查询需求
   * 3. 数据库查询使用复合索引 (accuracy, totalJudged)
   * 4. 用户统计更新时自动清除缓存
   *
   * @param limit 返回的用户数量，默认50
   * @returns 排行榜用户列表
   */
  async getLeaderboard(limit: number = 50): Promise<User[]> {
    const now = Date.now();

    // 检查缓存是否有效
    if (this.leaderboardCache && (now - this.leaderboardCache.timestamp) < this.CACHE_TTL) {
      this.logger.debug(`Leaderboard cache hit (age: ${now - this.leaderboardCache.timestamp}ms)`);
      return this.leaderboardCache.data.slice(0, limit);
    }

    // 缓存未命中或已过期，查询数据库
    this.logger.debug('Leaderboard cache miss, querying database');
    const startTime = Date.now();

    try {
      // 优化的查询：使用索引，限制返回字段，缓存更多数据
      const users = await this.userRepository
        .createQueryBuilder('user')
        .select([
          'user.id',
          'user.nickname',
          'user.uid',
          'user.avatar',
          'user.accuracy',
          'user.totalJudged',
          'user.correctCount',
          'user.streak',
          'user.maxStreak',
          'user.totalBotsBusted',
          'user.weeklyAccuracy',
          'user.weeklyJudged',
          'user.weeklyCorrect',
          'user.level',
        ])
        .where('user.totalJudged >= :minJudged', { minJudged: 5 })
        .orderBy('user.accuracy', 'DESC')
        .addOrderBy('user.totalJudged', 'DESC')
        .limit(this.CACHE_SIZE) // 缓存前100名
        .getMany();

      const queryTime = Date.now() - startTime;
      this.logger.debug(`Database query completed in ${queryTime}ms, cached ${users.length} users`);

      // 更新缓存
      this.leaderboardCache = {
        data: users,
        timestamp: now,
      };

      return users.slice(0, limit);
    } catch (error) {
      this.logger.error(`Failed to fetch leaderboard: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 清除排行榜缓存
   * 在用户统计更新时调用，确保数据一致性
   */
  private clearLeaderboardCache(): void {
    if (this.leaderboardCache) {
      this.logger.debug('Clearing leaderboard cache due to stats update');
      this.leaderboardCache = null;
    }
  }

  /**
   * 手动清除排行榜缓存（供外部调用）
   */
  public invalidateLeaderboardCache(): void {
    this.clearLeaderboardCache();
  }

  async updateLeaderboardStats(
    id: string,
    totalBotsBusted: number,
    maxStreak: number,
    weeklyAccuracy: number,
    weeklyJudged: number,
    weeklyCorrect: number,
  ): Promise<User> {
    await this.userRepository.update(id, {
      totalBotsBusted,
      maxStreak,
      weeklyAccuracy,
      weeklyJudged,
      weeklyCorrect,
    });

    // 清除排行榜缓存
    this.clearLeaderboardCache();

    return this.findOne(id);
  }

  async resetWeeklyStats(): Promise<void> {
    await this.userRepository.update({}, {
      weeklyAccuracy: 0,
      weeklyJudged: 0,
      weeklyCorrect: 0,
      lastWeekReset: new Date(),
    });

    // 清除排行榜缓存
    this.clearLeaderboardCache();
  }
}
