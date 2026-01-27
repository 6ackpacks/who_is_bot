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
            <img src="https://images.unsplash.com/photo-1537047902294-62286416950a?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover opacity-60" alt="video" />
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
                                        <img src={comment.avatar} className="w-8 h-8 rounded-full bg-gray-200" alt={comment.user} />
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
