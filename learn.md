1. 入口文件与样式配置 (index.html)
包含了 Tailwind CSS 的引入、自定义颜色配置以及全局样式。
code
Html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>谁是人机</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              app: {
                bg: '#F5F7FA',
                card: '#FFFFFF',
                text: '#1F2937',
                primary: '#10B981', // Emerald 500 - Main Green
                secondary: '#000000',
                blue: '#3B82F6', // Human
                red: '#EF4444',  // Bot
                yellow: '#FBBF24', // Accent for dark mode stats
                gray: '#9CA3AF',
              }
            },
            fontFamily: {
              sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
            }
          }
        }
      }
    </script>
    <style>
      body {
        background-color: #F5F7FA;
        color: #1F2937;
        overscroll-behavior: none;
      }
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    </style>
  <script type="importmap">
{
  "imports": {
    "react/": "https://esm.sh/react@^19.2.3/",
    "react": "https://esm.sh/react@^19.2.3",
    "react-dom/": "https://esm.sh/react-dom@^19.2.3/",
    "framer-motion": "https://esm.sh/framer-motion@^12.27.1",
    "lucide-react": "https://esm.sh/lucide-react@^0.562.0"
  }
}
</script>
</head>
  <body>
    <div id="root"></div>
  </body>
</html>
2. React 入口 (index.tsx)
code
Tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
3. 类型定义 (types.ts)
code
Ts
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

