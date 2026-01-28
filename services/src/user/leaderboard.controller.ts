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
      username: user.nickname,
      avatar: user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anonymous',
      level: this.getLevelName(user.level),
      bustedCount: user.totalJudged,
      maxStreak: user.maxStreak,
      weeklyAccuracy: Math.round(user.weeklyAccuracy * 10) / 10, // 保留一位小数
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
