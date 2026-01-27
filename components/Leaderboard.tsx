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
