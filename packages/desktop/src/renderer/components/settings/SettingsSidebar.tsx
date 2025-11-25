import React from 'react';
import { SettingsCategory } from '../SettingsPanel';
import './SettingsSidebar.css';

interface SettingsSidebarProps {
  activeCategory: SettingsCategory;
  onCategoryChange: (category: SettingsCategory) => void;
  onClose: () => void;
}

const categories: Array<{ id: SettingsCategory; label: string }> = [
  { id: 'appearance', label: 'Appearance' },
  { id: 'behavior', label: 'Behavior' },
  { id: 'editor', label: 'Editor' },
  { id: 'browser', label: 'Browser' },
  { id: 'project-display', label: 'Project Display' },
  { id: 'workspace-display', label: 'Workspace Display' },
  { id: 'mcp', label: 'MCP Server' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'backup', label: 'Backup & Restore' },
];

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  activeCategory,
  onCategoryChange,
  onClose,
}) => {
  return (
    <div className="settings-sidebar">
      <div className="settings-sidebar-header">
        <h2>Settings</h2>
        <button onClick={onClose} className="settings-close-btn" title="Close (Esc)">
          ×
        </button>
      </div>
      <nav className="settings-sidebar-nav">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`settings-nav-item ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(category.id)}
          >
            {category.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default SettingsSidebar;

