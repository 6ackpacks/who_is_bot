/**
 * 用户个人资料完整响应 DTO
 * 包含前端个人资料页面所需的所有数据
 */
export class UserProfileDto {
  // 基本信息
  id: string;
  nickname: string;
  uid: string;
  avatar: string;
  level: number;
  levelName: string;

  // 统计数据
  totalJudged: number;
  accuracy: number;
  correctCount: number;
  streak: number;
  maxStreak: number;

  // 周统计
  weeklyAccuracy: number;
  weeklyJudged: number;
  weeklyCorrect: number;

  // 等级进度
  progress: number; // 到下一等级的进度百分比
  nextLevel: string;
  nextLevelRequirement: number; // 下一等级需要的总判定次数

  // 成就统计
  totalAchievements: number;
  unlockedAchievements: number;

  // 评论统计
  totalComments: number;
  totalLikes: number;

  // 时间戳
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 用户活动记录 DTO
 */
export class UserActivityDto {
  id: string;
  type: 'judgment' | 'comment' | 'achievement';
  title: string;
  description: string;
  isCorrect?: boolean; // 仅用于判定类型
  contentId?: string; // 仅用于判定和评论类型
  contentTitle?: string;
  contentType?: string;
  achievementIcon?: string; // 仅用于成就类型
  createdAt: Date;
}
