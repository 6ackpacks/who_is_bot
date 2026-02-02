import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Judgment } from './judgment.entity';
import { Content } from '../content/content.entity';
import { User } from '../user/user.entity';
import { SubmitJudgmentDto } from './dto/submit-judgment.dto';

@Injectable()
export class JudgmentService {
  constructor(
    @InjectRepository(Judgment)
    private judgmentRepository: Repository<Judgment>,
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async submitJudgment(dto: SubmitJudgmentDto) {
    // 使用事务确保数据一致性
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 检查是否已经判定过
      const existingJudgment = await queryRunner.manager.findOne(Judgment, {
        where: dto.userId
          ? { userId: dto.userId, contentId: dto.contentId }
          : { guestId: dto.guestId, contentId: dto.contentId },
      });

      if (existingJudgment) {
        await queryRunner.rollbackTransaction();
        return {
          success: false,
          message: '您已经判定过这个内容了',
          code: 'ALREADY_JUDGED',
        };
      }

      // 2. 为游客创建或获取临时用户记录
      let effectiveUserId = dto.userId;
      if (!dto.userId && dto.guestId) {
        const guestUser = await this.getOrCreateGuestUser(dto.guestId, queryRunner);
        effectiveUserId = guestUser.id;
      }

      // 3. 记录判定
      const judgment = queryRunner.manager.create(Judgment, {
        userId: effectiveUserId || null,
        contentId: dto.contentId,
        userChoice: dto.userChoice,
        isCorrect: dto.isCorrect,
        guestId: dto.guestId || null,
      });

      await queryRunner.manager.save(judgment);

      // 4. 更新内容统计
      await this.updateContentStatsInTransaction(dto, queryRunner);

      // 5. 更新用户统计（登录用户或游客临时用户）
      if (effectiveUserId) {
        await this.updateUserStatsInTransaction({ ...dto, userId: effectiveUserId }, queryRunner);
      }

      // 6. 获取更新后的内容统计数据
      const updatedContent = await queryRunner.manager.findOne(Content, {
        where: { id: dto.contentId },
      });

      // 提交事务
      await queryRunner.commitTransaction();

      // 计算统计百分比
      const contentStats = {
        totalVotes: updatedContent.totalVotes,
        aiVotes: updatedContent.aiVotes,
        humanVotes: updatedContent.humanVotes,
        correctVotes: updatedContent.correctVotes,
        aiPercentage: updatedContent.totalVotes > 0
          ? Math.round((updatedContent.aiVotes / updatedContent.totalVotes) * 100)
          : 0,
        humanPercentage: updatedContent.totalVotes > 0
          ? Math.round((updatedContent.humanVotes / updatedContent.totalVotes) * 100)
          : 0,
        correctPercentage: updatedContent.totalVotes > 0
          ? Math.round((updatedContent.correctVotes / updatedContent.totalVotes) * 100)
          : 0,
      };

      return {
        success: true,
        message: '判定已记录',
        stats: contentStats,
      };
    } catch (error) {
      // 回滚事务
      await queryRunner.rollbackTransaction();
      console.error('提交判定失败:', error);
      throw error;
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }

  /**
   * 更新内容统计（事务版本）
   * 使用原子操作避免并发竞态条件
   */
  private async updateContentStatsInTransaction(dto: SubmitJudgmentDto, queryRunner: any) {
    // 使用原子递增操作，避免读-改-写的竞态条件
    // 总投票数始终递增
    await queryRunner.manager.increment(
      Content,
      { id: dto.contentId },
      'totalVotes',
      1
    );

    // 根据用户选择递增对应的投票数
    if (dto.userChoice === 'ai') {
      await queryRunner.manager.increment(
        Content,
        { id: dto.contentId },
        'aiVotes',
        1
      );
    } else {
      await queryRunner.manager.increment(
        Content,
        { id: dto.contentId },
        'humanVotes',
        1
      );
    }

    // 如果判定正确，递增正确投票数
    if (dto.isCorrect) {
      await queryRunner.manager.increment(
        Content,
        { id: dto.contentId },
        'correctVotes',
        1
      );
    }
  }

  /**
   * 更新用户统计（事务版本）
   * 使用悲观锁和原子操作避免并发竞态条件
   */
  private async updateUserStatsInTransaction(dto: SubmitJudgmentDto, queryRunner: any) {
    // 使用悲观写锁（FOR UPDATE）锁定用户记录，防止并发更新
    const user = await queryRunner.manager
      .createQueryBuilder(User, 'user')
      .setLock('pessimistic_write')
      .where('user.id = :id', { id: dto.userId })
      .getOne();

    if (user) {
      // 更新总判定数
      user.totalJudged += 1;

      // 更新正确数和连胜
      if (dto.isCorrect) {
        user.correctCount += 1;
        user.streak += 1;
        user.maxStreak = Math.max(user.maxStreak, user.streak);
      } else {
        user.streak = 0;
      }

      // 计算总体准确率
      user.accuracy = (user.correctCount / user.totalJudged) * 100;

      // 更新周统计
      user.weeklyJudged += 1;
      if (dto.isCorrect) {
        user.weeklyCorrect += 1;
      }
      user.weeklyAccuracy = (user.weeklyCorrect / user.weeklyJudged) * 100;

      // 检查并更新等级
      const newLevel = this.calculateUserLevel(user);
      if (newLevel > user.level) {
        user.level = newLevel;
      }

      await queryRunner.manager.save(user);
    }
  }

  /**
   * 更新内容统计（非事务版本，保留用于其他地方调用）
   */
  private async updateContentStats(dto: SubmitJudgmentDto) {
    const content = await this.contentRepository.findOne({
      where: { id: dto.contentId },
    });

    if (content) {
      content.totalVotes += 1;

      if (dto.userChoice === 'ai') {
        content.aiVotes += 1;
      } else {
        content.humanVotes += 1;
      }

      if (dto.isCorrect) {
        content.correctVotes += 1;
      }

      await this.contentRepository.save(content);
    }
  }

  /**
   * 更新用户统计
   */
  private async updateUserStats(dto: SubmitJudgmentDto) {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });

