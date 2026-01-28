import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Judgment } from './judgment.entity';
import { Content } from '../content/content.entity';
import { User } from '../user/user.entity';
import { SubmitJudgmentDto } from './dto/submit-judgment.dto';
import { AchievementService } from '../achievement/achievement.service';
import { RateLimitService } from '../common/rate-limit.service';

@Injectable()
export class JudgmentService {
  constructor(
    @InjectRepository(Judgment)
    private judgmentRepository: Repository<Judgment>,
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(forwardRef(() => AchievementService))
    private achievementService: AchievementService,
    private rateLimitService: RateLimitService,
  ) {}

  async submitJudgment(dto: SubmitJudgmentDto) {
    // 频率限制检查
    const identifier = dto.userId || dto.guestId;
    if (!this.rateLimitService.checkLimit(identifier)) {
      const resetTime = this.rateLimitService.getResetTime(identifier);
      return {
        success: false,
        message: `请求过于频繁，请在 ${resetTime} 秒后重试`,
        code: 'RATE_LIMIT_EXCEEDED',
      };
    }

    // 防刷机制：检查是否已经判定过这个内容
    const existingJudgment = await this.judgmentRepository.findOne({
      where: dto.userId
        ? { user: { id: dto.userId }, content: { id: dto.contentId } }
        : { guestId: dto.guestId, content: { id: dto.contentId } },
    });

    if (existingJudgment) {
      return {
        success: false,
        message: '您已经判定过这个内容了',
        code: 'ALREADY_JUDGED',
      };
    }

    // 1. 记录判定
    const judgment = this.judgmentRepository.create({
      user: dto.userId ? { id: dto.userId } : null,
      content: { id: dto.contentId },
      userChoice: dto.userChoice,
      isCorrect: dto.isCorrect,
      guestId: dto.guestId,
    });
    await this.judgmentRepository.save(judgment);

    // 2. 更新内容统计
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
      // 更新正确投票数
      if (dto.isCorrect) {
        content.correctVotes += 1;
      }
      await this.contentRepository.save(content);
    }

    // 3. 更新用户统计（仅登录用户）
    if (dto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: dto.userId },
      });

      if (user) {
        user.totalJudged += 1;

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
        const leveledUp = newLevel > user.level;
        if (leveledUp) {
          user.level = newLevel;
        }

        await this.userRepository.save(user);

        // 检查并解锁成就
        const newAchievements = await this.achievementService.checkAndUnlockAchievements(user);

        return {
          success: true,
          message: '判定已记录',
          data: {
            leveledUp,
            newLevel: leveledUp ? newLevel : undefined,
            newAchievements: newAchievements.length > 0 ? newAchievements : undefined,
          },
        };
      }
    }

    return {
      success: true,
      message: '判定已记录',
    };
  }

  /**
   * 计算用户等级
   * 等级规则：
   * 1. AI小白: 0次判定
   * 2. 胜似人机: 100次判定 + 70%准确率
   * 3. 人机杀手: 500次判定 + 80%准确率
   * 4. 硅谷天才: 1000次判定 + 90%准确率
   */
  private calculateUserLevel(user: any): number {
    const levelThresholds = [
      { level: 4, minJudged: 1000, minAccuracy: 90 },  // 硅谷天才
      { level: 3, minJudged: 500, minAccuracy: 80 },   // 人机杀手
      { level: 2, minJudged: 100, minAccuracy: 70 },   // 胜似人机
      { level: 1, minJudged: 0, minAccuracy: 0 },      // AI小白
    ];

    for (const threshold of levelThresholds) {
      if (user.totalJudged >= threshold.minJudged &&
          user.accuracy >= threshold.minAccuracy) {
        return threshold.level;
      }
    }

    return 1; // 默认等级
  }

  async getUserJudgments(userId: string) {
    return this.judgmentRepository.find({
      where: { user: { id: userId } },
      relations: ['content'],
      order: { createdAt: 'DESC' },
    });
  }

  async getContentJudgments(contentId: string) {
    return this.judgmentRepository.find({
      where: { content: { id: contentId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}
