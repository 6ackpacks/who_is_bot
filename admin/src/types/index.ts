export interface AdminInfo {
  id: string;
  username: string;
  role: 'super' | 'normal';
  createdAt: string;
  lastLoginAt: string;
}

export interface ContentInfo {
  id: string;
  type: 'text' | 'image' | 'video';
  url?: string;
  text?: string;
  title: string;
  isAi: boolean;
  modelTag: string;
  provider: string;
  deceptionRate: number;
  explanation: string;
  totalVotes: number;
  aiVotes: number;
  humanVotes: number;
  correctVotes: number;
  accuracy: number;
  // Stats source toggle fields
  statsSource: 'manual' | 'real';
  manualAiPercent: number | null;
  manualHumanPercent: number | null;
  displayAiPercent: number;
  displayHumanPercent: number;
  // Participant count override
  manualTotalVotes?: number | null;
  displayTotalVotes?: number;
  // Legacy percentage fields (computed from real votes)
  aiPercentage?: number;
  humanPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserInfo {
  id: string;
  nickname: string;
  uid: string;
  openid?: string;
  avatar?: string;
  level: number;
  accuracy: number;
  totalJudged: number;
  correctCount: number;
  streak: number;
  maxStreak: number;
  totalBotsBusted: number;
  weeklyAccuracy: number;
  weeklyJudged: number;
  weeklyCorrect: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommentInfo {
  id: string;
  contentId: string;
  userId?: string;
  guestId?: string;
  content: string;
  likes: number;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  user?: { nickname: string; avatar?: string };
  contentTitle?: string;
  replyCount?: number;
}

export interface FileInfo {
  key: string;
  url: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  referenceCount: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalContent: number;
  totalJudgments: number;
  todayActiveUsers: number;
  todayNewContent: number;
  todayJudgments: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
