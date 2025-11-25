import React, { useState, useEffect } from 'react';
import { ElectronAPI } from '../../../main/preload';
import './SettingsCategory.css';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

const BehaviorSettings: React.FC = () => {
  const [autoScanOnAdd, setAutoScanOnAdd] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [autoOpenTerminal, setAutoOpenTerminal] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [defaultScriptSortOrder, setDefaultScriptSortOrder] = useState<'default' | 'alphabetical' | 'last-used'>('default');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await window.electronAPI.getSettings();
      if (settings.behavior) {
        if (settings.behavior.autoScanOnAdd !== undefined) setAutoScanOnAdd(settings.behavior.autoScanOnAdd);
        if (settings.behavior.refreshInterval) setRefreshInterval(settings.behavior.refreshInterval);
        if (settings.behavior.autoOpenTerminal !== undefined) setAutoOpenTerminal(settings.behavior.autoOpenTerminal);
        if (settings.behavior.notifications !== undefined) setNotifications(settings.behavior.notifications);
        if (settings.behavior.defaultScriptSortOrder) setDefaultScriptSortOrder(settings.behavior.defaultScriptSortOrder);
      }
    } catch (error) {
      console.error('Error loading behavior settings:', error);
    }
  };

  const handleSave = async (updates: any) => {
    try {
      setSaving(true);
      const current = await window.electronAPI.getSettings();
      const updated = {
        ...current,
        behavior: {
          ...(current.behavior || {}),
          ...updates,
        },
      };
      await window.electronAPI.saveSettings(updated);
    } catch (error) {
      console.error('Error saving behavior settings:', error);
      alert(`Failed to save settings: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-category">
      <div className="settings-category-header">
        <h1>Behavior</h1>
        <p className="settings-category-description">Configure how PROJAX behaves and responds</p>
      </div>

      <div className="settings-category-content">
        <div className="settings-section">
          <h3>Project Management</h3>
          <div className="settings-field">
            <label className="settings-toggle-label">
              <input
                type="checkbox"
                checked={autoScanOnAdd}
                onChange={(e) => {
                  setAutoScanOnAdd(e.target.checked);
                  handleSave({ autoScanOnAdd: e.target.checked });
                }}
                className="settings-toggle"
                disabled={saving}
              />
              <span>Auto-scan on project add</span>
            </label>
            <p className="settings-hint">Automatically scan for scripts and ports when adding a new project</p>
          </div>
        </div>

        <div className="settings-section">
          <h3>Refresh & Updates</h3>
          <div className="settings-field">
            <label>Refresh Interval (ms)</label>
            <input
              type="number"
              min="1000"
              max="60000"
              step="1000"
              value={refreshInterval}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value >= 1000 && value <= 60000) {
                  setRefreshInterval(value);
                  handleSave({ refreshInterval: value });
                }
              }}
              className="settings-input"
              disabled={saving}
            />
            <p className="settings-hint">How often to refresh running processes and ports (1000-60000ms)</p>
          </div>
        </div>

        <div className="settings-section">
          <h3>Terminal</h3>
          <div className="settings-field">
            <label className="settings-toggle-label">
              <input
                type="checkbox"
                checked={autoOpenTerminal}
                onChange={(e) => {
                  setAutoOpenTerminal(e.target.checked);
                  handleSave({ autoOpenTerminal: e.target.checked });
                }}
                className="settings-toggle"
                disabled={saving}
              />
              <span>Auto-open terminal on script run</span>
            </label>
            <p className="settings-hint">Automatically open terminal view when running a script</p>
          </div>
        </div>

        <div className="settings-section">
          <h3>Notifications</h3>
          <div className="settings-field">
            <label className="settings-toggle-label">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => {
                  setNotifications(e.target.checked);
                  handleSave({ notifications: e.target.checked });
                }}
                className="settings-toggle"
                disabled={saving}
              />
              <span>Enable notifications</span>
            </label>
            <p className="settings-hint">Show notifications for important events</p>
          </div>
        </div>

        <div className="settings-section">
          <h3>Scripts</h3>
          <div className="settings-field">
            <label>Default Script Sort Order</label>
            <select
              value={defaultScriptSortOrder}
              onChange={(e) => {
                const value = e.target.value as 'default' | 'alphabetical' | 'last-used';
                setDefaultScriptSortOrder(value);
                handleSave({ defaultScriptSortOrder: value });
              }}
              className="settings-select"
              disabled={saving}
            >
              <option value="default">Default</option>
              <option value="alphabetical">Alphabetically</option>
              <option value="last-used">Last Used</option>
            </select>
            <p className="settings-hint">Default sorting method for scripts in project details</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehaviorSettings;

