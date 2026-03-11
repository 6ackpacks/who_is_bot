import api from '../utils/request';
import { CommentInfo, PaginatedResponse } from '../types';

export const commentApi = {
  getList: (params: {
    page?: number;
    limit?: number;
    contentId?: string;
    userId?: string;
    search?: string;
  }) =>
    api.get<any, PaginatedResponse<CommentInfo>>('/admin/comments', { params }),

  getById: (id: string) =>
    api.get<any, { comment: CommentInfo; replies: CommentInfo[] }>(`/admin/comments/${id}`),

  delete: (id: string, cascade?: boolean) =>
    api.delete<any, { success: boolean }>(`/admin/comments/${id}`, { params: { cascade } }),

  batchDelete: (ids: string[]) =>
    api.post<any, { success: boolean; deletedCount: number }>('/admin/comments/batch-delete', { ids }),
};
