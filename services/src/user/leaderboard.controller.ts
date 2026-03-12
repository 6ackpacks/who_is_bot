import { Controller, Get, Query, Param, BadRequestException, Logger } from '@nestjs/common';
import { UserService } from './user.service';
import { LeaderboardService, LeaderboardType } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  private readonly logger = new Logger(LeaderboardController.name);

  constructor(
    private readonly userService: UserService,
    private readonly leaderboardService: LeaderboardService,
  ) {}

  /**
   * 获取排行榜
   * GET /leaderboard?type=global_accuracy&page=1&limit=50&minJudgments=5
   */
  @Get()
  async getLeaderboard(
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('minJudgments') minJudgments?: string,
  ) {
    try {
      // 默认使用全局准确率排行榜
      const leaderboardType = this.parseLeaderboardType(type);
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 50;
      const minJudgmentsNum = minJudgments ? parseInt(minJudgments, 10) : 5;

      // 验证参数
      if (pageNum < 1) {
        throw new BadRequestException('Page must be greater than 0');
      }
      if (limitNum < 1 || limitNum > 100) {
        throw new BadRequestException('Limit must be between 1 and 100');
      }
      if (minJudgmentsNum < 0) {
        throw new BadRequestException('MinJudgments must be non-negative');
      }

      const result = await this.leaderboardService.getLeaderboard({
        type: leaderboardType,
        page: pageNum,
        limit: limitNum,
        minJudgments: minJudgmentsNum,
      });

      // 格式化数据以匹配前端需求
      const formattedUsers = result.users.map(user => ({
        id: user.id,
        username: user.nickname, // 前端期望 username 字段
        nickname: user.nickname, // 保留 nickname 以兼容
        avatar: user.avatar,
        level: this.getLevelName(user.level || 1),
        rank: user.rank,
        score: user.score,
        totalJudged: user.totalJudged,
        maxStreak: user.maxStreak,
        accuracy: user.accuracy,
        weeklyAccuracy: user.weeklyAccuracy,
        weeklyJudged: user.weeklyJudged,
        totalBotsBusted: user.totalBotsBusted,
      }));

      return {
        success: true,
        data: formattedUsers,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          hasMore: result.hasMore,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get leaderboard: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取用户排名
   * GET /leaderboard/rank/:userId?type=global_accuracy
   */
  @Get('rank/:userId')
  async getUserRank(
    @Param('userId') userId: string,
    @Query('type') type?: string,
  ) {
    try {
      const leaderboardType = this.parseLeaderboardType(type);
      const rankInfo = await this.leaderboardService.getUserRank(userId, leaderboardType);

      if (!rankInfo) {
        return {
          success: false,
          message: 'User not found or not qualified for ranking',
        };
      }

      return {
        success: true,
        data: rankInfo,
      };
    } catch (error) {
      this.logger.error(`Failed to get user rank: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取多个排行榜类型（用于首页展示）
   * GET /leaderboard/multi?types=global_accuracy,weekly_accuracy&limit=10
   */
  @Get('multi')
  async getMultipleLeaderboards(
    @Query('types') types?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const typeList = types ? types.split(',') : ['global_accuracy', 'weekly_accuracy'];
      const limitNum = limit ? parseInt(limit, 10) : 10;

      const results = await Promise.all(
        typeList.map(async (type) => {
          const leaderboardType = this.parseLeaderboardType(type);
          const result = await this.leaderboardService.getLeaderboard({
            type: leaderboardType,
            page: 1,
            limit: limitNum,
            minJudgments: 5,
          });

          return {
            type,
            users: result.users.map(user => ({
              id: user.id,
              username: user.nickname,
              nickname: user.nickname,
              avatar: user.avatar,
              level: this.getLevelName(user.level || 1),
              rank: user.rank,
              score: user.score,
              accuracy: user.accuracy,
              totalJudged: user.totalJudged,
            })),
          };
        }),
      );

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      this.logger.error(`Failed to get multiple leaderboards: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 清除排行榜缓存（管理员接口）
   * POST /leaderboard/cache/clear?type=global_accuracy
   */
  @Get('cache/clear')
  async clearCache(@Query('type') type?: string) {
    try {
      if (type) {
        const leaderboardType = this.parseLeaderboardType(type);
        this.leaderboardService.clearCacheByType(leaderboardType);
      } else {
        this.leaderboardService.clearAllCache();
      }

      return {
        success: true,
        message: 'Cache cleared successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to clear cache: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 解析排行榜类型
   */
  private parseLeaderboardType(type?: string): LeaderboardType {
    if (!type) {
      return LeaderboardType.GLOBAL_ACCURACY;
    }

    const typeMap: Record<string, LeaderboardType> = {
      global_accuracy: LeaderboardType.GLOBAL_ACCURACY,
      global: LeaderboardType.GLOBAL_ACCURACY,          // 别名
      global_judgments: LeaderboardType.GLOBAL_JUDGMENTS,
      weekly_accuracy: LeaderboardType.WEEKLY_ACCURACY,
      weekly: LeaderboardType.WEEKLY_ACCURACY,          // 前端使用的别名
      weekly_judgments: LeaderboardType.WEEKLY_JUDGMENTS,
      monthly_accuracy: LeaderboardType.MONTHLY_ACCURACY,
      monthly: LeaderboardType.MONTHLY_ACCURACY,        // 别名
      monthly_judgments: LeaderboardType.MONTHLY_JUDGMENTS,
      max_streak: LeaderboardType.MAX_STREAK,
      streak: LeaderboardType.MAX_STREAK,               // 别名
      bots_busted: LeaderboardType.BOTS_BUSTED,
    };

    const leaderboardType = typeMap[type.toLowerCase()];
    if (!leaderboardType) {
      // 未知类型默认返回全局准确率榜，不抛出错误
      return LeaderboardType.GLOBAL_ACCURACY;
    }

    return leaderboardType;
  }

  /**
   * 获取等级名称
   */
  private getLevelName(level: number): string {
    const levels = ['AI小白', '胜似人机', '人机杀手', '硅谷天才'];
    return levels[level - 1] || 'AI小白';
  }
}
