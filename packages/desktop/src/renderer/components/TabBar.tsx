import React from 'react';
import './TabBar.css';

interface TabBarProps {
  activeTab: 'projects' | 'workspaces';
  onTabChange: (tab: 'projects' | 'workspaces') => void;
  showSettings?: boolean;
  onCloseSettings?: () => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange, showSettings = false, onCloseSettings }) => {
  const handleTabClick = (tab: 'projects' | 'workspaces') => {
    onTabChange(tab);
    // Close settings if open when clicking a tab
    if (showSettings && onCloseSettings) {
      onCloseSettings();
    }
  };

  return (
    <div className="tab-bar">
      <button
        className={`tab-button ${activeTab === 'projects' && !showSettings ? 'active' : ''}`}
        onClick={() => handleTabClick('projects')}
      >
        Projects
      </button>
      <button
        className={`tab-button ${activeTab === 'workspaces' && !showSettings ? 'active' : ''}`}
        onClick={() => handleTabClick('workspaces')}
      >
        Workspaces
      </button>
    </div>
  );
};

export default TabBar;

