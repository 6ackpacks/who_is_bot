import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Get(':id/stats')
  async getUserStats(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    if (!user) {
      return {
        success: false,
        message: '用户不存在'
      };
    }

    return {
      success: true,
      data: {
        totalJudged: user.totalJudged,
        accuracy: Math.round(user.accuracy * 10) / 10,
        correctCount: user.correctCount,
        streak: user.streak,
        maxStreak: user.maxStreak,
        weeklyAccuracy: Math.round(user.weeklyAccuracy * 10) / 10,
        weeklyJudged: user.weeklyJudged,
        level: user.level,
        levelName: this.getLevelName(user.level)
      }
    };
  }

  private getLevelName(level: number): string {
    const levels = ['AI小白', '胜似人机', '人机杀手', '硅谷天才'];
    return levels[level - 1] || 'AI小白';
  }

  @Get('uid/:uid')
  findByUid(@Param('uid') uid: string) {
    return this.userService.findByUid(uid);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Patch(':id/stats')
  updateStats(
    @Param('id') id: string,
    @Body() body: { accuracy: number; totalJudged: number; streak: number },
  ) {
    return this.userService.updateStats(id, body.accuracy, body.totalJudged, body.streak);
  }

  @Get('leaderboard/top')
  getLeaderboard(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 50;
    return this.userService.getLeaderboard(limitNum);
  }

  @Patch(':id/leaderboard-stats')
  updateLeaderboardStats(
    @Param('id') id: string,
    @Body() body: {
      totalBotsBusted: number;
      maxStreak: number;
      weeklyAccuracy: number;
      weeklyJudged: number;
      weeklyCorrect: number;
    },
  ) {
    return this.userService.updateLeaderboardStats(
      id,
      body.totalBotsBusted,
      body.maxStreak,
      body.weeklyAccuracy,
      body.weeklyJudged,
      body.weeklyCorrect,
    );
  }
}
