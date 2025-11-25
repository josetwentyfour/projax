import React, { useState, useEffect } from 'react';
import { ElectronAPI } from '../../../main/preload';
import './SettingsCategory.css';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

const AppearanceSettings: React.FC = () => {
  const [uiDensity, setUiDensity] = useState<'compact' | 'normal' | 'comfortable'>('normal');
  const [fontSize, setFontSize] = useState(13);
  const [animations, setAnimations] = useState(true);
  const [defaultView, setDefaultView] = useState<'projects' | 'workspaces'>('projects');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await window.electronAPI.getSettings();
      if (settings.appearance) {
        if (settings.appearance.uiDensity) setUiDensity(settings.appearance.uiDensity);
        if (settings.appearance.fontSize) setFontSize(settings.appearance.fontSize);
        if (settings.appearance.animations !== undefined) setAnimations(settings.appearance.animations);
        if (settings.appearance.defaultView) setDefaultView(settings.appearance.defaultView);
      }
    } catch (error) {
      console.error('Error loading appearance settings:', error);
    }
  };

  const handleSave = async (updates: Partial<{ uiDensity: string; fontSize: number; animations: boolean; defaultView: string }>) => {
    try {
      setSaving(true);
      const current = await window.electronAPI.getSettings();
      const updated = {
        ...current,
        appearance: {
          ...(current.appearance || {}),
          ...updates,
        },
      };
      await window.electronAPI.saveSettings(updated);
    } catch (error) {
      console.error('Error saving appearance settings:', error);
      alert(`Failed to save settings: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-category">
      <div className="settings-category-header">
        <h1>Appearance</h1>
        <p className="settings-category-description">Customize the look and feel of PROJAX</p>
      </div>

      <div className="settings-category-content">
        <div className="settings-section">
          <h3>UI Density</h3>
          <div className="settings-field">
            <label>Interface Density</label>
            <select
              value={uiDensity}
              onChange={(e) => {
                const value = e.target.value as 'compact' | 'normal' | 'comfortable';
                setUiDensity(value);
                handleSave({ uiDensity: value });
              }}
              className="settings-select"
              disabled={saving}
            >
              <option value="compact">Compact</option>
              <option value="normal">Normal</option>
              <option value="comfortable">Comfortable</option>
            </select>
            <p className="settings-hint">Controls spacing and padding throughout the interface</p>
          </div>
        </div>

        <div className="settings-section">
          <h3>Font Size</h3>
          <div className="settings-field">
            <label>Base Font Size (px)</label>
            <input
              type="number"
              min="10"
              max="18"
              value={fontSize}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value >= 10 && value <= 18) {
                  setFontSize(value);
                  handleSave({ fontSize: value });
                }
              }}
              className="settings-input"
              disabled={saving}
            />
            <p className="settings-hint">Base font size for the application (10-18px)</p>
          </div>
        </div>

        <div className="settings-section">
          <h3>Animations</h3>
          <div className="settings-field">
            <label className="settings-toggle-label">
              <input
                type="checkbox"
                checked={animations}
                onChange={(e) => {
                  setAnimations(e.target.checked);
                  handleSave({ animations: e.target.checked });
                }}
                className="settings-toggle"
                disabled={saving}
              />
              <span>Enable animations and transitions</span>
            </label>
            <p className="settings-hint">Smooth transitions and animations throughout the interface</p>
          </div>
        </div>

        <div className="settings-section">
          <h3>Navigation</h3>
          <div className="settings-field">
            <label>Default View</label>
            <select
              value={defaultView}
              onChange={(e) => {
                const value = e.target.value as 'projects' | 'workspaces';
                setDefaultView(value);
                handleSave({ defaultView: value });
              }}
              className="settings-select"
              disabled={saving}
            >
              <option value="projects">Projects</option>
              <option value="workspaces">Workspaces</option>
            </select>
            <p className="settings-hint">Default tab to show when opening PROJAX</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;

