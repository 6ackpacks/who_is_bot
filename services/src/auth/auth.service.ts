import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';
import { MockLoginDto } from './dto/mock-login.dto';
import { WxLoginDto } from './dto/wx-login.dto';
import { v4 as uuidv4 } from 'uuid';
import { JwtPayload } from './jwt.strategy';
import { WeChatService } from '../wechat/wechat.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private wechatService: WeChatService,
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
   * 微信登录
   * 使用微信登录码获取用户信息并创建/更新用户
   */
  async wxLogin(dto: WxLoginDto) {
    // 1. 调用微信 API 获取 openid 和 session_key
    const wxData = await this.wechatService.code2Session(dto.code);

    // 2. 查找是否已存在该 uid 的用户（使用 openid 作为 uid）
    let user = await this.userRepository.findOne({
      where: { uid: wxData.openid },
    });

    // 验证头像URL是否有效
    const isValidAvatarUrl = (url: string | undefined): boolean => {
      if (!url) return false;
      if (url.includes('example.com')) return false;
      if (url.includes('placeholder.com')) return false;
      if (!url.startsWith('https://')) return false;
      return true;
    };

    // 生成默认头像（仅在微信头像无效时使用）
    const getDefaultAvatar = (nickname: string): string => {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nickname || 'User')}`;
    };

    // 使用微信头像或默认头像
    const avatarUrl = isValidAvatarUrl(dto.avatarUrl)
      ? dto.avatarUrl
      : getDefaultAvatar(dto.nickName);

    const now = new Date().toISOString();

    if (user) {
      // 用户已存在，更新用户信息
      // Only update nickname if the new one is not the default placeholder
      if (dto.nickName && dto.nickName !== '微信用户') {
        user.nickname = dto.nickName;
      }

      // Only update avatar if the new one is a valid non-default URL.
      // If the user already has a valid custom avatar and the incoming one is
      // a dicebear default (generated because WeChat sent no real avatar),
      // keep the existing avatar to avoid overwriting a user's chosen photo.
      const isNewAvatarValid = isValidAvatarUrl(avatarUrl) && !avatarUrl.includes('dicebear.com');
      const hasExistingAvatar = isValidAvatarUrl(user.avatar);

      if (isNewAvatarValid && user.avatar !== avatarUrl) {
        // Incoming avatar is a real (non-default) URL — accept it
        user.avatar = avatarUrl;
        user.avatarUpdateTime = now;
      } else if (!hasExistingAvatar) {
        // User has no valid avatar at all — use whatever we got (even a default)
        user.avatar = avatarUrl;
        user.avatarUpdateTime = now;
      }
      // If user already has a valid avatar and new one is a dicebear default,
      // do nothing — preserve the existing custom avatar.

      user.gender = dto.gender;
      user.city = dto.city;
      user.updatedAt = new Date();
      await this.userRepository.save(user);
    } else {
      // 创建新用户
      user = this.userRepository.create({
        id: uuidv4(),
        nickname: dto.nickName,
        uid: wxData.openid, // 使用 openid 作为 uid
        avatar: avatarUrl,
        avatarUpdateTime: now,
        gender: dto.gender,
        city: dto.city,
        level: 1,
        accuracy: 0,
        totalJudged: 0,
        streak: 0,
        maxStreak: 0,
        totalBotsBusted: 0,
        weeklyAccuracy: 0,
        weeklyJudged: 0,
        weeklyCorrect: 0,
      });

      await this.userRepository.save(user);
    }

    // 3. 生成 JWT token
    const accessToken = this.generateAccessToken(user);

    // 4. 返回用户信息和 token
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

    // 生成默认头像
    const defaultAvatar = dto.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(dto.nickname || 'User')}`;

    if (user) {
      // 用户已存在，只在用户尚无有效头像时才更新头像
      if (!user.avatar || user.avatar.includes('example.com') || user.avatar.includes('placeholder.com')) {
        user.avatar = defaultAvatar;
      }
      user.updatedAt = new Date();
      await this.userRepository.save(user);
    } else {
      // 创建新用户
      user = this.userRepository.create({
        id: uuidv4(),
        nickname: dto.nickname,
        uid: mockUid,
        avatar: defaultAvatar,
        level: 1,
        accuracy: 0,
        totalJudged: 0,
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

    // Calculate correctCount from totalJudged and accuracy
    const correctCount = Math.round((user.totalJudged * user.accuracy) / 100);

    return {
      id: user.id,
      nickname: user.nickname,
      uid: user.uid,
      avatar: user.avatar,
      level: user.level,
      accuracy: user.accuracy,
      totalJudged: user.totalJudged,
      correctCount: correctCount,
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
