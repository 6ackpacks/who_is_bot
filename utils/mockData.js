// utils/mockData.js - 模拟数据
const MOCK_FEED = [
  {
    id: '1',
    type: 'text',
    category: 'recommended',
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
      { id: 'c1', user: '猪猪侠', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', text: '这种话术太典型了，一眼AI生成的星座运势感。', likes: 12, isOfficial: false },
      { id: 'c2', user: '迷路小猫', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Coco', text: '还有28%的人觉得是真人？我也差点信了。', likes: 5, isOfficial: false }
    ]
  },
  {
    id: '2',
    type: 'image',
    category: 'recommended',
    url: 'https://picsum.photos/600/800?random=10',
    title: '端午安康',
    isAi: false,
    modelTag: '人类画师',
    authorId: 'human_01',
    provider: '美术课代表',
    deceptionRate: 15,
    explanation: "这是插画师的手绘作品。注意线条的笔触自然变化和构图中的逻辑细节，尤其是龙舟上人物的神态，这是目前AI难以完美复刻的。",
    comments: [
      { id: 'c3', user: 'DesignPro', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack', text: '这线条一看就是手绘的，AI画不出这种随性。', likes: 45, isOfficial: false }
    ]
  },
  {
    id: '3',
    type: 'text',
    category: 'hardest',
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
      { id: 'c4', user: '汪汪队', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dog', text: '太暖了！好人一生平安。', likes: 88, isOfficial: false }
    ]
  },
  {
    id: '4',
    type: 'image',
    category: 'hardest',
    url: 'https://picsum.photos/600/800?random=11',
    title: '赛博朋克 2077',
    isAi: true,
    modelTag: 'Midjourney v6',
    authorId: 'ai_02',
    provider: 'AI 实验室',
    deceptionRate: 88,
    explanation: "Midjourney v6 生成。虽然光影效果极其逼真，但请注意背景霓虹灯牌上的文字是乱码，且左下角路人的手指结构略显怪异。",
    comments: [
      { id: 'c5', user: '细节控', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Annie', text: '不放大看真看不出来，现在MJ太强了。', likes: 102, isOfficial: false }
    ]
  },
  {
    id: '5',
    type: 'text',
    category: 'recommended',
    url: '',
    text: "在量子力学的框架下，观察者效应揭示了一个深刻的哲学命题：现实是否独立于观察而存在？当我们试图测量一个粒子的位置时，我们不可避免地改变了它的动量。这种不确定性不是技术限制，而是自然界的基本属性。",
    title: '量子哲学思考',
    isAi: true,
    modelTag: 'GPT-4',
    authorId: 'ai_03',
    provider: '科学探索者',
    deceptionRate: 65,
    explanation: "AI生成的科普文本。虽然术语使用正确，但缺乏真实科研人员的个人见解和争议性观点。真正的物理学家通常会加入更多个人理解和学术争论。",
    comments: [
      { id: 'c6', user: '物理狂人', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Physics', text: '说得太教科书了，真正搞量子的不会这么写。', likes: 34, isOfficial: false },
      { id: 'c7', user: 'AI猎手', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hunter', text: '典型的GPT风格，一眼就看出来了。', likes: 28, isOfficial: false }
    ]
  },
  {
    id: '6',
    type: 'image',
    category: 'recommended',
    url: 'https://picsum.photos/600/800?random=12',
    title: '城市夜景',
    isAi: true,
    modelTag: 'DALL-E 3',
    authorId: 'ai_04',
    provider: '夜景收藏家',
    deceptionRate: 76,
    explanation: "DALL-E 3 生成的城市夜景。整体构图和光影处理很专业，但仔细观察建筑物的窗户排列会发现不符合建筑学规律，且远处的霓虹灯文字模糊不清。",
    comments: [
      { id: 'c8', user: '建筑师老王', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wang', text: '窗户的排列完全不对，这栋楼根本盖不起来。', likes: 56, isOfficial: false }
    ]
  },
  {
    id: '7',
    type: 'text',
    category: 'hardest',
    url: '',
    text: "昨晚做梦梦到自己变成了一只猫，在屋顶上跳来跳去，感觉特别自由。醒来后发现枕头掉地上了，估计是睡觉太不老实哈哈哈。今天起床腰还有点疼，年纪大了真不中用。",
    title: '奇怪的梦',
    isAi: false,
    modelTag: '真人',
    authorId: 'human_03',
    provider: '做梦大师',
    deceptionRate: 12,
    explanation: "真实用户的梦境分享。包含了真实的生理反馈（腰疼）和自嘲式幽默，这种随意的表达方式和逻辑跳跃是AI难以模仿的人类特征。",
    comments: [
      { id: 'c9', user: '解梦专家', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dream', text: '哈哈哈笑死，这个太真实了。', likes: 67, isOfficial: false }
    ]
  },
  {
    id: '8',
    type: 'image',
    category: 'hardest',
    url: 'https://picsum.photos/600/800?random=13',
    title: '美食摄影',
    isAi: false,
    modelTag: '人类摄影师',
    authorId: 'human_04',
    provider: '美食博主',
    deceptionRate: 18,
    explanation: "专业摄影师拍摄的美食照片。注意食物表面的真实质感、自然的光线反射，以及背景中略微失焦但真实存在的餐具细节。AI生成的食物往往过于完美而失去真实感。",
    comments: [
      { id: 'c10', user: '吃货小分队', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Food', text: '看着就很有食欲，AI做不出这种真实感。', likes: 92, isOfficial: false }
    ]
  },
  {
    id: '9',
    type: 'text',
    category: 'recommended',
    url: '',
    text: "人工智能的发展正在重塑我们的社会结构。从自动驾驶到医疗诊断，从内容创作到科学研究，AI的应用场景日益广泛。然而，我们也需要警惕技术发展带来的伦理挑战，确保AI的发展符合人类的长远利益。",
    title: 'AI时代的思考',
    isAi: true,
    modelTag: 'Claude 3.5',
    authorId: 'ai_05',
    provider: '科技观察者',
    deceptionRate: 58,
    explanation: "AI生成的科技评论。文字流畅且观点平衡，但缺乏具体案例和个人经历。真实的科技评论者通常会引用具体数据、新闻事件或个人体验来支撑观点。",
    comments: [
      { id: 'c11', user: '科技迷', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tech', text: '说得挺对的，但感觉像是AI写的。', likes: 41, isOfficial: false }
    ]
  },
  {
    id: '10',
    type: 'image',
    category: 'recommended',
    url: 'https://picsum.photos/600/800?random=14',
    title: '抽象艺术',
    isAi: true,
    modelTag: 'Stable Diffusion',
    authorId: 'ai_06',
    provider: '艺术实验室',
    deceptionRate: 82,
    explanation: "Stable Diffusion 生成的抽象艺术作品。色彩搭配和构图都很专业，但缺乏艺术家的个人风格和创作意图。真正的抽象艺术背后通常有明确的创作理念和情感表达。",
    comments: [
      { id: 'c12', user: '艺术评论家', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Art', text: '技术上很完美，但缺少灵魂。', likes: 73, isOfficial: false }
    ]
  }
];

const MOCK_USER_RANKINGS = [
  {
    id: 'u1',
    username: 'Sherlock_H',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sherlock',
    level: '硅谷天才',
    bustedCount: 1240,
    maxStreak: 45,
    weeklyAccuracy: 98.5
  },
  {
    id: 'u2',
    username: 'BladeRunner',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Blade',
    level: '人机杀手',
    bustedCount: 980,
    maxStreak: 28,
    weeklyAccuracy: 94.2
  },
  {
    id: 'u3',
    username: 'TuringTest',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Turing',
    level: '人机杀手',
    bustedCount: 850,
    maxStreak: 32,
    weeklyAccuracy: 91.0
  },
  {
    id: 'u4',
    username: 'Neo_Matrix',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neo',
    level: '胜似人机',
    bustedCount: 620,
    maxStreak: 15,
    weeklyAccuracy: 88.5
  },
  {
    id: 'u5',
    username: 'Agent_Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Smith',
    level: '胜似人机',
    bustedCount: 540,
    maxStreak: 12,
    weeklyAccuracy: 85.3
  },
  {
    id: 'u6',
    username: 'User_2025',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User2025',
    level: 'AI小白',
    bustedCount: 320,
    maxStreak: 8,
    weeklyAccuracy: 72.1
  }
];

const MOCK_LEADERBOARD = [
  { id: 'l1', modelName: 'Sora', company: 'OpenAI', type: 'video', deceptionRate: 88.5, totalTests: 1240 },
  { id: 'l2', modelName: 'Midjourney v6', company: 'Midjourney', type: 'image', deceptionRate: 82.1, totalTests: 5430 },
  { id: 'l3', modelName: 'Kling', company: '快手', type: 'video', deceptionRate: 79.4, totalTests: 890 },
  { id: 'l4', modelName: 'GPT-4o', company: 'OpenAI', type: 'text', deceptionRate: 76.2, totalTests: 12300 },
  { id: 'l5', modelName: 'DeepSeek', company: '幻方量化', type: 'text', deceptionRate: 74.8, totalTests: 2100 },
  { id: 'l6', modelName: 'Claude 3.5', company: 'Anthropic', type: 'text', deceptionRate: 68.5, totalTests: 4500 }
];

module.exports = {
  MOCK_FEED,
  MOCK_USER_RANKINGS,
  MOCK_LEADERBOARD
};
