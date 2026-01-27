import { ContentItem, UserRankItem } from '../types';

export const MOCK_FEED: ContentItem[] = [
  {
    id: '1',
    type: 'image',
    category: 'recommended',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=988&auto=format&fit=crop',
    title: '街头回眸',
    isAi: true,
    modelTag: 'Flux.1',
    authorId: 'ai_01',
    provider: 'CyberPunk',
    deceptionRate: 92,
    explanation: "Flux.1 模型生成的典型案例。虽然皮肤纹理极其逼真，但请注意背景虚化边缘的光斑形状并不符合光学物理规律，且左耳廓结构略显模糊。",
    comments: [
      { id: 'c0', user: 'AI鉴定局', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', text: '【官方解析】注意背景光斑与耳廓结构。', likes: 999, isOfficial: true },
      { id: 'c1', user: '猪猪侠', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', text: '这眼神太真了，我第一眼真没看出来。', likes: 12 },
      { id: 'c2', user: '迷路小猫', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Coco', text: '头发丝的处理还是有点生硬。', likes: 5 }
    ]
  },
  {
    id: '2',
    type: 'text',
    category: 'recommended',
    url: '',
    text: "深夜，便利店的关东煮冒着热气。店员低头看着手机，收音机里放着十年前的老歌。我买了一瓶热牛奶，推门出去的时候，风铃响了一声。这个瞬间，我觉得世界很安静，也很温柔。",
    title: '便利店瞬间',
    isAi: false,
    modelTag: '人类作家',
    authorId: 'human_01',
    provider: '文艺青年',
    deceptionRate: 45,
    explanation: "这是真实的人类写作。由于"收音机放老歌"、"风铃"等意象过于经典，容易被误判为AI的套路化写作，但情感流动的细腻度和"风铃响了一声"的听觉通感是人类特有的感知。",
    comments: [
      { id: 'c3', user: 'DesignPro', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack', text: '这种淡淡的孤独感，AI暂时还模仿不到精髓。', likes: 45 }
    ]
  },
  {
    id: '3',
    type: 'video',
    category: 'hardest',
    url: 'https://videos.pexels.com/video-files/4776944/4776944-hd_1080_1920_30fps.mp4',
    title: '猫咪伸懒腰',
    isAi: true,
    modelTag: 'Sora',
    authorId: 'ai_02',
    provider: 'OpenAI_Fan',
    deceptionRate: 98,
    explanation: "Sora 生成的视频。猫咪毛发物理动态几乎完美，但请仔细观察第3秒时，猫咪的尾巴与地毯接触的地方出现了轻微的穿模现象。",
    comments: [
      { id: 'c4', user: '汪汪队', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dog', text: '完全看不出破绽，太可怕了。', likes: 88 }
    ]
  },
  {
    id: '4',
    type: 'image',
    category: 'hardest',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=987&auto=format&fit=crop',
    title: '证件照',
    isAi: false,
    modelTag: '真人',
    authorId: 'human_02',
    provider: 'RealPhoto',
    deceptionRate: 85,
    explanation: "这是一张真实的胶片摄影人像。很多人因为皮肤质感过于完美而误判为AI，但眼神中的微光和皮肤下的毛细血管色泽变化是真实生理特征。",
    comments: [
      { id: 'c5', user: '细节控', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Annie', text: '这居然是真人？皮肤也太好了吧。', likes: 102 }
    ]
  }
];

export const MOCK_USER_RANKINGS: UserRankItem[] = [
  { id: 'u1', username: 'Sherlock_H', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sherlock', level: '硅谷天才', bustedCount: 1240, maxStreak: 42, weeklyAccuracy: 98.5 },
  { id: 'u2', username: 'BladeRunner', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Blade', level: '人机杀手', bustedCount: 980, maxStreak: 28, weeklyAccuracy: 94.2 },
  { id: 'u3', username: 'TuringTest', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Turing', level: '人机杀手', bustedCount: 850, maxStreak: 25, weeklyAccuracy: 91.0 },
  { id: 'u4', username: 'Neo_Matrix', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neo', level: '胜似人机', bustedCount: 620, maxStreak: 15, weeklyAccuracy: 88.5 },
  { id: 'u5', username: 'Agent_Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Smith', level: '胜似人机', bustedCount: 540, maxStreak: 12, weeklyAccuracy: 85.3 },
  { id: 'u6', username: 'User_9921', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=9921', level: 'AI小白', bustedCount: 120, maxStreak: 5, weeklyAccuracy: 65.0 },
];

// Keep old export for backward compatibility
export const MOCK_LEADERBOARD = MOCK_USER_RANKINGS;
