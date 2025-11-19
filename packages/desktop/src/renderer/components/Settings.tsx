import React, { useState, useEffect } from 'react';
import { ElectronAPI } from '../../main/preload';
import './Settings.css';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

interface SettingsProps {
  onClose: () => void;
}

interface AppSettings {
  editor: {
    type: 'vscode' | 'cursor' | 'windsurf' | 'zed' | 'custom';
    customPath?: string;
  };
  browser: {
    type: 'chrome' | 'firefox' | 'safari' | 'edge' | 'custom';
    customPath?: string;
  };
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<AppSettings>({
    editor: { type: 'vscode' },
    browser: { type: 'chrome' },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const loadedSettings = await window.electronAPI.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await window.electronAPI.saveSettings(settings);
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(`Failed to save settings: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEditorTypeChange = (type: 'vscode' | 'cursor' | 'windsurf' | 'zed' | 'custom') => {
    setSettings({
      ...settings,
      editor: {
        type,
        customPath: type === 'custom' ? settings.editor.customPath : undefined,
      },
    });
  };

  const handleBrowserTypeChange = (type: 'chrome' | 'firefox' | 'safari' | 'edge' | 'custom') => {
    setSettings({
      ...settings,
      browser: {
        type,
        customPath: type === 'custom' ? settings.browser.customPath : undefined,
      },
    });
  };

  if (loading) {
    return (
      <div className="settings-overlay">
        <div className="settings-modal">
          <div className="loading-state">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button onClick={onClose} className="settings-close-btn" title="Close">
            ×
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3>Editor</h3>
            <div className="settings-field">
              <label>Editor Type</label>
              <select
                value={settings.editor.type}
                onChange={(e) => handleEditorTypeChange(e.target.value as any)}
                className="settings-select"
              >
                <option value="vscode">VS Code</option>
                <option value="cursor">Cursor</option>
                <option value="windsurf">Windsurf</option>
                <option value="zed">Zed</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {settings.editor.type === 'custom' && (
              <div className="settings-field">
                <label>Custom Editor Path</label>
                <input
                  type="text"
                  value={settings.editor.customPath || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      editor: { ...settings.editor, customPath: e.target.value },
                    })
                  }
                  placeholder="/path/to/editor"
                  className="settings-input"
                />
              </div>
            )}
          </div>

          <div className="settings-section">
            <h3>Browser</h3>
            <div className="settings-field">
              <label>Browser Type</label>
              <select
                value={settings.browser.type}
                onChange={(e) => handleBrowserTypeChange(e.target.value as any)}
                className="settings-select"
              >
                <option value="chrome">Chrome</option>
                <option value="firefox">Firefox</option>
                <option value="safari">Safari</option>
                <option value="edge">Edge</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {settings.browser.type === 'custom' && (
              <div className="settings-field">
                <label>Custom Browser Path</label>
                <input
                  type="text"
                  value={settings.browser.customPath || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      browser: { ...settings.browser, customPath: e.target.value },
                    })
                  }
                  placeholder="/path/to/browser"
                  className="settings-input"
                />
              </div>
            )}
          </div>
        </div>

        <div className="settings-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

