import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User } from '../user/user.entity';
import { Content } from '../content/content.entity';
import { Judgment } from '../judgment/judgment.entity';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    @InjectRepository(Judgment)
    private judgmentRepository: Repository<Judgment>,
  ) {}

  /**
   * 获取数据概览统计
   */
  async getStats() {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // 总用户数
      const totalUsers = await this.userRepository.count().catch(err => {
        this.logger.error('Failed to count users', err);
        return 0;
      });

      // 总内容数
      const totalContent = await this.contentRepository.count().catch(err => {
        this.logger.error('Failed to count content', err);
        return 0;
      });

      // 总判定次数
      const totalJudgments = await this.judgmentRepository.count().catch(err => {
        this.logger.error('Failed to count judgments', err);
        return 0;
      });

      // 今日活跃用户（今日有判定记录的用户）
      let todayActiveUsersCount = 0;
      try {
        const todayActiveUsers = await this.judgmentRepository
          .createQueryBuilder('judgment')
          .select('COUNT(DISTINCT judgment.userId)', 'count')
          .where('judgment.createdAt >= :todayStart', { todayStart })
          .getRawOne();
        todayActiveUsersCount = parseInt(todayActiveUsers?.count, 10) || 0;
      } catch (err) {
        this.logger.error('Failed to get today active users', err);
      }

      // 今日新增内容
      const todayNewContent = await this.contentRepository
        .count({ where: { createdAt: MoreThanOrEqual(todayStart) } })
        .catch(err => {
          this.logger.error('Failed to count today new content', err);
          return 0;
        });

      // 今日判定次数
      const todayJudgments = await this.judgmentRepository
        .count({ where: { createdAt: MoreThanOrEqual(todayStart) } })
        .catch(err => {
          this.logger.error('Failed to count today judgments', err);
          return 0;
        });

      return {
        totalUsers,
        totalContent,
        totalJudgments,
        todayActiveUsers: todayActiveUsersCount,
        todayNewContent,
        todayJudgments,
      };
    } catch (error) {
      this.logger.error('Failed to get stats', error);
      // 返回默认值而不是抛出错误
      return {
        totalUsers: 0,
        totalContent: 0,
        totalJudgments: 0,
        todayActiveUsers: 0,
        todayNewContent: 0,
        todayJudgments: 0,
      };
    }
  }

  /**
   * 获取图表数据
   */
  async getCharts() {
    try {
      // 用户增长趋势（最近30天）
      const userGrowth = await this.getUserGrowthTrend(30);

      // 内容类型分布
      const contentTypeDistribution = await this.getContentTypeDistribution();

      // 判定准确率趋势（最近30天）
      const accuracyTrend = await this.getAccuracyTrend(30);

      // 热门内容排行（前10）
      const hotContent = await this.getHotContent(10);

      return {
        userGrowth,
        contentTypeDistribution,
        accuracyTrend,
        hotContent,
      };
    } catch (error) {
      this.logger.error('Failed to get charts', error);
      // 返回空数据而不是抛出错误
      return {
        userGrowth: [],
        contentTypeDistribution: [],
        accuracyTrend: [],
        hotContent: [],
      };
    }
  }

  /**
   * 获取用户增长趋势
   */
  private async getUserGrowthTrend(days: number) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const result = await this.userRepository
        .createQueryBuilder('user')
        .select('DATE(user.createdAt)', 'date')
        .addSelect('COUNT(*)', 'count')
        .where('user.createdAt >= :startDate', { startDate })
        .groupBy('DATE(user.createdAt)')
        .orderBy('date', 'ASC')
        .getRawMany();

      return result.map(item => ({
        date: item.date,
        count: parseInt(item.count, 10) || 0,
      }));
    } catch (error) {
      this.logger.error('Failed to get user growth trend', error);
      return [];
    }
  }

  /**
   * 获取内容类型分布
   */
  private async getContentTypeDistribution() {
    try {
      const result = await this.contentRepository
        .createQueryBuilder('content')
        .select('content.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .groupBy('content.type')
        .getRawMany();

      return result.map(item => ({
        type: item.type || 'unknown',
        count: parseInt(item.count, 10) || 0,
      }));
    } catch (error) {
      this.logger.error('Failed to get content type distribution', error);
      return [];
    }
  }

  /**
   * 获取判定准确率趋势
   */
  private async getAccuracyTrend(days: number) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const result = await this.judgmentRepository
        .createQueryBuilder('judgment')
        .select('DATE(judgment.createdAt)', 'date')
        .addSelect('COUNT(*)', 'total')
        .addSelect('SUM(CASE WHEN judgment.isCorrect = true THEN 1 ELSE 0 END)', 'correct')
        .where('judgment.createdAt >= :startDate', { startDate })
        .groupBy('DATE(judgment.createdAt)')
        .orderBy('date', 'ASC')
        .getRawMany();

      return result.map(item => {
        const total = parseInt(item.total, 10) || 0;
        const correct = parseInt(item.correct, 10) || 0;
        const accuracy = total > 0 ? (correct / total) * 100 : 0;

        return {
          date: item.date,
          accuracy: parseFloat(accuracy.toFixed(2)),
        };
      });
    } catch (error) {
      this.logger.error('Failed to get accuracy trend', error);
      return [];
    }
  }

  /**
   * 获取热门内容排行
   */
  private async getHotContent(limit: number) {
    try {
      const contents = await this.contentRepository
        .createQueryBuilder('content')
        .orderBy('content.total_votes', 'DESC')
        .limit(limit)
        .getMany();

      return contents.map(content => ({
        id: content.id,
        title: content.title || 'Untitled',
        type: content.type || 'unknown',
        totalVotes: content.totalVotes || 0,
        accuracy: content.totalVotes > 0
          ? parseFloat(((content.correctVotes / content.totalVotes) * 100).toFixed(2))
          : 0,
        createdAt: content.createdAt,
      }));
    } catch (error) {
      this.logger.error('Failed to get hot content', error);
      return [];
    }
  }
}
