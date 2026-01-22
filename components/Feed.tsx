import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, MessageCircle, Heart, ArrowRight, BarChart2, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { ContentItem } from '../types';
import { MOCK_FEED } from '../services/mockData';

// UI Text Configuration to avoid hardcoding
const UI_LABELS = {
  headerTitle: "真相解析",
  judgeCorrect: "判断正确",
  judgeWrong: "判断错误",
  contentIs: "该内容确实是",
  aiGen: "AI 生成",
  humanCreat: "真人创作",
  aiScore: "人机感",
  humanScore: "真实感",
  sourceProvider: "来源提供:",
  analysisTitle: "鉴别要点",
  modelSourceLabel: "生成模型/来源",
  communityTitle: "社区讨论",
  nextButton: "继续挑战下一题",
  viewDetailsBtn: "查看解析与讨论",
  skipBtn: "跳过，下一题",
  resultTitleCorrect: "慧眼如炬",
  resultTitleWrong: "遗憾误判",
  resultSubtitle: "这是由",
  resultSubtitleEnd: "创作的内容",
  voteAi: "铁是人机!",
  voteHuman: "包真人的!",
  back: "返回",
  rejudge: "重新判定" // Label for going back to judging
};

type ViewState = 'judging' | 'revealed' | 'details';

