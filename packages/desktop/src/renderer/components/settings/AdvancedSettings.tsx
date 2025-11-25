import React, { useState, useEffect } from 'react';
import { ElectronAPI } from '../../../main/preload';
import './SettingsCategory.css';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

const AdvancedSettings: React.FC = () => {
  const [apiPortOverride, setApiPortOverride] = useState<number | null>(null);
  const [databaseLocation, setDatabaseLocation] = useState('');
  const [debugMode, setDebugMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await window.electronAPI.getSettings();
      if (settings.advanced) {
        if (settings.advanced.apiPortOverride !== undefined) setApiPortOverride(settings.advanced.apiPortOverride);
        if (settings.advanced.databaseLocation) setDatabaseLocation(settings.advanced.databaseLocation);
        if (settings.advanced.debugMode !== undefined) setDebugMode(settings.advanced.debugMode);
      }
    } catch (error) {
      console.error('Error loading advanced settings:', error);
    }
  };

  const handleSave = async (updates: any) => {
    try {
      setSaving(true);
      const current = await window.electronAPI.getSettings();
      const updated = {
        ...current,
        advanced: {
          ...current.advanced,
          ...updates,
        },
      };
      await window.electronAPI.saveSettings(updated);
    } catch (error) {
      console.error('Error saving advanced settings:', error);
      alert(`Failed to save settings: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-category">
      <div className="settings-category-header">
        <h1>Advanced</h1>
        <p className="settings-category-description">Advanced configuration options</p>
      </div>

      <div className="settings-category-content">
        <div className="settings-section">
          <h3>API Configuration</h3>
          <div className="settings-field">
            <label>API Port Override</label>
            <input
              type="number"
              min="1024"
              max="65535"
              value={apiPortOverride || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? null : parseInt(e.target.value, 10);
                if (value === null || (!isNaN(value) && value >= 1024 && value <= 65535)) {
                  setApiPortOverride(value);
                  handleSave({ apiPortOverride: value });
                }
              }}
              placeholder="Auto-detect"
              className="settings-input"
              disabled={saving}
            />
            <p className="settings-hint">Override API port detection. Leave empty for auto-detect.</p>
          </div>
        </div>

        <div className="settings-section">
          <h3>Database</h3>
          <div className="settings-field">
            <label>Database Location</label>
            <input
              type="text"
              value={databaseLocation}
              onChange={(e) => {
                setDatabaseLocation(e.target.value);
                handleSave({ databaseLocation: e.target.value });
              }}
              placeholder="Default location"
              className="settings-input"
              disabled={saving}
              readOnly
            />
            <p className="settings-hint">Database file location (read-only)</p>
          </div>
        </div>

        <div className="settings-section">
          <h3>Debug</h3>
          <div className="settings-field">
            <label className="settings-toggle-label">
              <input
                type="checkbox"
                checked={debugMode}
                onChange={(e) => {
                  setDebugMode(e.target.checked);
                  handleSave({ debugMode: e.target.checked });
                }}
                className="settings-toggle"
                disabled={saving}
              />
              <span>Enable debug mode</span>
            </label>
            <p className="settings-hint">Enable additional logging and debug information</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettings;

