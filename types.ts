export type ContentType = 'video' | 'image' | 'text';

export interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  likes: number;
  isOfficial?: boolean; // For official analysis
}

export interface ContentItem {
  id: string;
  type: ContentType;
  url: string; // Image URL or Video thumbnail/source
  text?: string; // For text content
  title: string;
  isAi: boolean;
  modelTag: string; // e.g., "Kling", "Sora", "GPT-4", "Human"
  authorId: string;
  provider: string; // Name of the user who provided content
  deceptionRate: number; // 0-100%
  explanation: string; // The "Reveal" text explaining the source
  comments: Comment[];
  category: 'recommended' | 'hardest';
}

export interface UserRankItem {
  id: string;
  username: string;
  avatar: string;
  level: 'AI小白' | '胜似人机' | '人机杀手' | '硅谷天才';
  bustedCount: number; // Total Bots Busted
  maxStreak: number;
  weeklyAccuracy: number;
}

export interface LeaderboardItem {
  id: string;
  nickname: string;
  avatar: string;
  level: number;
  totalBotsBusted: number;
  maxStreak: number;
  weeklyAccuracy: number;
}

export enum TabView {
  FEED = 'feed',
  LAB = 'lab',
  PROFILE = 'profile',
}