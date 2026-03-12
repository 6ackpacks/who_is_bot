import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserProfileDto, UserActivityDto } from './dto/user-profile.dto';
import { UserAchievement } from '../achievement/user-achievement.entity';
import { Comment } from '../comment/comment.entity';
import { Judgment } from '../judgment/judgment.entity';

/**
 * 排行榜缓存接口
 *
 * 注意：当前使用单实例内存缓存
 *
 * 生产环境多实例部署建议：
 * 1. 使用Redis等分布式缓存替代内存缓存
 * 2. 使用Redis的ZADD/ZRANGE实现排行榜（天然支持排序）
 * 3. 设置合理的TTL（如5分钟）
 * 4. 在统计更新时使用Redis的ZINCRBY原子更新分数
 *
 * Redis实现示例：
 * - 存储：ZADD leaderboard:accuracy {accuracy} {userId}
 * - 查询：ZREVRANGE leaderboard:accuracy 0 49 WITHSCORES
 * - 更新：ZINCRBY leaderboard:accuracy {delta} {userId}
 * - 过期：EXPIRE leaderboard:accuracy 300
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
    @InjectRepository(UserAchievement)
    private userAchievementRepository: Repository<UserAchievement>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Judgment)
    private judgmentRepository: Repository<Judgment>,
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
   * 注意：当前使用单实例内存缓存，多实例部署时缓存会不一致
   * 生产环境建议使用Redis分布式缓存（见下方Redis实现示例）
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

  /* ============================================================================
   * Redis分布式缓存实现示例（用于多实例部署）
   * ============================================================================
   *
   * 1. 安装依赖：npm install ioredis
   *
   * 2. 在构造函数中注入Redis客户端：
   *    constructor(
   *      @InjectRepository(User) private userRepository: Repository<User>,
   *      @Inject('REDIS_CLIENT') private redis: Redis,
   *    ) {}
   *
   * 3. 使用Redis实现排行榜缓存：
   *
   * async getLeaderboard(limit: number = 50): Promise<User[]> {
   *   const cacheKey = 'leaderboard:accuracy';
   *
   *   try {
   *     // 尝试从Redis获取缓存
   *     const cached = await this.redis.get(cacheKey);
   *     if (cached) {
   *       this.logger.debug('Leaderboard cache hit (Redis)');
   *       const users = JSON.parse(cached);
   *       return users.slice(0, limit);
   *     }
   *
   *     // 缓存未命中，查询数据库
   *     this.logger.debug('Leaderboard cache miss, querying database');
   *     const users = await this.userRepository
   *       .createQueryBuilder('user')
   *       .select([...]) // 同上
   *       .where('user.totalJudged >= :minJudged', { minJudged: 5 })
   *       .orderBy('user.accuracy', 'DESC')
   *       .addOrderBy('user.totalJudged', 'DESC')
   *       .limit(100)
   *       .getMany();
   *
   *     // 存入Redis，设置5分钟过期
   *     await this.redis.setex(cacheKey, 300, JSON.stringify(users));
   *
   *     return users.slice(0, limit);
   *   } catch (error) {
   *     this.logger.error(`Failed to fetch leaderboard: ${error.message}`);
   *     throw error;
   *   }
   * }
   *
   * 4. 清除缓存时删除Redis键：
   *
   * private async clearLeaderboardCache(): Promise<void> {
   *   try {
   *     await this.redis.del('leaderboard:accuracy');
   *     this.logger.debug('Cleared leaderboard cache (Redis)');
   *   } catch (error) {
   *     this.logger.error(`Failed to clear cache: ${error.message}`);
   *   }
   * }
   *
   * 5. 使用Redis Sorted Set实现更高效的排行榜（推荐）：
   *
   * // 更新用户分数时
   * async updateUserScore(userId: string, accuracy: number): Promise<void> {
   *   await this.redis.zadd('leaderboard:sorted', accuracy, userId);
   *   await this.redis.expire('leaderboard:sorted', 300);
   * }
   *
   * // 获取排行榜
   * async getLeaderboard(limit: number = 50): Promise<User[]> {
   *   // 获取前N名用户ID（按分数降序）
   *   const userIds = await this.redis.zrevrange('leaderboard:sorted', 0, limit - 1);
   *
   *   if (userIds.length === 0) {
   *     // 缓存为空，重建缓存
   *     return this.rebuildLeaderboardCache(limit);
   *   }
   *
   *   // 批量查询用户详情
   *   const users = await this.userRepository.find({
   *     where: { id: In(userIds) },
   *   });
   *
   *   // 按Redis返回的顺序排序
   *   const userMap = new Map(users.map(u => [u.id, u]));
   *   return userIds.map(id => userMap.get(id)).filter(u => u);
   * }
   *
   * ============================================================================
   */

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

  /**
   * 获取用户完整个人资料
   * 包含所有前端需要的数据：基本信息、统计、成就、评论等
   */
  async getUserProfile(userId: string): Promise<UserProfileDto> {
    // 1. 获取用户基本信息
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 2. 获取成就统计
    const achievementStats = await this.userAchievementRepository
      .createQueryBuilder('ua')
      .select('COUNT(*)', 'unlocked')
      .where('ua.user = :userId', { userId })
      .getRawOne();

    const totalAchievements = await this.userAchievementRepository
      .createQueryBuilder('a')
      .select('COUNT(DISTINCT a.achievement_id)', 'total')
      .getRawOne();

    // 3. 获取评论统计
    const comments = await this.commentRepository.find({
      where: { userId },
      select: ['likes'],
    });

    const totalComments = comments.length;
    const totalLikes = comments.reduce((sum, comment) => sum + comment.likes, 0);

    // 4. 计算等级进度
    const levelInfo = this.calculateLevelProgress(user);

    // 5. 计算正确数
    const correctCount = Math.round((user.totalJudged * user.accuracy) / 100);

    // 6. 组装完整的个人资料数据
    const profile: UserProfileDto = {
      id: user.id,
      nickname: user.nickname,
      uid: user.uid,
      avatar: user.avatar,
      level: user.level,
      levelName: this.getLevelName(user.level),
      totalJudged: user.totalJudged,
      accuracy: Math.round(user.accuracy * 10) / 10,
      correctCount,
      streak: user.streak,
      maxStreak: user.maxStreak,
      weeklyAccuracy: Math.round(user.weeklyAccuracy * 10) / 10,
      weeklyJudged: user.weeklyJudged,
      weeklyCorrect: user.weeklyCorrect,
      progress: levelInfo.progress,
      nextLevel: levelInfo.nextLevel,
      nextLevelRequirement: levelInfo.nextLevelRequirement,
      totalAchievements: parseInt(totalAchievements.total) || 0,
      unlockedAchievements: parseInt(achievementStats.unlocked) || 0,
      totalComments,
      totalLikes,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return profile;
  }

  /**
   * 获取用户活动记录（最近20条）
   * 整合判定、评论、成就三种活动类型
   */
  async getUserActivities(userId: string, limit: number = 20): Promise<UserActivityDto[]> {
    const activities: UserActivityDto[] = [];

    // 1. 获取最近的判定记录（使用JOIN避免N+1问题）
    const judgments = await this.judgmentRepository
      .createQueryBuilder('judgment')
      .leftJoinAndSelect('judgment.content', 'content')
      .where('judgment.userId = :userId', { userId })
      .orderBy('judgment.createdAt', 'DESC')
      .take(10)
      .getMany();

    judgments.forEach((judgment) => {
      activities.push({
        id: judgment.id,
        type: 'judgment',
        title: judgment.isCorrect ? '判定正确' : '判定错误',
        description: `判断「${judgment.content?.title || '内容已删除'}」为 ${judgment.userChoice === 'ai' ? 'AI' : '人类'}`,
        isCorrect: judgment.isCorrect,
        contentId: judgment.contentId,
        contentTitle: judgment.content?.title,
        contentType: judgment.content?.type,
        createdAt: judgment.createdAt,
      });
    });

    // 2. 获取最近的评论记录（使用JOIN避免N+1问题）
    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoin('content', 'content', 'content.id = comment.contentId')
      .select([
        'comment.id AS comment_id',
        'comment.content AS comment_content',
        'comment.contentId AS comment_contentId',
        'comment.createdAt AS comment_createdAt',
        'content.title AS content_title',
        'content.type AS content_type',
      ])
      .where('comment.userId = :userId', { userId })
      .orderBy('comment.createdAt', 'DESC')
      .take(10)
      .getRawMany();

    comments.forEach((comment) => {
      const text = comment.comment_content || '';
      activities.push({
        id: comment.comment_id,
        type: 'comment',
        title: '发表评论',
        description: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        contentId: comment.comment_contentId,
        contentTitle: comment.content_title,
        contentType: comment.content_type,
        createdAt: new Date(comment.comment_createdAt),
      });
    });

    // 3. 获取最近解锁的成就（使用JOIN避免N+1问题）
    const achievements = await this.userAchievementRepository
      .createQueryBuilder('ua')
      .leftJoinAndSelect('ua.achievement', 'achievement')
      .where('ua.userId = :userId', { userId })
      .orderBy('ua.unlockedAt', 'DESC')
      .take(10)
      .getMany();

    achievements.forEach((ua) => {
      activities.push({
        id: ua.id,
        type: 'achievement',
        title: '解锁成就',
        description: `获得「${ua.achievement.name}」成就`,
        achievementIcon: ua.achievement.icon,
        createdAt: ua.unlockedAt,
      });
    });

    // 4. 按时间排序并限制数量
    activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return activities.slice(0, limit);
  }

  /**
   * 更新用户个人资料（头像、昵称）
   */
  async updateProfile(userId: string, data: { avatar?: string; nickname?: string }): Promise<User> {
    const fields: Partial<User> = {};
    if (data.avatar !== undefined) fields.avatar = data.avatar;
    if (data.nickname !== undefined) fields.nickname = data.nickname;
    if (Object.keys(fields).length > 0) {
      await this.userRepository.update(userId, fields);
    }
    return this.findOne(userId);
  }

  /**
   * 计算等级进度
   */
  private calculateLevelProgress(user: User): {
    progress: number;
    nextLevel: string;
    nextLevelRequirement: number;
  } {
    const levelThresholds = [
      { level: 1, name: 'AI小白', requirement: 0 },
      { level: 2, name: '胜似人机', requirement: 10 },
      { level: 3, name: '人机杀手', requirement: 50 },
      { level: 4, name: '硅谷天才', requirement: 100 },
    ];

    const currentLevel = levelThresholds.find(l => l.level === user.level);
    const nextLevelIndex = levelThresholds.findIndex(l => l.level === user.level) + 1;

    if (nextLevelIndex >= levelThresholds.length) {
      // 已达到最高等级
      return {
        progress: 100,
        nextLevel: '已满级',
        nextLevelRequirement: currentLevel.requirement,
      };
    }

    const nextLevel = levelThresholds[nextLevelIndex];
    const currentRequirement = currentLevel.requirement;
    const nextRequirement = nextLevel.requirement;

    // 计算进度百分比
    const progress = Math.min(
      100,
      Math.round(((user.totalJudged - currentRequirement) / (nextRequirement - currentRequirement)) * 100)
    );

    return {
      progress,
      nextLevel: nextLevel.name,
      nextLevelRequirement: nextRequirement,
    };
  }

  /**
   * 获取等级名称
   */
  private getLevelName(level: number): string {
    const levels = ['AI小白', '胜似人机', '人机杀手', '硅谷天才'];
    return levels[level - 1] || 'AI小白';
  }
}
