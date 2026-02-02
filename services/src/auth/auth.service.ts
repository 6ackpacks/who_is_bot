import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';
import { MockLoginDto } from './dto/mock-login.dto';
import { v4 as uuidv4 } from 'uuid';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * Generate JWT access token
   */
  private generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      uid: user.uid,
      nickname: user.nickname,
    };
    return this.jwtService.sign(payload);
  }

  /**
   * 模拟登录（开发测试用）
   * 根据昵称创建或获取用户
   */
  async mockLogin(dto: MockLoginDto) {
    // 生成模拟的uid（使用昵称+随机数）
    const mockUid = `mock_${dto.nickname}_${Date.now()}`;

    // 检查是否已存在该昵称的用户
    let user = await this.userRepository.findOne({
      where: { nickname: dto.nickname },
    });

    if (user) {
      // 用户已存在，更新登录时间
      user.updatedAt = new Date();
      await this.userRepository.save(user);
    } else {
      // 创建新用户
      user = this.userRepository.create({
        id: uuidv4(),
        nickname: dto.nickname,
        uid: mockUid,
        avatar: dto.avatar || 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
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
      });

      await this.userRepository.save(user);
    }

    // Generate JWT token
    const accessToken = this.generateAccessToken(user);

    return {
      id: user.id,
      nickname: user.nickname,
      uid: user.uid,
      avatar: user.avatar,
      level: user.level,
      accuracy: user.accuracy,
      totalJudged: user.totalJudged,
      streak: user.streak,
      maxStreak: user.maxStreak,
      accessToken,
    };
  }

  /**
   * 根据uid获取用户信息
   */
  async getUserByUid(uid: string) {
    const user = await this.userRepository.findOne({
      where: { uid },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return {
      id: user.id,
      nickname: user.nickname,
      uid: user.uid,
      avatar: user.avatar,
      level: user.level,
      accuracy: user.accuracy,
      totalJudged: user.totalJudged,
      correctCount: user.correctCount,
      streak: user.streak,
      maxStreak: user.maxStreak,
      totalBotsBusted: user.totalBotsBusted,
      weeklyAccuracy: user.weeklyAccuracy,
      weeklyJudged: user.weeklyJudged,
      weeklyCorrect: user.weeklyCorrect,
    };
  }

  /**
   * Validate user by ID (used by JWT strategy)
   */
  async validateUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }
}
