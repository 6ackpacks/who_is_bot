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