    if (user) {
      // 更新总判定数
      user.totalJudged += 1;

      // 更新正确数和连胜
      if (dto.isCorrect) {
        user.correctCount += 1;
        user.streak += 1;
        user.maxStreak = Math.max(user.maxStreak, user.streak);
      } else {
        user.streak = 0;
      }

      // 计算总体准确率
      user.accuracy = (user.correctCount / user.totalJudged) * 100;

      // 更新周统计
      user.weeklyJudged += 1;
      if (dto.isCorrect) {
        user.weeklyCorrect += 1;
      }
      user.weeklyAccuracy = (user.weeklyCorrect / user.weeklyJudged) * 100;

      // 检查并更新等级
      const newLevel = this.calculateUserLevel(user);
      if (newLevel > user.level) {
        user.level = newLevel;
      }

      await this.userRepository.save(user);
    }
  }

  /**
   * 计算用户等级
   * 等级规则：
   * - 1级 (AI小白): 0-9次判定
   * - 2级 (胜似人机): 10-49次判定
   * - 3级 (人机杀手): 50-99次判定
   * - 4级 (硅谷天才): 100+次判定
   */
  private calculateUserLevel(user: User): number {
    const judged = user.totalJudged;
    if (judged >= 100) return 4;
    if (judged >= 50) return 3;
    if (judged >= 10) return 2;
    return 1;
  }

  async getUserJudgments(userId: string) {
    const judgments = await this.judgmentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 20,
    });

    // 获取每个判定对应的内容信息
    const judgmentsWithContent = await Promise.all(
      judgments.map(async (judgment) => {
        const content = await this.contentRepository.findOne({
          where: { id: judgment.contentId },
        });

        return {
          id: judgment.id,
          contentId: judgment.contentId,
          contentTitle: content ? content.title : '内容已删除',
          contentType: content ? content.type : 'text',
          userChoice: judgment.userChoice,
          isCorrect: judgment.isCorrect,
          createdAt: judgment.createdAt,
        };
      })
    );

    return judgmentsWithContent;
  }

  /**
   * 为游客创建或获取临时用户记录（支持事务）
   * 游客用户使用 guestId 作为 uid，可以追踪统计数据
   */
  private async getOrCreateGuestUser(guestId: string, queryRunner?: any): Promise<User> {
    // 如果提供了 queryRunner，使用事务版本
    if (queryRunner) {
      // 尝试查找已存在的游客用户（通过 uid = guestId）
      let guestUser = await queryRunner.manager.findOne(User, {
        where: { uid: guestId },
      });

      // 如果不存在，创建新的游客用户
      if (!guestUser) {
        const randomSuffix = Math.floor(Math.random() * 10000);
        guestUser = queryRunner.manager.create(User, {
          uid: guestId,
          nickname: `游客${randomSuffix}`,
          avatar: 'https://via.placeholder.com/100/0F111A/00F2FF?text=Guest',
          level: 1,
          accuracy: 0,
          totalJudged: 0,
          correctCount: 0,
          streak: 0,
          maxStreak: 0,
          totalBotsBusted: 0,
          weeklyAccuracy: 0,
          weeklyJudged: 0,
          weeklyCorrect: 0,
          lastWeekReset: new Date(),
        });

        await queryRunner.manager.save(guestUser);
        console.log(`创建游客临时用户: ${guestId} -> ${guestUser.id}`);
      }

      return guestUser;
    }

    // 否则使用非事务版本
    // 尝试查找已存在的游客用户（通过 uid = guestId）
    let guestUser = await this.userRepository.findOne({
      where: { uid: guestId },
    });

    // 如果不存在，创建新的游客用户
    if (!guestUser) {
      const randomSuffix = Math.floor(Math.random() * 10000);
      guestUser = this.userRepository.create({
        uid: guestId,
        nickname: `游客${randomSuffix}`,
        avatar: 'https://via.placeholder.com/100/0F111A/00F2FF?text=Guest',
        level: 1,
        accuracy: 0,
        totalJudged: 0,
        correctCount: 0,
        streak: 0,
        maxStreak: 0,
        totalBotsBusted: 0,
        weeklyAccuracy: 0,
        weeklyJudged: 0,
        weeklyCorrect: 0,
        lastWeekReset: new Date(),
      });

      await this.userRepository.save(guestUser);
      console.log(`创建游客临时用户: ${guestId} -> ${guestUser.id}`);
    }

    return guestUser;
  }
}
