import api from '../utils/request';
import { ContentInfo, PaginatedResponse } from '../types';

export const contentApi = {
  getList: (params: {
    page?: number;
    limit?: number;
    type?: string;
    isAi?: boolean;
    search?: string;
  }) =>
    api.get<any, PaginatedResponse<ContentInfo>>('/admin/content', { params }),

  getById: (id: string) =>
    api.get<any, { content: ContentInfo; comments: any[] }>(`/admin/content/${id}`),

  create: (data: Partial<ContentInfo>) =>
    api.post<any, { content: ContentInfo }>('/admin/content', data),

  update: (id: string, data: Partial<ContentInfo>) =>
    api.put<any, { content: ContentInfo }>(`/admin/content/${id}`, data),

  delete: (id: string) =>
    api.delete<any, { success: boolean }>(`/admin/content/${id}`),

  batchDelete: (ids: string[]) =>
    api.post<any, { success: boolean; deletedCount: number }>('/admin/content/batch-delete', { ids }),

  updateStats: (id: string, stats: {
    totalVotes: number;
    aiVotes: number;
    humanVotes: number;
    correctVotes: number;
  }) =>
    api.patch<any, { content: ContentInfo }>(`/admin/content/${id}/stats`, stats),
};
