import { ContentItem, LeaderboardItem } from '../types';

export const MOCK_FEED: ContentItem[] = [
  {
    id: '1',
    type: 'text',
    url: '',
    text: "你感受这个世界的波长与你周围的人不同步。与同龄人相比，你的思考异乎寻常的深刻。你能够看穿人类生活的复杂，拥有阅历丰富的灵魂。而与此同时，你又保有孩童般的理想主义和对世界的好奇。",
    title: '深夜感悟',
    isAi: true,
    modelTag: 'DeepSeek',
    authorId: 'ai_01',
    provider: '特工少女',
    deceptionRate: 72,
    explanation: "这段话模仿了MBTI人格测试中的常见的\"巴纳姆效应\"描述。看似深刻且个性化，实则模糊并适用于大多数人。由 DeepSeek 生成。",
    comments: [
      { id: 'c1', user: '猪猪侠', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', text: '这种话术太典型了，一眼AI生成的星座运势感。', likes: 12 },
      { id: 'c2', user: '迷路小猫', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Coco', text: '还有28%的人觉得是真人？我也差点信了。', likes: 5 }
    ]
  },
  {
    id: '2',
    type: 'image',
    url: 'https://picsum.photos/600/800?random=10',
    title: '端午安康',
    isAi: false,
    modelTag: '人类画师',
    authorId: 'human_01',
    provider: '美术课代表',
    deceptionRate: 15,
    explanation: "这是插画师的手绘作品。注意线条的笔触自然变化和构图中的逻辑细节，尤其是龙舟上人物的神态，这是目前AI难以完美复刻的。",
    comments: [
      { id: 'c3', user: 'DesignPro', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack', text: '这线条一看就是手绘的，AI画不出这种随性。', likes: 45 }
    ]
  },
  {
    id: '3',
    type: 'text',
    url: '',
    text: "今天在路边看到一只淋雨的小狗，心软带回家了。给它洗了个澡，吹干后发现它居然是白色的！取名叫小白吧，希望它能在这个家快乐长大。",
    title: '捡到小狗',
    isAi: false,
    modelTag: '真人',
    authorId: 'human_02',
    provider: '爱心市民',
    deceptionRate: 8,
    explanation: "这是真实用户的日常生活记录。情感表达自然朴素，逻辑链条（淋雨->带回->洗澡->取名）符合人类行为模式，没有AI常见的过度修饰。",
    comments: [
      { id: 'c4', user: '汪汪队', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dog', text: '太暖了！好人一生平安。', likes: 88 }
    ]
  },
  {
    id: '4',
    type: 'image',
    url: 'https://picsum.photos/600/800?random=11',
    title: '赛博朋克 2077',
    isAi: true,
    modelTag: 'Midjourney v6',
    authorId: 'ai_02',
    provider: 'AI 实验室',
    deceptionRate: 88,
    explanation: "Midjourney v6 生成。虽然光影效果极其逼真，但请注意背景霓虹灯牌上的文字是乱码，且左下角路人的手指结构略显怪异。",
    comments: [
      { id: 'c5', user: '细节控', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Annie', text: '不放大看真看不出来，现在MJ太强了。', likes: 102 }
    ]
  }
];

export const MOCK_LEADERBOARD: LeaderboardItem[] = [
  { id: 'l1', modelName: 'Sora', company: 'OpenAI', type: 'video', deceptionRate: 88.5, totalTests: 1240 },
  { id: 'l2', modelName: 'Midjourney v6', company: 'Midjourney', type: 'image', deceptionRate: 82.1, totalTests: 5430 },
  { id: 'l3', modelName: 'Kling', company: '快手', type: 'video', deceptionRate: 79.4, totalTests: 890 },
  { id: 'l4', modelName: 'GPT-4o', company: 'OpenAI', type: 'text', deceptionRate: 76.2, totalTests: 12300 },
  { id: 'l5', modelName: 'DeepSeek', company: '幻方量化', type: 'text', deceptionRate: 74.8, totalTests: 2100 },
  { id: 'l6', modelName: 'Claude 3.5', company: 'Anthropic', type: 'text', deceptionRate: 68.5, totalTests: 4500 },
];