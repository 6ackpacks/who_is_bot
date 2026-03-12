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
   * 优化：使用单次JOIN查询避免N+1问题
   */
  async getUserAchievements(userId: string) {
    // 使用LEFT JOIN一次性获取所有成就及用户解锁状态
    const achievementsWithStatus = await this.achievementRepository
      .createQueryBuilder('achievement')
      .leftJoin(
        'user_achievements',
        'ua',
        'ua.achievement_id = achievement.id AND ua.user_id = :userId',
        { userId }
      )
      .select([
        'achievement.id',
        'achievement.name',
        'achievement.description',
        'achievement.icon',
        'achievement.type',
        'achievement.requirement_value',
        'achievement.points',
        'ua.unlocked_at',
      ])
      .orderBy('achievement.points', 'ASC')
      .getRawMany();

    // 格式化数据
    return achievementsWithStatus.map(row => ({
      id: row.achievement_id,
      name: row.achievement_name,
      description: row.achievement_description,
      icon: row.achievement_icon,
      type: row.achievement_type,
      requirementValue: row.achievement_requirement_value,
      points: row.achievement_points,
      unlocked: !!row.ua_unlocked_at,
      unlockedAt: row.ua_unlocked_at || null,
    }));
  }

  /**
   * 获取用户成就进度
   * 返回用户当前进度与成就要求的对比
   */
  async getUserAchievementProgress(userId: string) {
    // 获取用户信息
    const user = await this.achievementRepository.manager.findOne(User, {
      where: { id: userId },
    });

    if (!user) {
      return [];
    }

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

    // 计算每个成就的进度
    return allAchievements.map(achievement => {
      const unlocked = unlockedMap.has(achievement.id);
      let currentValue = 0;
      let progress = 0;

      // 根据成就类型获取当前进度
      if (!unlocked) {
        switch (achievement.type) {
          case 'judgment_count':
            currentValue = user.totalJudged;
            break;
          case 'accuracy':
            currentValue = user.accuracy;
            break;
          case 'streak':
            currentValue = user.maxStreak;
            break;
        }
        progress = Math.min(100, Math.round((currentValue / achievement.requirementValue) * 100));
      } else {
        progress = 100;
        currentValue = achievement.requirementValue;
      }

      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        type: achievement.type,
        requirementValue: achievement.requirementValue,
        currentValue,
        progress,
        points: achievement.points,
        unlocked,
        unlockedAt: unlockedMap.get(achievement.id) || null,
      };
    });
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
