import React, { useState } from 'react';
import { ElectronAPI } from '../../../main/preload';
import './SettingsCategory.css';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

const BackupSettings: React.FC = () => {
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  return (
    <div className="settings-category">
      <div className="settings-category-header">
        <h1>Backup & Restore</h1>
        <p className="settings-category-description">Backup and restore your PROJAX data</p>
      </div>

      <div className="settings-category-content">
        <div className="settings-section">
          <h3>Create Backup</h3>
          <div className="settings-field">
            <label>Backup Data</label>
            <p className="settings-hint">Create a backup of all PROJAX data including projects, workspaces, and settings</p>
            <button
              onClick={async () => {
                try {
                  setBackupLoading(true);
                  const result = await window.electronAPI.selectDirectory();
                  if (result) {
                    const backupResult = await window.electronAPI.createBackup(result);
                    alert(`Backup created successfully!\n${backupResult.backup_path}`);
                  }
                } catch (error) {
                  alert(`Failed to create backup: ${error instanceof Error ? error.message : String(error)}`);
                } finally {
                  setBackupLoading(false);
                }
              }}
              disabled={backupLoading}
              className="btn btn-secondary"
            >
              {backupLoading ? 'Creating...' : 'Create Backup'}
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3>Restore from Backup</h3>
          <div className="settings-field">
            <label>Restore Data</label>
            <p className="settings-hint">Restore PROJAX data from a backup file. This will overwrite your current data.</p>
            <button
              onClick={async () => {
                if (!confirm('This will overwrite your current PROJAX data. Continue?')) {
                  return;
                }
                try {
                  setRestoreLoading(true);
                  const filePath = await window.electronAPI.selectFile({
                    filters: [{ name: 'PROJAX Backup', extensions: ['pbz'] }],
                  });
                  if (filePath) {
                    await window.electronAPI.restoreBackup(filePath);
                    alert('Backup restored successfully! The app will refresh.');
                    window.location.reload();
                  }
                } catch (error) {
                  alert(`Failed to restore backup: ${error instanceof Error ? error.message : String(error)}`);
                } finally {
                  setRestoreLoading(false);
                }
              }}
              disabled={restoreLoading}
              className="btn btn-danger"
            >
              {restoreLoading ? 'Restoring...' : 'Restore from Backup'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupSettings;

