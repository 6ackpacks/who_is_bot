import { Controller, Get, Query, UseGuards, Logger } from '@nestjs/common';
import { AdminStatsService } from './admin-stats.service';
import { AdminGuard } from './guards/admin.guard';

@Controller('admin/stats')
@UseGuards(AdminGuard)
export class AdminStatsController {
  private readonly logger = new Logger(AdminStatsController.name);

  constructor(private readonly adminStatsService: AdminStatsService) {}

  /**
   * 获取总体统计数据
   * GET /admin/stats/overview
   */
  @Get('overview')
  async getOverview() {
    return this.adminStatsService.getOverview();
  }

  /**
   * 获取用户增长趋势
   * GET /admin/stats/user-growth?days=30
   */
  @Get('user-growth')
  async getUserGrowth(@Query('days') days: string = '30') {
    return this.adminStatsService.getUserGrowth(parseInt(days, 10));
  }

  /**
   * 获取内容统计
   * GET /admin/stats/content
   */
  @Get('content')
  async getContentStats() {
    return this.adminStatsService.getContentStats();
  }

  /**
   * 获取判定准确率统计
   * GET /admin/stats/accuracy
   */
  @Get('accuracy')
  async getAccuracyStats() {
    return this.adminStatsService.getAccuracyStats();
  }

  /**
   * 获取活跃用户统计
   * GET /admin/stats/active-users?days=7
   */
  @Get('active-users')
  async getActiveUsers(@Query('days') days: string = '7') {
    return this.adminStatsService.getActiveUsers(parseInt(days, 10));
  }

  /**
   * 获取热门内容排行
   * GET /admin/stats/top-content?limit=10
   */
  @Get('top-content')
  async getTopContent(@Query('limit') limit: string = '10') {
    return this.adminStatsService.getTopContent(parseInt(limit, 10));
  }
}
