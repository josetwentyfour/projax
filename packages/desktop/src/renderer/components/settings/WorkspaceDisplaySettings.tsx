import React, { useState, useEffect } from 'react';
import { ElectronAPI } from '../../../main/preload';
import './SettingsCategory.css';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

const WorkspaceDisplaySettings: React.FC = () => {
  const [workspaceTiles, setWorkspaceTiles] = useState({
    showName: true,
    showDescription: true,
    showPath: true,
    showTags: true,
    showProjectCount: true,
  });
  const [workspaceDetails, setWorkspaceDetails] = useState({
    showProjectList: true,
    showDescription: true,
    showPath: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await window.electronAPI.getSettings();
      if (settings.display) {
        if (settings.display.workspaceTiles) setWorkspaceTiles(settings.display.workspaceTiles);
        if (settings.display.workspaceDetails) setWorkspaceDetails(settings.display.workspaceDetails);
      }
    } catch (error) {
      console.error('Error loading workspace display settings:', error);
    }
  };

  const handleSave = async (updates: any) => {
    try {
      setSaving(true);
      const current = await window.electronAPI.getSettings();
      const updated = {
        ...current,
        display: {
          ...current.display,
          ...updates,
        },
      };
      await window.electronAPI.saveSettings(updated);
    } catch (error) {
      console.error('Error saving workspace display settings:', error);
      alert(`Failed to save settings: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-category">
      <div className="settings-category-header">
        <h1>Workspace Display</h1>
        <p className="settings-category-description">Customize what information is shown in workspace tiles and details</p>
      </div>

      <div className="settings-category-content">
        <div className="settings-section">
          <h3>Workspace Tiles</h3>
          <p className="settings-section-description">Control what appears in the workspace list sidebar</p>
          
          <div className="settings-field">
            <label className="settings-toggle-label">
              <input
                type="checkbox"
                checked={workspaceTiles.showName}
                onChange={(e) => {
                  const updated = { ...workspaceTiles, showName: e.target.checked };
                  setWorkspaceTiles(updated);
                  handleSave({ workspaceTiles: updated });
                }}
                className="settings-toggle"
                disabled={saving}
              />
              <span>Show workspace name</span>
            </label>
          </div>

          <div className="settings-field">
            <label className="settings-toggle-label">
              <input
                type="checkbox"
                checked={workspaceTiles.showDescription}
                onChange={(e) => {
                  const updated = { ...workspaceTiles, showDescription: e.target.checked };
                  setWorkspaceTiles(updated);
                  handleSave({ workspaceTiles: updated });
                }}
                className="settings-toggle"
                disabled={saving}
              />
              <span>Show description</span>
            </label>
          </div>

          <div className="settings-field">
            <label className="settings-toggle-label">
              <input
                type="checkbox"
                checked={workspaceTiles.showPath}
                onChange={(e) => {
                  const updated = { ...workspaceTiles, showPath: e.target.checked };
                  setWorkspaceTiles(updated);
                  handleSave({ workspaceTiles: updated });
                }}
                className="settings-toggle"
                disabled={saving}
              />
              <span>Show path</span>
            </label>
          </div>

          <div className="settings-field">
            <label className="settings-toggle-label">
              <input
                type="checkbox"
                checked={workspaceTiles.showTags}
                onChange={(e) => {
                  const updated = { ...workspaceTiles, showTags: e.target.checked };
                  setWorkspaceTiles(updated);
                  handleSave({ workspaceTiles: updated });
                }}
                className="settings-toggle"
                disabled={saving}
              />
              <span>Show tags</span>
            </label>
          </div>

          <div className="settings-field">
            <label className="settings-toggle-label">
              <input
                type="checkbox"
                checked={workspaceTiles.showProjectCount}
                onChange={(e) => {
                  const updated = { ...workspaceTiles, showProjectCount: e.target.checked };
                  setWorkspaceTiles(updated);
                  handleSave({ workspaceTiles: updated });
                }}
                className="settings-toggle"
                disabled={saving}
              />
              <span>Show project count</span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>Workspace Details</h3>
          <p className="settings-section-description">Control what sections appear in the workspace details view</p>
          
          <div className="settings-field">
            <label className="settings-toggle-label">
              <input
                type="checkbox"
                checked={workspaceDetails.showProjectList}
                onChange={(e) => {
                  const updated = { ...workspaceDetails, showProjectList: e.target.checked };
                  setWorkspaceDetails(updated);
                  handleSave({ workspaceDetails: updated });
                }}
                className="settings-toggle"
                disabled={saving}
              />
              <span>Show project list</span>
            </label>
          </div>

          <div className="settings-field">
            <label className="settings-toggle-label">
              <input
                type="checkbox"
                checked={workspaceDetails.showDescription}
                onChange={(e) => {
                  const updated = { ...workspaceDetails, showDescription: e.target.checked };
                  setWorkspaceDetails(updated);
                  handleSave({ workspaceDetails: updated });
                }}
                className="settings-toggle"
                disabled={saving}
              />
              <span>Show description</span>
            </label>
          </div>

          <div className="settings-field">
            <label className="settings-toggle-label">
              <input
                type="checkbox"
                checked={workspaceDetails.showPath}
                onChange={(e) => {
                  const updated = { ...workspaceDetails, showPath: e.target.checked };
                  setWorkspaceDetails(updated);
                  handleSave({ workspaceDetails: updated });
                }}
                className="settings-toggle"
                disabled={saving}
              />
              <span>Show path</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDisplaySettings;

