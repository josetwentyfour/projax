import React, { useState, useEffect, useRef } from 'react';
import { ElectronAPI } from '../../main/preload';
import './WorkspaceList.css';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

type Workspace = any;

interface WorkspaceListProps {
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  onSelectWorkspace: (workspace: Workspace) => void;
  loading: boolean;
  keyboardFocusedIndex?: number;
  onKeyboardFocusChange?: (index: number) => void;
  workspaceProjects?: Map<number, number>; // workspace id -> project count
}

function getDisplayPath(fullPath: string): string {
  const parts = fullPath.split('/').filter(Boolean);
  if (parts.length === 0) return fullPath;
  return parts[parts.length - 1];
}

const WorkspaceList: React.FC<WorkspaceListProps> = ({
  workspaces,
  selectedWorkspace,
  onSelectWorkspace,
  loading,
  keyboardFocusedIndex = -1,
  onKeyboardFocusChange,
  workspaceProjects,
}) => {
  const [displaySettings, setDisplaySettings] = useState({
    showName: true,
    showDescription: true,
    showPath: true,
    showTags: true,
    showProjectCount: true,
  });

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDisplaySettings();
  }, []);

  const loadDisplaySettings = async () => {
    try {
      const settings = await window.electronAPI.getSettings();
      if (settings.display?.workspaceTiles) {
        setDisplaySettings(settings.display.workspaceTiles);
      }
    } catch (error) {
      console.error('Error loading display settings:', error);
    }
  };

  if (loading) {
    return (
      <div className="workspace-list-loading">
        <p>Loading workspaces...</p>
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="workspace-list-empty">
        <p>No workspaces yet</p>
        <p className="hint">Add a workspace to get started</p>
      </div>
    );
  }

  return (
    <div 
      ref={listRef}
      className="workspace-list" 
      role="listbox" 
      aria-label="Workspaces" 
      tabIndex={0}
      onFocus={(e) => {
        if (keyboardFocusedIndex < 0 && workspaces.length > 0 && onKeyboardFocusChange) {
          onKeyboardFocusChange(0);
        }
      }}
      onBlur={(e) => {
        if (onKeyboardFocusChange && !listRef.current?.contains(e.relatedTarget as Node)) {
          onKeyboardFocusChange(-1);
        }
      }}
    >
      {workspaces.map((workspace, index) => {
        const isSelected = selectedWorkspace?.id === workspace.id;
        const isKeyboardFocused = keyboardFocusedIndex === index;
        const projectCount = workspaceProjects?.get(workspace.id) || 0;

        return (
          <div
            key={workspace.id}
            className={`workspace-item ${isSelected ? 'selected' : ''} ${isKeyboardFocused ? 'keyboard-focused' : ''}`}
            onClick={() => onSelectWorkspace(workspace)}
            role="option"
            aria-selected={isSelected}
            tabIndex={index === 0 ? 0 : -1}
            onFocus={(e) => {
              e.currentTarget.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              if (onKeyboardFocusChange) {
                onKeyboardFocusChange(index);
              }
            }}
            ref={(el) => {
              if (isKeyboardFocused && el && onKeyboardFocusChange) {
                el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              }
            }}
          >
            <div className="workspace-item-header">
              <div className="workspace-name-wrapper">
                {displaySettings.showName && <h3 className="workspace-name">{workspace.name}</h3>}
              </div>
              {displaySettings.showProjectCount && (
                <span className="workspace-project-count">{projectCount}</span>
              )}
            </div>
            {displaySettings.showDescription && workspace.description && (
              <p className="workspace-description">{workspace.description}</p>
            )}
            {displaySettings.showPath && (
            <p className="workspace-path">{getDisplayPath(workspace.workspace_file_path)}</p>
            )}
            {displaySettings.showTags && workspace.tags && workspace.tags.length > 0 && (
              <div className="workspace-tags">
                {workspace.tags.map((tag: string) => (
                  <span key={tag} className="workspace-tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WorkspaceList;