export const Feed: React.FC = () => {
  const [items] = useState<ContentItem[]>(MOCK_FEED);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewState, setViewState] = useState<ViewState>('judging');
  const [userChoice, setUserChoice] = useState<'ai' | 'human' | null>(null);
  
  const currentItem = items[currentIndex];

  const handleJudge = (choice: 'ai' | 'human') => {
    setUserChoice(choice);
    setViewState('revealed');
  };

  const handleNext = () => {
    setViewState('judging');
    setUserChoice(null);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handleViewDetails = () => {
    setViewState('details');
  };

  const handleBackToResult = () => {
    setViewState('revealed');
  };

  const handleBackToJudging = () => {
    setViewState('judging');
    setUserChoice(null);
  };

  const isCorrect = userChoice === 'ai' ? currentItem.isAi : !currentItem.isAi;

  // -- Render Details View (Stage 3) --
  if (viewState === 'details') {
    return (
      <motion.div 
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="flex flex-col h-full bg-white overflow-y-auto z-50 fixed inset-0"
      >
        {/* Navigation Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 h-[56px] flex items-center justify-between z-20 shadow-sm">
            <button 
                onClick={handleBackToResult}
                className="flex items-center text-gray-700 hover:text-black active:opacity-60 transition-opacity px-2 -ml-2 py-2"
            >
                <ChevronLeft size={24} />
                <span className="font-medium text-base ml-1">{UI_LABELS.back}</span>
            </button>
            <span className="font-bold text-base absolute left-1/2 transform -translate-x-1/2">
                {UI_LABELS.headerTitle}
            </span>
            <div className="w-8"></div> {/* Spacer for centering */}
        </div>

        <div className="pb-28">
            {/* Header Result Summary */}
            <div className="p-6 pb-4">
                <div className="flex items-center space-x-2 mb-2">
                    {isCorrect ? (
                        <CheckCircle2 className="text-app-green" size={24} color="#10B981" />
                    ) : (
                        <XCircle className="text-app-red" size={24} />
                    )}
                    <h2 className="text-xl font-bold text-gray-900">
                        {isCorrect ? UI_LABELS.judgeCorrect : UI_LABELS.judgeWrong}
                    </h2>
                </div>
                <p className="text-sm text-gray-500 pl-8">
                    {UI_LABELS.contentIs} <span className="font-bold text-black">{currentItem.isAi ? UI_LABELS.aiGen : UI_LABELS.humanCreat}</span>
                </p>
            </div>

            {/* Stats Bar */}
            <div className="px-6 mb-8">
                <div className="flex justify-between text-xs font-bold mb-2 text-gray-500">
                    <span>{UI_LABELS.aiScore} {currentItem.deceptionRate}%</span>
                    <span>{UI_LABELS.humanScore} {100 - currentItem.deceptionRate}%</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-app-red transition-all duration-1000 ease-out" style={{ width: `${currentItem.deceptionRate}%` }}></div>
                    <div className="h-full bg-app-blue flex-1"></div>
                </div>
            </div>

            {/* Provider Info */}
            <div className="px-6 mb-6 flex items-center text-xs text-gray-400">
                <span>{UI_LABELS.sourceProvider}</span>
                <div className="flex items-center ml-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentItem.provider}`} className="w-5 h-5 rounded-full mr-2" alt="avatar"/>
                    <span className="font-bold text-gray-700">{currentItem.provider}</span>
                </div>
            </div>

            {/* Detailed Explanation */}
            <div className="mx-6 p-6 bg-blue-50/40 rounded-2xl border border-blue-100 relative mb-8">
                <Quote className="text-app-blue/20 absolute top-4 left-4 transform -scale-x-100" size={32} />
                <div className="relative z-10 pt-4">
                    <h3 className="font-bold text-gray-900 mb-2 text-sm">{UI_LABELS.analysisTitle}</h3>
                    <p className="text-gray-700 leading-relaxed text-sm text-justify">
                        {currentItem.explanation}
                    </p>
                    <div className="mt-4 pt-4 border-t border-blue-100/50 text-xs text-gray-400 flex justify-between items-center">
                        <span>{UI_LABELS.modelSourceLabel}</span>
                        <span className="font-mono font-bold text-app-blue bg-white px-2 py-0.5 rounded shadow-sm border border-blue-100">
                            {currentItem.isAi ? currentItem.modelTag : 'Human'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Community/Comments */}
            <div className="px-6">
                <h3 className="font-bold text-lg mb-4 flex items-center text-gray-900">
                    <MessageCircle className="mr-2" size={18} />
                    <span>{UI_LABELS.communityTitle}</span>
                </h3>
                
                <div className="space-y-6">
                    {currentItem.comments.map(comment => (
                        <div key={comment.id} className="flex space-x-3">
                            <img src={comment.avatar} alt={comment.user} className="w-9 h-9 rounded-full bg-gray-100 border border-gray-100" />
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-bold text-gray-800">{comment.user}</span>
                                    <div className="flex items-center space-x-1 text-gray-400">
                                        <Heart size={14} />
                                        <span className="text-xs font-medium">{comment.likes}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{comment.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Floating Action Button for Next */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent z-30 border-t border-gray-50">
             <button 
                onClick={handleNext}
                className="w-full h-12 bg-black text-white rounded-full font-bold shadow-xl flex items-center justify-center space-x-2 active:scale-95 transition-transform"
            >
                <span>{UI_LABELS.nextButton}</span>
                <ArrowRight size={18} />
            </button>
        </div>
      </motion.div>
    );
  }

  // -- Render Main Card (Judging or Revealed Stage) --
  return (
    <div className="relative w-full h-full flex flex-col bg-app-bg">
      {/* Content Card Area */}
      <div className="flex-1 px-4 pt-4 pb-28 overflow-y-auto flex items-center justify-center relative">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-sm bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 relative min-h-[60vh] flex flex-col transition-all duration-300 ${viewState === 'revealed' ? 'scale-[0.98] brightness-95' : ''}`}
          >
             <div className="absolute top-4 left-4 z-10">
                <Quote className="text-gray-200 transform -scale-x-100" size={48} />
             </div>

            {/* Dynamic Content */}
            {currentItem.type === 'image' ? (
              <div className="flex-1 relative bg-gray-50">
                  <img 
                    src={currentItem.url} 
                    alt="Content" 
                    className="w-full h-full object-cover"
                  />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                   <div className="absolute bottom-4 left-4 text-white font-bold text-xl shadow-black drop-shadow-md">
                      {currentItem.title}
                   </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col p-8 pt-16">
                 <p className="text-lg leading-loose text-gray-800 font-serif tracking-wide">
                  {currentItem.text}
                 </p>
              </div>
            )}
            
            {/* Revealed Overlay on Card (Stage 2) */}
            <AnimatePresence>
                {viewState === 'revealed' && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
                    >
                        {/* Return / Re-judge Button */}
                        <div className="absolute top-4 left-4 z-30">
                            <button 
                                onClick={handleBackToJudging}
                                className="flex items-center text-gray-500 hover:text-black transition-colors p-2 rounded-full active:bg-gray-100"
                            >
                                <ChevronLeft size={24} />
                                <span className="text-sm font-bold ml-1">{UI_LABELS.back}</span>
                            </button>
                        </div>

                         {isCorrect ? (
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 ring-4 ring-green-50">
                                <CheckCircle2 className="text-green-500" size={40} />
                            </div>
                        ) : (
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 ring-4 ring-red-50">
                                <XCircle className="text-red-500" size={40} />
                            </div>
                        )}
                        
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {isCorrect ? UI_LABELS.resultTitleCorrect : UI_LABELS.resultTitleWrong}
                        </h3>
                        
                        <p className="text-gray-500 text-sm mb-6">
                            {UI_LABELS.resultSubtitle} <span className="font-bold text-black">{currentItem.isAi ? currentItem.modelTag : 'Human'}</span> {UI_LABELS.resultSubtitleEnd}
                        </p>

                        <div className="w-full mb-8">
                            <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                                <span>{currentItem.deceptionRate}% 认为是AI</span>
                            </div>
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-app-red" 
                                    style={{ width: `${currentItem.deceptionRate}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col w-full space-y-3">
                            <button 
                                onClick={handleViewDetails}
                                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-sm flex items-center justify-center space-x-2 shadow-lg hover:bg-black active:scale-95 transition-all"
                            >
                                <BarChart2 size={18} />
                                <span>{UI_LABELS.viewDetailsBtn}</span>
                            </button>
                            <button 
                                onClick={handleNext}
                                className="w-full py-4 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
                            >
                                {UI_LABELS.skipBtn}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
          </motion.div>
      </div>

      {/* Judgment Buttons (Only visible in Judging Stage) */}
      <AnimatePresence>
        {viewState === 'judging' && (
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="absolute bottom-4 left-0 right-0 z-20 flex justify-center space-x-4 px-6 pb-4"
            >
                <button
                onClick={() => handleJudge('ai')}
                className="flex-1 h-14 bg-app-red text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-100 active:scale-95 transition-transform"
                >
                <span className="font-bold text-sm tracking-widest">{UI_LABELS.voteAi}</span>
                </button>

                <button
                onClick={() => handleJudge('human')}
                className="flex-1 h-14 bg-app-blue text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 active:scale-95 transition-transform"
                >
                <span className="font-bold text-sm tracking-widest">{UI_LABELS.voteHuman}</span>
                </button>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};