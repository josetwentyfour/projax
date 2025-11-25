import React, { useState, useEffect } from 'react';
import { ElectronAPI } from '../../../main/preload';
import './SettingsCategory.css';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

const EditorSettings: React.FC = () => {
  const [editorType, setEditorType] = useState<'vscode' | 'cursor' | 'windsurf' | 'zed' | 'custom'>('vscode');
  const [customPath, setCustomPath] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await window.electronAPI.getSettings();
      if (settings.editor) {
        setEditorType(settings.editor.type);
        setCustomPath(settings.editor.customPath || '');
      }
    } catch (error) {
      console.error('Error loading editor settings:', error);
    }
  };

  const handleSave = async (updates: Partial<{ type: string; customPath?: string }>) => {
    try {
      setSaving(true);
      const current = await window.electronAPI.getSettings();
      const updated = {
        ...current,
        editor: {
          ...current.editor,
          ...updates,
        },
      };
      await window.electronAPI.saveSettings(updated);
    } catch (error) {
      console.error('Error saving editor settings:', error);
      alert(`Failed to save settings: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-category">
      <div className="settings-category-header">
        <h1>Editor</h1>
        <p className="settings-category-description">Configure your preferred code editor</p>
      </div>

      <div className="settings-category-content">
        <div className="settings-section">
          <h3>Editor Type</h3>
          <div className="settings-field">
            <label>Editor</label>
            <select
              value={editorType}
              onChange={(e) => {
                const value = e.target.value as 'vscode' | 'cursor' | 'windsurf' | 'zed' | 'custom';
                setEditorType(value);
                handleSave({ type: value, customPath: value === 'custom' ? customPath : undefined });
              }}
              className="settings-select"
              disabled={saving}
            >
              <option value="vscode">VS Code</option>
              <option value="cursor">Cursor</option>
              <option value="windsurf">Windsurf</option>
              <option value="zed">Zed</option>
              <option value="custom">Custom</option>
            </select>
            <p className="settings-hint">Select your preferred code editor</p>
          </div>
          {editorType === 'custom' && (
            <div className="settings-field">
              <label>Custom Editor Path</label>
              <input
                type="text"
                value={customPath}
                onChange={(e) => {
                  setCustomPath(e.target.value);
                  handleSave({ customPath: e.target.value });
                }}
                placeholder="/path/to/editor"
                className="settings-input"
                disabled={saving}
              />
              <p className="settings-hint">Full path to your custom editor executable</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorSettings;

