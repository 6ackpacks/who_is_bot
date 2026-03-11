import api from '../utils/request';
import { AdminInfo } from '../types';

export const authApi = {
  login: (username: string, password: string) =>
    api.post<any, { token: string; admin: AdminInfo }>('/admin/auth/login', { username, password }),

  getMe: () =>
    api.get<any, { admin: AdminInfo }>('/admin/auth/me'),

  logout: () =>
    api.post<any, { success: boolean }>('/admin/auth/logout'),
};
