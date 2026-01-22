import React, { useState } from 'react';
import { MOCK_LEADERBOARD } from '../services/mockData';
import { ContentType } from '../types';
import { Trophy, Video, Image as ImageIcon, AlignLeft } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const [activeType, setActiveType] = useState<ContentType | 'all'>('all');

  const filteredData = activeType === 'all' 
    ? MOCK_LEADERBOARD 
    : MOCK_LEADERBOARD.filter(item => item.type === activeType);

  const sortedData = [...filteredData].sort((a, b) => b.deceptionRate - a.deceptionRate);

  const tabs = [
    { id: 'all', icon: Trophy, label: '全部' },
    { id: 'video', icon: Video, label: '视频' },
    { id: 'image', icon: ImageIcon, label: '图片' },
    { id: 'text', icon: AlignLeft, label: '文字' },
  ];

  return (
    <div className="flex flex-col h-full bg-app-bg pt-2">
      {/* Category Tabs */}
      <div className="flex px-4 space-x-3 mb-4 overflow-x-auto no-scrollbar py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveType(tab.id as any)}
              className={`flex items-center space-x-1 px-4 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-black text-white border-black shadow-md' 
                  : 'bg-white border-gray-200 text-gray-500'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* List Header */}
      <div className="px-6 pb-2 text-xs text-gray-400 font-medium flex justify-between">
         <span>模型名称</span>
         <span>误判率</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-3">
          {sortedData.map((item, index) => (
            <div 
              key={item.id} 
              className="relative bg-white border border-gray-100 rounded-xl p-4 flex items-center space-x-4 shadow-sm"
            >
              {/* Rank Number */}
              <div className={`w-6 h-6 flex items-center justify-center font-bold text-sm italic rounded-full ${
                index === 0 ? 'bg-yellow-100 text-yellow-600' : 
                index === 1 ? 'bg-gray-100 text-gray-600' : 
                index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-transparent text-gray-400'
              }`}>
                {index + 1}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-gray-800 text-base truncate">{item.modelName}</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                    {item.company}
                  </span>
                </div>
                <div className="flex items-center text-xs text-gray-400 mt-1 space-x-2">
                    <span className="capitalize">{item.type === 'image' ? '图像' : item.type === 'text' ? '文本' : '视频'}模型</span>
                    <span>•</span>
                    <span>{item.totalTests.toLocaleString()} 次测试</span>
                </div>
              </div>

              {/* Rate */}
              <div className="flex flex-col items-end">
                <div className="text-xl font-black text-app-blue">
                  {item.deceptionRate}%
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};