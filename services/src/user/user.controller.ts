import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 获取所有用户（公开访问）
   */
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  /**
   * 获取用户详情（公开访问）
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  /**
   * 获取用户统计信息（公开访问）
   */
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

  /**
   * 根据 UID 获取用户（公开访问）
   */
  @Get('uid/:uid')
  findByUid(@Param('uid') uid: string) {
    return this.userService.findByUid(uid);
  }

  /**
   * 创建用户（公开访问，用于注册）
   */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  /**
   * 更新用户统计（需要认证，只能更新自己的数据）
   * 注意：这个端点应该被废弃，统计应该由系统自动更新
   */
  @Patch(':id/stats')
  @UseGuards(JwtAuthGuard)
  updateStats(
    @Param('id') id: string,
    @Body() body: { accuracy: number; totalJudged: number; streak: number },
    @CurrentUser() user: CurrentUserData,
  ) {
    // 验证资源所有权：只能更新自己的统计
    if (id !== user.userId) {
      throw new ForbiddenException('无权修改其他用户的统计数据');
    }
    return this.userService.updateStats(id, body.accuracy, body.totalJudged, body.streak);
  }

  /**
   * 获取排行榜（公开访问）
   */
  @Get('leaderboard/top')
  getLeaderboard(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 50;
    return this.userService.getLeaderboard(limitNum);
  }

  /**
   * 更新排行榜统计（需要认证，只能更新自己的数据）
   * 注意：这个端点应该被废弃，统计应该由系统自动更新
   */
  @Patch(':id/leaderboard-stats')
  @UseGuards(JwtAuthGuard)
  updateLeaderboardStats(
    @Param('id') id: string,
    @Body() body: {
      totalBotsBusted: number;
      maxStreak: number;
      weeklyAccuracy: number;
      weeklyJudged: number;
      weeklyCorrect: number;
    },
    @CurrentUser() user: CurrentUserData,
  ) {
    // 验证资源所有权：只能更新自己的统计
    if (id !== user.userId) {
      throw new ForbiddenException('无权修改其他用户的统计数据');
    }
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
