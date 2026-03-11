import { Controller, Get, UseGuards, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AdminGuard } from '../admin/guards/admin.guard';

@Controller('admin/dashboard')
@UseGuards(AdminGuard)
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * 获取数据概览
   * GET /admin/dashboard/stats
   */
  @Get('stats')
  async getStats() {
    try {
      const stats = await this.dashboardService.getStats();
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      this.logger.error('Failed to get dashboard stats', error);
      // 返回默认数据而不是抛出500错误
      return {
        success: true,
        data: {
          totalUsers: 0,
          totalContent: 0,
          totalJudgments: 0,
          todayActiveUsers: 0,
          todayNewContent: 0,
          todayJudgments: 0,
        },
      };
    }
  }

  /**
   * 获取图表数据
   * GET /admin/dashboard/charts
   */
  @Get('charts')
  async getCharts() {
    try {
      const charts = await this.dashboardService.getCharts();
      return {
        success: true,
        data: charts,
      };
    } catch (error) {
      this.logger.error('Failed to get dashboard charts', error);
      // 返回空数据而不是抛出500错误
      return {
        success: true,
        data: {
          userGrowth: [],
          contentTypeDistribution: [],
          accuracyTrend: [],
          hotContent: [],
        },
      };
    }
  }
}
