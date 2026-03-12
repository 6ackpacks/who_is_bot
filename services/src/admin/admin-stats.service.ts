import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from '../user/user.entity';
import { Content } from '../content/content.entity';
import { Judgment } from '../judgment/judgment.entity';
import { Comment } from '../comment/comment.entity';

@Injectable()
export class AdminStatsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    @InjectRepository(Judgment)
    private judgmentRepository: Repository<Judgment>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  /**
   * 获取总体统计数据
   */
  async getOverview() {
    const [
      totalUsers,
      totalContent,
      totalJudgments,
      totalComments,
      activeUsersToday,
      activeUsersWeek,
    ] = await Promise.all([
      this.userRepository.count(),
      this.contentRepository.count(),
      this.judgmentRepository.count(),
      this.commentRepository.count(),
      this.getActiveUserCount(1),
      this.getActiveUserCount(7),
    ]);

    // 计算平均准确率
    const avgAccuracy = await this.userRepository
      .createQueryBuilder('user')
      .select('AVG(user.accuracy)', 'avgAccuracy')
      .getRawOne();

    // 获取 AI 和人类内容数量
    const [aiContent, humanContent] = await Promise.all([
      this.contentRepository.count({ where: { isAi: true } }),
      this.contentRepository.count({ where: { isAi: false } }),
    ]);

    return {
      users: {
        total: totalUsers,
        activeToday: activeUsersToday,
        activeWeek: activeUsersWeek,
      },
      content: {
        total: totalContent,
        ai: aiContent,
        human: humanContent,
      },
      judgments: {
        total: totalJudgments,
        avgAccuracy: parseFloat(avgAccuracy?.avgAccuracy || '0'),
      },
      comments: {
        total: totalComments,
      },
    };
  }

  /**
   * 获取用户增长趋势
   */
  async getUserGrowth(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const users = await this.userRepository
      .createQueryBuilder('user')
      .select('DATE(user.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('user.createdAt >= :startDate', { startDate })
      .groupBy('DATE(user.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      days,
      data: users.map(u => ({
        date: u.date,
        count: parseInt(u.count, 10),
      })),
    };
  }

  /**
   * 获取内容统计
   */
  async getContentStats() {
    const stats = await this.contentRepository
      .createQueryBuilder('content')
      .select('content.type', 'type')
      .addSelect('content.isAi', 'isAi')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(content.totalVotes)', 'avgVotes')
      .addSelect('SUM(content.totalVotes)', 'totalVotes')
      .groupBy('content.type, content.isAi')
      .getRawMany();

    return {
      byType: stats.map(s => ({
        type: s.type,
        isAi: s.isAi === 1,
        count: parseInt(s.count, 10),
        avgVotes: parseFloat(s.avgVotes || '0'),
        totalVotes: parseInt(s.totalVotes || '0', 10),
      })),
    };
  }

  /**
   * 获取判定准确率统计
   */
  async getAccuracyStats() {
    const stats = await this.judgmentRepository
      .createQueryBuilder('judgment')
      .select('judgment.isCorrect', 'isCorrect')
      .addSelect('COUNT(*)', 'count')
      .groupBy('judgment.isCorrect')
      .getRawMany();

    const total = stats.reduce((sum, s) => sum + parseInt(s.count, 10), 0);
    const correct = stats.find(s => s.isCorrect === 1)?.count || 0;

    return {
      total,
      correct: parseInt(correct, 10),
      incorrect: total - parseInt(correct, 10),
      accuracy: total > 0 ? (parseInt(correct, 10) / total) * 100 : 0,
    };
  }

  /**
   * 获取活跃用户统计
   */
  async getActiveUsers(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activeUsers = await this.judgmentRepository
      .createQueryBuilder('judgment')
      .select('judgment.userId', 'userId')
      .addSelect('COUNT(*)', 'judgmentCount')
      .where('judgment.createdAt >= :startDate', { startDate })
      .groupBy('judgment.userId')
      .orderBy('judgmentCount', 'DESC')
      .limit(100)
      .getRawMany();

    const userIds = activeUsers.map(u => u.userId);
    const users = await this.userRepository.findByIds(userIds);
    const userMap = new Map(users.map(u => [u.id, u]));

    return {
      days,
      data: activeUsers.map(u => {
        const user = userMap.get(u.userId);
        return {
          userId: u.userId,
          nickname: user?.nickname || '未知用户',
          avatar: user?.avatar,
          judgmentCount: parseInt(u.judgmentCount, 10),
        };
      }),
    };
  }

  /**
   * 获取热门内容排行
   */
  async getTopContent(limit: number = 10) {
    const contents = await this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.author', 'author')
      .orderBy('content.totalVotes', 'DESC')
      .limit(limit)
      .getMany();

    return {
      data: contents.map(c => ({
        id: c.id,
        title: c.title,
        type: c.type,
        isAi: c.isAi,
        totalVotes: c.totalVotes,
        correctVotes: c.correctVotes,
        accuracy: c.totalVotes > 0 ? (c.correctVotes / c.totalVotes) * 100 : 0,
        author: c.author ? {
          id: c.author.id,
          nickname: c.author.nickname,
        } : null,
        createdAt: c.createdAt,
      })),
    };
  }

  /**
   * 获取活跃用户数量
   */
  private async getActiveUserCount(days: number): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.judgmentRepository
      .createQueryBuilder('judgment')
      .select('COUNT(DISTINCT judgment.userId)', 'count')
      .where('judgment.createdAt >= :startDate', { startDate })
      .getRawOne();

    return parseInt(result?.count || '0', 10);
  }
}
