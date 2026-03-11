import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminGuard } from './guards/admin.guard';
import { CurrentAdmin, AdminUser } from './decorators/current-admin.decorator';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  async login(@Body() loginDto: AdminLoginDto) {
    return this.adminAuthService.login(loginDto);
  }

  @Get('me')
  @UseGuards(AdminGuard)
  async getMe(@CurrentAdmin() admin: AdminUser) {
    return this.adminAuthService.getAdminInfo(admin.id);
  }

  @Post('logout')
  @UseGuards(AdminGuard)
  async logout() {
    // JWT is stateless, so logout is handled on client side
    // This endpoint is just for consistency
    return { success: true, message: '登出成功' };
  }
}