export enum TabView {
  FEED = 'feed',
  LAB = 'lab',
  PROFILE = 'profile',
}
4. 模拟数据服务 (services/mockData.ts)
code
Ts
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
    explanation: "这是真实的人类写作。由于“收音机放老歌”、“风铃”等意象过于经典，容易被误判为AI的套路化写作，但情感流动的细腻度和“风铃响了一声”的听觉通感是人类特有的感知。",
    comments: [
      { id: 'c3', user: 'DesignPro', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack', text: '这种淡淡的孤独感，AI暂时还模仿不到精髓。', likes: 45 }
    ]
  },
  {
    id: '3',
    type: 'video',
    category: 'hardest',
    url: 'https://videos.pexels.com/video-files/4776944/4776944-hd_1080_1920_30fps.mp4', // Placeholder video
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
5. 主应用逻辑 (App.tsx)
code
Tsx
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Feed } from './components/Feed';
import { Leaderboard } from './components/Leaderboard';
import { Profile } from './components/Profile';
import { TabView } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabView>(TabView.FEED);

  const renderContent = () => {
    switch (activeTab) {
      case TabView.FEED:
        return <Feed />;
      case TabView.LAB:
        return <Leaderboard />;
      case TabView.PROFILE:
        return <Profile />;
      default:
        return <Feed />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}
6. 底部导航组件 (components/Layout.tsx)
code
Tsx
import React from 'react';
import { LayoutGrid, User, Play } from 'lucide-react';
import { TabView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabView;
  onTabChange: (tab: TabView) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const navItems = [
    { id: TabView.FEED, icon: Play, label: '判定' },
    { id: TabView.LAB, icon: LayoutGrid, label: '榜单' },
    { id: TabView.PROFILE, icon: User, label: '我的' },
  ];

  return (
    <div className="flex flex-col h-screen w-full bg-app-bg text-app-text overflow-hidden relative font-sans">
      
      {/* Main Content Area */}
      <main className="flex-1 w-full h-full overflow-hidden relative z-0">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="h-[80px] pb-4 bg-white border-t border-gray-100 flex items-center justify-around z-50 shrink-0 select-none shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center w-20 space-y-1 transition-colors duration-200 ${
                isActive ? 'text-app-primary' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon 
                size={26} 
                strokeWidth={isActive ? 2.5 : 2} 
                fill={isActive ? "currentColor" : "none"}
                className={`transition-all ${isActive ? 'scale-110' : 'scale-100'}`}
              />
              <span className={`text-[10px] font-bold ${isActive ? 'text-app-primary' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
7. 核心游戏判定流组件 (components/Feed.tsx)
code
Tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, X, MessageCircle, ChevronUp, Share2, 
  Bot, User, Sparkles, AlertCircle, Info, ArrowRight
} from 'lucide-react';
import { ContentItem } from '../types';
import { MOCK_FEED } from '../services/mockData';

type FeedCategory = 'recommended' | 'hardest';
type ViewState = 'judging' | 'revealed';

export const Feed: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<FeedCategory>('recommended');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewState, setViewState] = useState<ViewState>('judging');
  const [showDetails, setShowDetails] = useState(false);
  const [userChoice, setUserChoice] = useState<'ai' | 'human' | null>(null);
  
  // Filter items based on category
  const categoryItems = MOCK_FEED.filter(item => item.category === activeCategory);
  // Fallback if empty category
  const displayItems = categoryItems.length > 0 ? categoryItems : MOCK_FEED;
  
  const currentItem = displayItems[currentIndex];
  const isCorrect = userChoice === 'ai' ? currentItem.isAi : !currentItem.isAi;

  const handleCategoryChange = (cat: FeedCategory) => {
    setActiveCategory(cat);
    setCurrentIndex(0);
    setViewState('judging');
    setShowDetails(false);
    setUserChoice(null);
  };

  const handleJudge = (choice: 'ai' | 'human') => {
    // Vibrate if supported
    if (navigator.vibrate) navigator.vibrate(50);
    
    setUserChoice(choice);
    setViewState('revealed');
  };

  const handleNext = () => {
    setViewState('judging');
    setShowDetails(false);
    setUserChoice(null);
    setCurrentIndex((prev) => (prev + 1) % displayItems.length);
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  // Render content (Image/Video/Text)
  const renderContent = () => {
    if (currentItem.type === 'video') {
       return (
        <div className="w-full h-full bg-black relative flex items-center justify-center">
            {/* Placeholder for video player - using image for mock */}
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-white/50">
                <span className="z-10 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">Video Content Placeholder</span>
            </div>
            {/* Using image as thumbnail for the mock */}
            <img src="https://images.unsplash.com/photo-1537047902294-62286416950a?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover opacity-60" />
        </div>
       );
    }
    if (currentItem.type === 'image') {
      return (
        <img 
            src={currentItem.url} 
            alt={currentItem.title} 
            className="w-full h-full object-cover"
        />
      );
    }
    return (
        <div className="w-full h-full bg-white flex flex-col justify-center items-center p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100">
            <QuoteIcon />
            <p className="text-xl md:text-2xl font-serif leading-loose text-gray-800 my-8 px-4">
                {currentItem.text}
            </p>
        </div>
    );
  };

  return (
    <div className="relative w-full h-full bg-black text-white overflow-hidden font-sans">
      
      {/* 1. Top Tabs (Floating) */}
      <div className="absolute top-0 left-0 right-0 z-30 pt-4 pb-8 bg-gradient-to-b from-black/80 to-transparent px-4">
          <div className="flex justify-center space-x-6 text-lg font-bold drop-shadow-md">
            <button 
                onClick={() => handleCategoryChange('recommended')}
                className={`transition-all duration-300 ${activeCategory === 'recommended' ? 'text-white scale-105 border-b-2 border-app-primary pb-1' : 'text-white/60'}`}
            >
                推荐
            </button>
            <div className="w-[1px] h-6 bg-white/20 self-center"></div>
            <button 
                onClick={() => handleCategoryChange('hardest')}
                className={`transition-all duration-300 ${activeCategory === 'hardest' ? 'text-white scale-105 border-b-2 border-app-primary pb-1' : 'text-white/60'}`}
            >
                全网最难
            </button>
          </div>
      </div>

      {/* 2. Main Content Card (Immersive) */}
      <div className="w-full h-full relative">
        {renderContent()}

        {/* Gradient Overlay for Text Visibility */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

        {/* Info Text (Bottom Left) */}
        <div className="absolute bottom-32 left-4 z-10 max-w-[80%] pointer-events-none">
            <div className="flex items-center space-x-2 mb-2">
                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase border border-white/10">
                    {currentItem.type}
                </span>
                <span className="text-white/80 text-xs shadow-black drop-shadow-md">@{currentItem.provider}</span>
            </div>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg mb-1">{currentItem.title}</h2>
            <p className="text-white/70 text-sm line-clamp-2 drop-shadow-md">
                {viewState === 'judging' ? '点击下方按钮进行判定...' : '判定完成，点击查看解析'}
            </p>
        </div>
      </div>

      {/* 3. Floating Judgment Buttons (Bottom) */}
      <AnimatePresence>
        {viewState === 'judging' && (
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="absolute bottom-8 left-0 right-0 z-20 flex justify-center items-center space-x-12"
            >
                {/* Bot Button (Left) */}
                <div className="flex flex-col items-center space-y-2 group">
                    <button
                        onClick={() => handleJudge('ai')}
                        className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform duration-200"
                    >
                        <X size={32} className="text-app-red" strokeWidth={3} />
                    </button>
                    <span className="text-white font-bold text-sm drop-shadow-md bg-black/20 px-2 rounded-full backdrop-blur-sm">铁是人机</span>
                </div>

                {/* Human Button (Right) */}
                <div className="flex flex-col items-center space-y-2 group">
                    <button
                        onClick={() => handleJudge('human')}
                        className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform duration-200"
                    >
                        <Heart size={30} className="text-app-blue fill-app-blue" />
                    </button>
                    <span className="text-white font-bold text-sm drop-shadow-md bg-black/20 px-2 rounded-full backdrop-blur-sm">包真人的</span>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Result Sticker (After Judgment) */}
      <AnimatePresence>
        {viewState === 'revealed' && !showDetails && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute bottom-8 left-4 right-4 z-20"
            >
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-app-primary"></div>
                    
                    <div className="flex justify-between items-start pl-3">
                        <div>
                             <div className="flex items-center space-x-2 mb-1">
                                {isCorrect ? (
                                    <span className="text-app-primary font-black italic text-xl">Bingo! 慧眼如炬</span>
                                ) : (
                                    <span className="text-app-red font-black italic text-xl">Oops! 看走眼了</span>
                                )}
                            </div>
                            <p className="text-white/90 text-sm font-medium pr-8 line-clamp-2 leading-relaxed">
                                {currentItem.explanation}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 flex space-x-3 pl-3">
                        <button 
                            onClick={toggleDetails}
                            className="flex-1 bg-white text-black text-xs font-bold py-2.5 rounded-full flex items-center justify-center space-x-1 hover:bg-gray-100"
                        >
                            <MessageCircle size={14} />
                            <span>查看评论 & 深度解析</span>
                        </button>
                         <button 
                            onClick={handleNext}
                            className="w-12 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30"
                        >
                            <ChevronUp size={20} className="rotate-90"/>
                        </button>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Details Sheet (Half Screen Overlay) */}
      <AnimatePresence>
        {showDetails && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={toggleDetails}
                    className="absolute inset-0 bg-black/60 z-40"
                />
                <motion.div 
                    initial={{ y: '100%' }}
                    animate={{ y: '20%' }}
                    exit={{ y: '100%' }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="absolute inset-0 z-50 bg-white rounded-t-3xl overflow-hidden flex flex-col"
                >
                    {/* Sheet Handle */}
                    <div className="h-6 w-full flex justify-center items-center bg-white shrink-0" onClick={toggleDetails}>
                        <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
                    </div>
                    
                    {/* Sheet Content */}
                    <div className="flex-1 overflow-y-auto px-6 pb-20">
                        {/* Status Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-black text-gray-900">真相档案</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentItem.isAi ? 'bg-app-red/10 text-app-red' : 'bg-app-blue/10 text-app-blue'}`}>
                                {currentItem.isAi ? 'AI 生成' : '真人创作'}
                            </span>
                        </div>

                        {/* Model Info */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center justify-between">
                            <div>
                                <div className="text-xs text-gray-400 font-bold mb-1">来源/模型</div>
                                <div className="text-lg font-bold text-gray-800">{currentItem.modelTag}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-gray-400 font-bold mb-1">误判率</div>
                                <div className="text-xl font-black text-app-primary">{currentItem.deceptionRate}%</div>
                            </div>
                        </div>

                        {/* Official Analysis */}
                        <div className="mb-8">
                            <div className="flex items-center space-x-2 mb-3">
                                <Sparkles size={16} className="text-app-primary" />
                                <h4 className="font-bold text-gray-900">鉴别要点</h4>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed text-justify">
                                {currentItem.explanation}
                            </p>
                        </div>

                        <hr className="border-gray-100 mb-6" />

                        {/* Comments */}
                        <div className="mb-4">
                             <h4 className="font-bold text-gray-900 mb-4">社区讨论 ({currentItem.comments.length})</h4>
                             <div className="space-y-6">
                                {currentItem.comments.map(comment => (
                                    <div key={comment.id} className="flex space-x-3">
                                        <img src={comment.avatar} className="w-8 h-8 rounded-full bg-gray-200" />
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-bold text-gray-800">{comment.user}</span>
                                                {comment.isOfficial && (
                                                    <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold">官方</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{comment.text}</p>
                                        </div>
                                        <div className="flex flex-col items-center text-gray-400">
                                            <Heart size={14} />
                                            <span className="text-[10px] mt-0.5">{comment.likes}</span>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
                        <button 
                            onClick={handleNext}
                            className="w-full h-12 bg-black text-white rounded-full font-bold shadow-lg flex items-center justify-center space-x-2"
                        >
                            <span>继续下一题</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>
    </div>
  );
};

const QuoteIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-gray-200" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.01697 21L5.01697 18C5.01697 16.8954 5.9124 16 7.01697 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H6.01697C5.46468 8 5.01697 8.44772 5.01697 9V11C5.01697 11.5523 4.56925 12 4.01697 12H3.01697V5H13.017V15C13.017 18.3137 10.3307 21 7.01697 21H5.01697Z" />
    </svg>
);
8. 榜单组件 (components/Leaderboard.tsx)
code
Tsx
import React from 'react';
import { MOCK_USER_RANKINGS } from '../services/mockData';
import { Trophy, Target, Zap, TrendingUp, Medal } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  // Sorting by Busted Count as default primary metric
  const sortedData = [...MOCK_USER_RANKINGS].sort((a, b) => b.bustedCount - a.bustedCount);

  return (
    <div className="flex flex-col h-full bg-app-bg">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-100">
        <h1 className="text-2xl font-black text-gray-900">全网最强<br/><span className="text-app-primary">赛博侦探榜</span></h1>
        <p className="text-xs text-gray-400 mt-2 font-medium">每日 24:00 更新 · 寻找人类最强鹰眼</p>
      </div>

      {/* Stats Header Row */}
      <div className="grid grid-cols-12 px-6 py-3 bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
        <div className="col-span-1">#</div>
        <div className="col-span-6 pl-2">Detective</div>
        <div className="col-span-5 text-right flex justify-end space-x-4">
            <span>Busted</span>
            <span className="w-8 text-center">Strk</span>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 pb-24">
          {sortedData.map((user, index) => (
            <div 
              key={user.id} 
              className="relative bg-white rounded-xl p-4 flex items-center shadow-sm border border-gray-50"
            >
              {/* Rank */}
              <div className="w-8 flex-shrink-0 flex items-center justify-center">
                  {index === 0 && <Trophy size={20} className="text-yellow-400 fill-yellow-400" />}
                  {index === 1 && <Medal size={20} className="text-gray-400 fill-gray-300" />}
                  {index === 2 && <Medal size={20} className="text-orange-400 fill-orange-300" />}
                  {index > 2 && <span className="text-gray-400 font-bold text-sm">{index + 1}</span>}
              </div>

              {/* Avatar & Info */}
              <div className="flex-1 min-w-0 flex items-center space-x-3">
                 <img src={user.avatar} className="w-10 h-10 rounded-full bg-gray-100 border border-gray-100" alt={user.username} />
                 <div className="flex flex-col">
                    <div className="flex items-center space-x-1">
                        <h3 className="font-bold text-gray-900 text-sm truncate max-w-[100px]">{user.username}</h3>
                        {/* Level Badge */}
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold border ${
                            user.level === '硅谷天才' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                            user.level === '人机杀手' ? 'bg-red-50 text-red-600 border-red-100' :
                            'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                            {user.level}
                        </span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5 flex items-center">
                        <TrendingUp size={10} className="mr-1"/>
                        周准确率 {user.weeklyAccuracy}%
                    </div>
                 </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-4 text-right">
                <div className="flex flex-col items-end w-12">
                   <span className="text-sm font-black text-gray-900">{user.bustedCount}</span>
                </div>
                <div className="flex flex-col items-center justify-center w-8 bg-orange-50 rounded-lg py-1 border border-orange-100">
                   <Zap size={10} className="text-orange-500 fill-orange-500 mb-0.5" />
                   <span className="text-[10px] font-bold text-orange-600">{user.maxStreak}</span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
9. 个人中心组件 (components/Profile.tsx)
code
Tsx
import React from 'react';
import { Share2, Lock, Upload, ChevronRight, Zap, Target, Eye } from 'lucide-react';

// Mock User Profile Data
const CURRENT_USER = {
    level: '人机杀手',
    nextLevel: '硅谷天才',
    progress: 72, // percentage to next level
    totalJudgments: 850,
    accuracy: 89.4,
    streak: 12,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MyUser',
};

export const Profile: React.FC = () => {
  return (
    <div className="h-full bg-app-bg overflow-y-auto pb-24">
      {/* 1. Header Card */}
      <div className="bg-white pb-8 pt-12 px-6 rounded-b-[40px] shadow-sm mb-6">
         <div className="flex flex-col items-center">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-app-primary to-blue-400 mb-3">
                <img src={CURRENT_USER.avatar} className="w-full h-full rounded-full bg-white border-2 border-white" alt="Avatar"/>
            </div>
            
            {/* Name & Level */}
            <h2 className="text-xl font-black text-gray-900 mb-1">Cyber_Detective</h2>
            <div className="flex items-center space-x-2 bg-black/5 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-app-primary rounded-full animate-pulse"></span>
                <span className="text-xs font-bold text-gray-600">{CURRENT_USER.level}</span>
            </div>

            {/* Level Progress */}
            <div className="w-full max-w-[200px] mt-6">
                <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1.5">
                    <span>Lv.3</span>
                    <span>Next: {CURRENT_USER.nextLevel}</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-app-primary to-blue-400" style={{ width: `${CURRENT_USER.progress}%` }}></div>
                </div>
                <p className="text-center text-[10px] text-gray-400 mt-2">还需识破 28 个 AI 伪装即可升级</p>
            </div>
         </div>

         {/* Stats Row */}
         <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="flex flex-col items-center">
                <span className="text-lg font-black text-gray-900">{CURRENT_USER.totalJudgments}</span>
                <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase">Total Judged</span>
            </div>
            <div className="flex flex-col items-center border-x border-gray-100">
                <span className="text-lg font-black text-app-primary">{CURRENT_USER.accuracy}%</span>
                <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase">Accuracy</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-lg font-black text-orange-500">{CURRENT_USER.streak}</span>
                <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase">Best Streak</span>
            </div>
         </div>
      </div>

      {/* 2. Creator Management (Locked) */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">创作者中心</h3>
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-bold">Beta</span>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-100 relative overflow-hidden group">
            {/* Locked Overlay content */}
            <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <Lock size={20} className="text-gray-400" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">上传通道未开启</h4>
                <p className="text-xs text-gray-500 mb-4 max-w-[200px]">
                    想让大家看看你的高仿人机？<br/>达到 <span className="text-app-primary font-bold">硅谷天才</span> 等级后解锁上传权限
                </p>
                <button className="px-5 py-2 bg-gray-900 text-white text-xs font-bold rounded-full opacity-50 cursor-not-allowed">
                    申请内测资格
                </button>
            </div>
            
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-10 -mt-10 z-0"></div>
        </div>
      </div>

      {/* 3. Achievements Menu */}
      <div className="px-6 space-y-3">
         <h3 className="font-bold text-gray-900">我的成就</h3>
         
         <div className="bg-white rounded-2xl p-4 flex items-center justify-between border border-gray-100">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-app-primary">
                    <Eye size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 text-sm">火眼金睛</h4>
                    <p className="text-[10px] text-gray-400">连续准确率达到 90%</p>
                </div>
            </div>
            <span className="text-xs font-bold text-app-primary">已获得</span>
         </div>

         <div className="bg-white rounded-2xl p-4 flex items-center justify-between border border-gray-100 opacity-60">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                    <Zap size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 text-sm">闪电判官</h4>
                    <p className="text-[10px] text-gray-400">1分钟内完成10次正确判定</p>
                </div>
            </div>
            <Lock size={14} className="text-gray-300" />
         </div>

         <button className="w-full mt-4 h-12 border-2 border-app-primary rounded-full text-app-primary font-bold flex items-center justify-center space-x-2 active:bg-green-50">
            <Share2 size={18} />
            <span>分享我的侦探名片</span>
        </button>
      </div>

    </div>
  );
};