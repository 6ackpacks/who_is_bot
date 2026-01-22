export type ContentType = 'video' | 'image' | 'text';

export interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  likes: number;
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
}

export interface LeaderboardItem {
  id: string;
  modelName: string;
  company: string;
  type: ContentType;
  deceptionRate: number;
  totalTests: number;
}

export enum TabView {
  FEED = 'feed',
  LAB = 'lab',
  PUBLISH = 'publish',
  SQUARE = 'square',
  PROFILE = 'profile',
}