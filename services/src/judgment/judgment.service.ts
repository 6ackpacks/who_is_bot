import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ) {}

  async submitJudgment(dto: SubmitJudgmentDto) {
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

        await this.userRepository.save(user);
      }
    }

    return {
      success: true,
      message: '判定已记录',
    };
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
