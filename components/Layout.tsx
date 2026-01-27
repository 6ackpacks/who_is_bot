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