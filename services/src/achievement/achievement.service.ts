import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from './achievement.entity';
import { UserAchievement } from './user-achievement.entity';
import { User } from '../user/user.entity';

@Injectable()
export class AchievementService {
  constructor(
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    @InjectRepository(UserAchievement)
    private userAchievementRepository: Repository<UserAchievement>,
  ) {}

  /**
   * 检查并解锁用户成就
   */
  async checkAndUnlockAchievements(user: User): Promise<Achievement[]> {
    const newlyUnlocked: Achievement[] = [];

    // 获取所有成就
    const allAchievements = await this.achievementRepository.find();

    // 获取用户已解锁的成就
    const userAchievements = await this.userAchievementRepository.find({
      where: { user: { id: user.id } },
      relations: ['achievement'],
    });

    const unlockedAchievementIds = new Set(
      userAchievements.map(ua => ua.achievement.id)
    );

    // 检查每个成就
    for (const achievement of allAchievements) {
      // 如果已解锁，跳过
      if (unlockedAchievementIds.has(achievement.id)) {
        continue;
      }

      // 检查是否满足解锁条件
      if (this.checkAchievementRequirement(user, achievement)) {
        // 解锁成就
        const userAchievement = this.userAchievementRepository.create({
          user: { id: user.id },
          achievement: { id: achievement.id },
        });
        await this.userAchievementRepository.save(userAchievement);
        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  }

  /**
   * 检查用户是否满足成就条件
   */
  private checkAchievementRequirement(user: User, achievement: Achievement): boolean {
    switch (achievement.type) {
      case 'judgment_count':
        return user.totalJudged >= achievement.requirementValue;

      case 'accuracy':
        return user.accuracy >= achievement.requirementValue;

      case 'streak':
        return user.maxStreak >= achievement.requirementValue;

      default:
        return false;
    }
  }

  /**
   * 获取用户所有成就（包括已解锁和未解锁）
   */
  async getUserAchievements(userId: string) {
    // 获取所有成就
    const allAchievements = await this.achievementRepository.find({
      order: { points: 'ASC' },
    });

    // 获取用户已解锁的成就
    const userAchievements = await this.userAchievementRepository.find({
      where: { user: { id: userId } },
      relations: ['achievement'],
    });

    const unlockedMap = new Map(
      userAchievements.map(ua => [ua.achievement.id, ua.unlockedAt])
    );

    // 组合数据
    return allAchievements.map(achievement => ({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      type: achievement.type,
      requirementValue: achievement.requirementValue,
      points: achievement.points,
      unlocked: unlockedMap.has(achievement.id),
      unlockedAt: unlockedMap.get(achievement.id) || null,
    }));
  }

  /**
   * 获取所有成就定义
   */
  async getAllAchievements() {
    return this.achievementRepository.find({
      order: { points: 'ASC' },
    });
  }
}
