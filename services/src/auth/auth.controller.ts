import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MockLoginDto } from './dto/mock-login.dto';
import { WxLoginDto } from './dto/wx-login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser, CurrentUserData } from './current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 微信登录接口
   * POST /auth/wx-login
   */
  @Post('wx-login')
  async wxLogin(@Body() dto: WxLoginDto) {
    const user = await this.authService.wxLogin(dto);
    return {
      success: true,
      message: '登录成功',
      data: user,
    };
  }

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
   * 获取当前登录用户信息（需要认证）
   * GET /auth/me
   * Header: Authorization: Bearer <token>
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: CurrentUserData) {
    const userInfo = await this.authService.getUserByUid(user.uid);
    return {
      success: true,
      data: userInfo,
    };
  }
}
