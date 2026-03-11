import axios from 'axios';
import { message } from 'antd';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 如果响应包含 success 和 data 字段（标准后端响应格式），返回 data 内容
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      return response.data.data;
    }
    // 否则返回原始 data（保持向后兼容）
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        message.error('登录已过期，请重新登录');
        useAuthStore.getState().logout();
        window.location.href = '/login';
      } else if (status === 403) {
        message.error('没有权限访问');
      } else if (status === 404) {
        message.error('请求的资源不存在');
      } else if (status >= 500) {
        message.error('服务器错误，请稍后重试');
      } else {
        message.error(data?.message || '请求失败');
      }
    } else if (error.request) {
      message.error('网络错误，请检查网络连接');
    } else {
      message.error('请求配置错误');
    }

    return Promise.reject(error);
  }
);

export default api;
