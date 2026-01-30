import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MockLoginDto } from './dto/mock-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 模拟登录接口（开发测试用）
   * POST /auth/mock-login
   */
  @Post('mock-login')
  async mockLogin(@Body() dto: MockLoginDto) {
    const user = await this.authService.mockLogin(dto);
    return {
      success: true,
      message: '登录成功',
      data: user,
    };
  }

  /**
   * 获取用户信息
   * GET /auth/user?uid=xxx
   */
  @Get('user')
  async getUserInfo(@Query('uid') uid: string) {
    if (!uid) {
      return {
        success: false,
        message: '缺少uid参数',
      };
    }

    const user = await this.authService.getUserByUid(uid);
    return {
      success: true,
      data: user,
    };
  }
}
