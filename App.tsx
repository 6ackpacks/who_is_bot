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