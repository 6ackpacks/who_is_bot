import { Controller, Get, Param } from '@nestjs/common';
import { AchievementService } from './achievement.service';

@Controller('achievement')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  /**
   * 获取用户成就列表
   */
  @Get('user/:userId')
  async getUserAchievements(@Param('userId') userId: string) {
    try {
      const achievements = await this.achievementService.getUserAchievements(userId);
      return {
        success: true,
        data: achievements,
      };
    } catch (error) {
      return {
        success: false,
        message: '获取成就列表失败',
        error: error.message,
      };
    }
  }

  /**
   * 获取所有成就定义
   */
  @Get('all')
  async getAllAchievements() {
    try {
      const achievements = await this.achievementService.getAllAchievements();
      return {
        success: true,
        data: achievements,
      };
    } catch (error) {
      return {
        success: false,
        message: '获取成就定义失败',
        error: error.message,
      };
    }
  }
}
