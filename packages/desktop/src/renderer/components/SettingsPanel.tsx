import React, { useState, useEffect } from 'react';
import { ElectronAPI } from '../../main/preload';
import SettingsSidebar from './settings/SettingsSidebar';
import AppearanceSettings from './settings/AppearanceSettings';
import BehaviorSettings from './settings/BehaviorSettings';
import EditorSettings from './settings/EditorSettings';
import BrowserSettings from './settings/BrowserSettings';
import ProjectDisplaySettings from './settings/ProjectDisplaySettings';
import WorkspaceDisplaySettings from './settings/WorkspaceDisplaySettings';
import MCPSettings from './settings/MCPSettings';
import AdvancedSettings from './settings/AdvancedSettings';
import BackupSettings from './settings/BackupSettings';
import './SettingsPanel.css';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export type SettingsCategory = 
  | 'appearance'
  | 'behavior'
  | 'editor'
  | 'browser'
  | 'project-display'
  | 'workspace-display'
  | 'mcp'
  | 'advanced'
  | 'backup';

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('appearance');
  const [loading, setLoading] = useState(true);

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'appearance':
        return <AppearanceSettings />;
      case 'behavior':
        return <BehaviorSettings />;
      case 'editor':
        return <EditorSettings />;
      case 'browser':
        return <BrowserSettings />;
      case 'project-display':
        return <ProjectDisplaySettings />;
      case 'workspace-display':
        return <WorkspaceDisplaySettings />;
      case 'mcp':
        return <MCPSettings />;
      case 'advanced':
        return <AdvancedSettings />;
      case 'backup':
        return <BackupSettings />;
      default:
        return <AppearanceSettings />;
    }
  };

  if (loading) {
    return (
      <div className="settings-panel">
        <div className="settings-panel-loading">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="settings-panel">
      <SettingsSidebar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onClose={onClose}
      />
      <div className="settings-panel-content">
        {renderCategoryContent()}
      </div>
    </div>
  );
};

export default SettingsPanel;

