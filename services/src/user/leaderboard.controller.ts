import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getLeaderboard(@Query('limit') limit?: string, @Query('type') type?: string) {
    const limitNum = limit ? parseInt(limit) : 50;
    const users = await this.userService.getLeaderboard(limitNum);

    // 格式化数据以匹配前端需求
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.nickname, // 前端期望 username 字段
      nickname: user.nickname, // 保留 nickname 以兼容
      avatar: user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anonymous',
      level: this.getLevelName(user.level),
      totalJudged: user.totalJudged,
      maxStreak: user.maxStreak,
      accuracy: Math.round(user.accuracy * 10) / 10, // 总体准确率，保留一位小数
      weeklyAccuracy: Math.round(user.weeklyAccuracy * 10) / 10, // 周准确率，保留一位小数
    }));

    return {
      success: true,
      data: formattedUsers,
    };
  }

  private getLevelName(level: number): string {
    const levels = ['AI小白', '胜似人机', '人机杀手', '硅谷天才'];
    return levels[level - 1] || 'AI小白';
  }
}
// Force rebuild 2026年03月 6日 20:16:21
