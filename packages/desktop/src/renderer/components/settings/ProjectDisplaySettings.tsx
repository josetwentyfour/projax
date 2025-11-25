import React, { useState, useEffect } from 'react';
import { ElectronAPI } from '../../../main/preload';
import './SettingsCategory.css';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

const ProjectDisplaySettings: React.FC = () => {
  const [projectTiles, setProjectTiles] = useState({
    showName: true,
    showDescription: true,
    showTags: true,
    showRunningIndicator: true,
    showPorts: true,
    showGitBranch: true,
  });
  const [projectDetails, setProjectDetails] = useState({
    showStats: true,
    showTestResults: true,
    showTags: true,
    showUrls: true,
    showScripts: true,
    showJenkins: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await window.electronAPI.getSettings();
      if (settings.display) {
        if (settings.display.projectTiles) setProjectTiles(settings.display.projectTiles);
        if (settings.display.projectDetails) setProjectDetails(settings.display.projectDetails);
      }
    } catch (error) {
      console.error('Error loading project display settings:', error);
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
      console.error('Error saving project display settings:', error);
      alert(`Failed to save settings: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-category">
      <div className="settings-category-header">
        <h1>Project Display</h1>
        <p className="settings-category-description">Customize what information is shown in project tiles and details</p>
      </div>

      <div className="settings-category-content">
        <div className="settings-section">
          <h3>Project Tiles</h3>
          <p className="settings-section-description">Control what appears in the project list sidebar</p>
          
          <div className="settings-field">
            <label className="settings-toggle-label">
              <input
                type="checkbox"
                checked={projectTiles.showName}
                onChange={(e) => {
                  const updated = { ...projectTiles, showName: e.target.checked };
                  setProjectTiles(updated);
                  handleSave({ projectTiles: updated });
                }}
                className="settings-toggle"
                disabled={saving}
              />
              <span>Show project name</span>
            </label>
          </div>

          <div className="settings-field">
            <label className="settings-toggle-label">
              <input
                type="checkbox"
                checked={projectTiles.showDescription}
                onChange={(e) => {
                  const updated = { ...projectTiles, showDescription: e.target.checked };
                  setProjectTiles(updated);
                  handleSave({ projectTiles: updated });
                }}
                className="settings-toggle"
                disabled={saving}
              />
              <span>Show description/path</span>
            </label>
          </div>

          <div className="settings-field">
            <label className="settings-toggle-label">
              <input
                type="checkbox"
                checked={projectTiles.showTags}
                onChange={(e) => {
                  const updated = { ...projectTiles, showTags: e.target.checked };
                  setProjectTiles(updated);
                  handleSave({ projectTiles: updated });
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
                checked={projectTiles.showRunningIndicator}
                onChange={(e) => {
                  const updated = { ...projectTiles, showRunningIndicator: e.target.checked };
                  setProjectTiles(updated);
                  handleSave({ projectTiles: updated });
                }}
                className="settings-toggle"
                disabled={saving}
              />
              <span>Show running indicator</span>
            </label>
          </div>

          <div className="settings-field">
            <label className="settings-toggle-label">
              <input
                type="checkbox"
                checked={projectTiles.showPorts}
                onChange={(e) => {
                  const updated = { ...projectTiles, showPorts: e.target.checked };
                  setProjectTiles(updated);
                  handleSave({ projectTiles: updated });
                }}
                className="settings-toggle"
                disabled={saving}
              />
              <span>Show ports</span>
            </label>
          </div>

          <div className="settings-field">
            <label className="settings-toggle-label">
              <input
                type="checkbox"
                checked={projectTiles.showGitBranch}
                onChange={(e) => {
                  const updated = { ...projectTiles, showGitBranch: e.target.checked };
                  setProjectTiles(updated);
                  handleSave({ projectTiles: updated });
                }}
                className="settings-toggle"
                disabled={saving}
              />
              <span>Show git branch</span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>Project Details</h3>
          <p className="settings-section-description">Control what sections appear in the project details view</p>
          
          <div className="settings-field">
            <label className="settings-toggle-label">
              <input
                type="checkbox"
                checked={projectDetails.showStats}
                onChange={(e) => {
                  const updated = { ...projectDetails, showStats: e.target.checked };
                  setProjectDetails(updated);
                  handleSave({ projectDetails: updated });
                }}
                className="settings-toggle"
                disabled={saving}
              />
              <span>Show stats cards (ports, scripts)</span>
            </label>
          </div>

          <div className="settings-field">
            <label className="settings-toggle-label">
              <input
                type="checkbox"
                checked={projectDetails.showTestResults}
                onChange={(e) => {
                  const updated = { ...projectDetails, showTestResults: e.target.checked };
                  setProjectDetails(updated);
                  handleSave({ projectDetails: updated });
                }}
                className="settings-toggle"
                disabled={saving}
              />
              <span>Show test results</span>
            </label>
          </div>

          <div className="settings-field">
            <label className="settings-toggle-label">
              <input
                type="checkbox"
                checked={projectDetails.showTags}
                onChange={(e) => {
                  const updated = { ...projectDetails, showTags: e.target.checked };
                  setProjectDetails(updated);
                  handleSave({ projectDetails: updated });
                }}
                className="settings-toggle"
                disabled={saving}
              />
              <span>Show tags section</span>
            </label>
          </div>

          <div className="settings-field">
            <label className="settings-toggle-label">
              <input
                type="checkbox"
                checked={projectDetails.showUrls}
                onChange={(e) => {
                  const updated = { ...projectDetails, showUrls: e.target.checked };
                  setProjectDetails(updated);
                  handleSave({ projectDetails: updated });
                }}
                className="settings-toggle"
                disabled={saving}
              />
              <span>Show URLs section</span>
            </label>
          </div>

          <div className="settings-field">
            <label className="settings-toggle-label">
              <input
                type="checkbox"
                checked={projectDetails.showScripts}
                onChange={(e) => {
                  const updated = { ...projectDetails, showScripts: e.target.checked };
                  setProjectDetails(updated);
                  handleSave({ projectDetails: updated });
                }}
                className="settings-toggle"
                disabled={saving}
              />
              <span>Show scripts section</span>
            </label>
          </div>

          <div className="settings-field">
            <label className="settings-toggle-label">
              <input
                type="checkbox"
                checked={projectDetails.showJenkins}
                onChange={(e) => {
                  const updated = { ...projectDetails, showJenkins: e.target.checked };
                  setProjectDetails(updated);
                  handleSave({ projectDetails: updated });
                }}
                className="settings-toggle"
                disabled={saving}
              />
              <span>Show Jenkins placeholder</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDisplaySettings;

