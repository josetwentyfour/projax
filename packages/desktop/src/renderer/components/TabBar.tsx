import React from 'react';
import './TabBar.css';

interface TabBarProps {
  activeTab: 'projects' | 'workspaces';
  onTabChange: (tab: 'projects' | 'workspaces') => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="tab-bar">
      <button
        className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
        onClick={() => onTabChange('projects')}
      >
        Projects
      </button>
      <button
        className={`tab-button ${activeTab === 'workspaces' ? 'active' : ''}`}
        onClick={() => onTabChange('workspaces')}
      >
        Workspaces
      </button>
    </div>
  );
};

export default TabBar;

