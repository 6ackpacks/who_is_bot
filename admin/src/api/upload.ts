import api from '../utils/request';
import { FileInfo, PaginatedResponse } from '../types';

export const uploadApi = {
  getSignature: (filename: string, contentType: string) =>
    api.post<any, { url: string; key: string; policy: string; signature: string; accessKeyId: string }>('/admin/upload/signature', { filename, contentType }),

  uploadFile: (formData: FormData) =>
    api.post<any, { url: string; key: string; size: number; contentType: string }>('/admin/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getFiles: (params: { page?: number; limit?: number; type?: string }) =>
    api.get<any, PaginatedResponse<FileInfo>>('/admin/upload/files', { params }),

  deleteFile: (key: string) =>
    api.delete<any, { success: boolean }>(`/admin/upload/files/${key}`),
};
