import api from '../utils/request';
import { UserInfo, PaginatedResponse } from '../types';

export const userApi = {
  getList: (params: {
    page?: number;
    limit?: number;
    level?: number;
    search?: string;
  }) =>
    api.get<any, PaginatedResponse<UserInfo>>('/admin/users', { params }),

  getById: (id: string) =>
    api.get<any, { user: UserInfo; achievements: any[]; recentJudgments: any[]; recentComments: any[] }>(`/admin/users/${id}`),

  create: (data: Partial<UserInfo>) =>
    api.post<any, { user: UserInfo }>('/admin/users', data),

  update: (id: string, data: Partial<UserInfo>) =>
    api.put<any, { user: UserInfo }>(`/admin/users/${id}`, data),

  recalculate: (id: string) =>
    api.post<any, { user: UserInfo }>(`/admin/users/${id}/recalculate`),
};
