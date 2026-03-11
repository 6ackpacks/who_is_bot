import api from '../utils/request';
import { DashboardStats } from '../types';

export const dashboardApi = {
  getStats: () =>
    api.get<any, DashboardStats>('/admin/dashboard/stats'),

  getCharts: () =>
    api.get<any, {
      userGrowth: Array<{ date: string; count: number }>;
      contentTypeDistribution: Array<{ type: string; count: number }>;
      accuracyTrend: Array<{ date: string; accuracy: number }>;
      hotContent: any[];
    }>('/admin/dashboard/charts'),
};
