import React, { useState, useEffect } from 'react';
import { ElectronAPI } from '../../../main/preload';
import './SettingsCategory.css';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

const BrowserSettings: React.FC = () => {
  const [browserType, setBrowserType] = useState<'chrome' | 'firefox' | 'safari' | 'edge' | 'custom'>('chrome');
  const [customPath, setCustomPath] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await window.electronAPI.getSettings();
      if (settings.browser) {
        setBrowserType(settings.browser.type);
        setCustomPath(settings.browser.customPath || '');
      }
    } catch (error) {
      console.error('Error loading browser settings:', error);
    }
  };

  const handleSave = async (updates: Partial<{ type: string; customPath?: string }>) => {
    try {
      setSaving(true);
      const current = await window.electronAPI.getSettings();
      const updated = {
        ...current,
        browser: {
          ...current.browser,
          ...updates,
        },
      };
      await window.electronAPI.saveSettings(updated);
    } catch (error) {
      console.error('Error saving browser settings:', error);
      alert(`Failed to save settings: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-category">
      <div className="settings-category-header">
        <h1>Browser</h1>
        <p className="settings-category-description">Configure your preferred web browser</p>
      </div>

      <div className="settings-category-content">
        <div className="settings-section">
          <h3>Browser Type</h3>
          <div className="settings-field">
            <label>Browser</label>
            <select
              value={browserType}
              onChange={(e) => {
                const value = e.target.value as 'chrome' | 'firefox' | 'safari' | 'edge' | 'custom';
                setBrowserType(value);
                handleSave({ type: value, customPath: value === 'custom' ? customPath : undefined });
              }}
              className="settings-select"
              disabled={saving}
            >
              <option value="chrome">Chrome</option>
              <option value="firefox">Firefox</option>
              <option value="safari">Safari</option>
              <option value="edge">Edge</option>
              <option value="custom">Custom</option>
            </select>
            <p className="settings-hint">Select your preferred web browser</p>
          </div>
          {browserType === 'custom' && (
            <div className="settings-field">
              <label>Custom Browser Path</label>
              <input
                type="text"
                value={customPath}
                onChange={(e) => {
                  setCustomPath(e.target.value);
                  handleSave({ customPath: e.target.value });
                }}
                placeholder="/path/to/browser"
                className="settings-input"
                disabled={saving}
              />
              <p className="settings-hint">Full path to your custom browser executable</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowserSettings;

