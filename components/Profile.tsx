import React from 'react';
import { Hexagon, Share2, Award, Zap, Activity, Settings } from 'lucide-react';

export const Profile: React.FC = () => {
  return (
    <div className="h-full bg-app-bg overflow-y-auto pb-24">
      {/* Header Profile */}
      <div className="relative pt-12 pb-8 px-6 bg-white border-b border-gray-100 flex flex-col items-center">
         <div className="absolute top-4 right-4 text-gray-400">
            <Settings size={20} />
         </div>

         <div className="w-20 h-20 relative mb-3">
            <img 
              src="https://picsum.photos/200" 
              alt="Avatar" 
              className="w-full h-full rounded-full border-4 border-white shadow-lg object-cover"
            />
            <div className="absolute -bottom-1 -right-1 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white">
                Lv.5
            </div>
         </div>
         
         <h2 className="text-xl font-bold text-gray-900">鉴伪专家_007</h2>
         <p className="text-gray-400 text-xs font-mono mt-1">UID: 8940201</p>

         {/* Stats Row */}
         <div className="flex w-full justify-center space-x-12 mt-6">
            <div className="flex flex-col items-center">
                <span className="text-lg font-black text-gray-900">78%</span>
                <span className="text-xs text-gray-400">准确率</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-lg font-black text-gray-900">124</span>
                <span className="text-xs text-gray-400">已判定</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-lg font-black text-gray-900">12</span>
                <span className="text-xs text-gray-400">连续正确</span>
            </div>
         </div>
      </div>

      {/* Menu / Achievements */}
      <div className="p-6 space-y-4">
        <h3 className="text-gray-900 text-sm font-bold">成就勋章</h3>
        
        <div className="bg-white rounded-xl p-4 flex items-center space-x-4 shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center">
                <Award size={20} />
            </div>
            <div className="flex-1">
                <h4 className="text-gray-900 font-bold text-sm">火眼金睛</h4>
                <p className="text-xs text-gray-500 mt-0.5">连续正确识别 50 张 AI 图片。</p>
            </div>
            <div className="text-xs font-medium text-gray-400">34/50</div>
        </div>

        <div className="bg-white rounded-xl p-4 flex items-center space-x-4 shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <Hexagon size={20} />
            </div>
            <div className="flex-1">
                <h4 className="text-gray-900 font-bold text-sm">贡献者</h4>
                <p className="text-xs text-gray-500 mt-0.5">向实验室上传 5 个样本。</p>
            </div>
            <div className="text-xs font-medium text-gray-400">1/5</div>
        </div>

        <button className="w-full mt-8 py-3 bg-white border border-gray-200 rounded-full text-gray-700 font-bold flex items-center justify-center space-x-2 shadow-sm active:bg-gray-50">
            <Share2 size={18} />
            <span>分享我的主页</span>
        </button>
      </div>
    </div>
  );
};