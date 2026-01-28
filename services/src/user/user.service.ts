import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['contents', 'comments'],
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
    return this.findOne(id);
  }

  async getLeaderboard(limit: number = 50): Promise<User[]> {
    return this.userRepository.find({
      order: {
        totalJudged: 'DESC',  // 按总判定数排序
        accuracy: 'DESC',      // 准确率作为第二排序
      },
      take: limit,
    });
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
    return this.findOne(id);
  }

  async resetWeeklyStats(): Promise<void> {
    await this.userRepository.update({}, {
      weeklyAccuracy: 0,
      weeklyJudged: 0,
      weeklyCorrect: 0,
      lastWeekReset: new Date(),
    });
  }
}
