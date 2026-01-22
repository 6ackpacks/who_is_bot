import React from 'react';
import { LayoutGrid, PlusCircle, Search, User, Zap } from 'lucide-react';
import { TabView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabView;
  onTabChange: (tab: TabView) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const navItems = [
    { id: TabView.FEED, icon: Zap, label: '判定' },
    { id: TabView.LAB, icon: LayoutGrid, label: '榜单' },
    { id: TabView.PUBLISH, icon: PlusCircle, label: '发布', isPrimary: true },
    { id: TabView.SQUARE, icon: Search, label: '广场' },
    { id: TabView.PROFILE, icon: User, label: '我的' },
  ];

  return (
    <div className="flex flex-col h-screen w-full bg-app-bg text-app-text overflow-hidden relative font-sans">
      {/* Top Header Placeholder (Global) */}
      <header className="h-[44px] flex items-center justify-center bg-app-card font-medium text-lg border-b border-gray-100 z-50">
        谁是人机?
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full h-full overflow-hidden relative z-0">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="h-[80px] pb-4 bg-white border-t border-gray-200 flex items-center justify-around z-50 shrink-0 select-none shadow-sm">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          if (item.isPrimary) {
             return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="flex flex-col items-center justify-center -mt-6 group"
              >
                <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center shadow-lg group-active:scale-95 transition-transform duration-200">
                  <Icon size={28} strokeWidth={2.5} />
                </div>
                <span className="text-xs mt-1 text-black font-bold">{item.label}</span>
              </button>
             );
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center w-16 space-y-1 transition-colors duration-200 ${
                isActive ? 'text-black' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 2} 
                fill={isActive ? "currentColor" : "none"}
                className="transition-all"
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};