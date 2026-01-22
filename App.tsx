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
      case TabView.PUBLISH:
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-app-bg">
             <div className="w-20 h-20 rounded-full bg-white border border-dashed border-gray-300 flex items-center justify-center mb-6">
                <span className="text-4xl text-gray-300">+</span>
             </div>
             <h2 className="text-xl font-bold text-gray-900 mb-2">上传样本</h2>
             <p className="text-gray-500 mb-8 max-w-xs text-sm">贡献疑似 AI 生成的内容，让社区来判定。</p>
             <button 
               onClick={() => setActiveTab(TabView.FEED)}
               className="px-6 py-2 border border-black text-black rounded-full text-sm font-bold hover:bg-gray-50"
             >
               返回
             </button>
          </div>
        );
      case TabView.SQUARE:
         return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-app-bg">
             <h2 className="text-xl font-bold text-gray-900 mb-2">社区广场</h2>
             <p className="text-gray-500 text-sm">讨论区即将开放...</p>
          </div>
        );
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