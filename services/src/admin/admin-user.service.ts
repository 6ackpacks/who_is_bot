import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from '../user/user.entity';
import { Judgment } from '../judgment/judgment.entity';
import { Comment } from '../comment/comment.entity';
import { UserAchievement } from '../achievement/user-achievement.entity';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Judgment)
    private judgmentRepository: Repository<Judgment>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(UserAchievement)
    private userAchievementRepository: Repository<UserAchievement>,
  ) {}

  async findAll(query: QueryUsersDto) {
    try {
      const { page = 1, limit = 20, level, search, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

      // Validate and sanitize sortOrder
      const validSortOrder = sortOrder === 'ASC' || sortOrder === 'DESC' ? sortOrder : 'DESC';

      const queryBuilder = this.userRepository.createQueryBuilder('user');

      // Apply filters
      if (level !== undefined) {
        queryBuilder.andWhere('user.level = :level', { level });
      }

      if (search) {
        queryBuilder.andWhere(
          '(user.nickname LIKE :search OR user.uid LIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Apply sorting
      const validSortFields = ['createdAt', 'totalJudged', 'accuracy'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
      queryBuilder.orderBy(`user.${sortField}`, validSortOrder);

      // Apply pagination
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);

      // Execute query
      const [data, total] = await queryBuilder.getManyAndCount();

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error in AdminUserService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException('用户不存在');
      }

      // Get user achievements
      const achievements = await this.userAchievementRepository.find({
        where: { user: { id } },
        relations: ['achievement', 'user'],
        order: { unlockedAt: 'DESC' },
      });

      // Get recent judgments (last 20)
      const recentJudgments = await this.judgmentRepository.find({
        where: { userId: id },
        order: { createdAt: 'DESC' },
        take: 20,
        relations: ['content'],
      });

      // Get recent comments (last 20)
      const recentComments = await this.commentRepository.find({
        where: { userId: id },
        order: { createdAt: 'DESC' },
        take: 20,
      });

      return {
        user,
        achievements: achievements.map(ua => ({
          ...ua.achievement,
          unlockedAt: ua.unlockedAt,
        })),
        recentJudgments,
        recentComments,
      };
    } catch (error) {
      console.error('Error in AdminUserService.findOne:', error);
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        throw new NotFoundException('用户不存在');
      }

      Object.assign(user, updateUserDto);
      return this.userRepository.save(user);
    } catch (error) {
      console.error('Error in AdminUserService.update:', error);
      throw error;
    }
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const user = this.userRepository.create(createUserDto);
      return this.userRepository.save(user);
    } catch (error) {
      console.error('Error in AdminUserService.create:', error);
      throw error;
    }
  }

  async recalculateStats(id: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        throw new NotFoundException('用户不存在');
      }

      // Get all judgments for this user
      const judgments = await this.judgmentRepository.find({
        where: { userId: id },
        relations: ['content'],
      });

      // Calculate stats
      const totalJudged = judgments.length;
      const correctCount = judgments.filter(j => j.isCorrect).length;
      const accuracy = totalJudged > 0 ? (correctCount / totalJudged) * 100 : 0;

      // Calculate streak
      let currentStreak = 0;
      let maxStreak = 0;
      const sortedJudgments = judgments.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      for (const judgment of sortedJudgments) {
        if (judgment.isCorrect) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }

      // Calculate total bots busted
      const totalBotsBusted = judgments.filter(j =>
        j.isCorrect && j.content?.isAi && j.userChoice === 'ai'
      ).length;

      // Update user stats
      user.totalJudged = totalJudged;
      user.accuracy = accuracy;
      user.streak = currentStreak;
      user.maxStreak = maxStreak;
      user.totalBotsBusted = totalBotsBusted;

      return this.userRepository.save(user);
    } catch (error) {
      console.error('Error in AdminUserService.recalculateStats:', error);
      throw error;
    }
  }
}
