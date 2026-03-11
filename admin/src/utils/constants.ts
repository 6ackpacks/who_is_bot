export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:80';

export const TOKEN_KEY = 'auth-storage';

export const PAGE_SIZE = 20;

export const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB
  video: 100 * 1024 * 1024, // 100MB
};

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime'];

export const CONTENT_TYPES = {
  text: '文本',
  image: '图片',
  video: '视频',
};

export const USER_ROLES = {
  super: '超级管理员',
  normal: '普通管理员',
};
