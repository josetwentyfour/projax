import { getDatabaseManager } from './database';

export type EditorType = 'vscode' | 'cursor' | 'windsurf' | 'zed' | 'custom';
export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge' | 'custom';

export interface EditorSettings {
  type: EditorType;
  customPath?: string;
}

export interface BrowserSettings {
  type: BrowserType;
  customPath?: string;
}

export interface AppSettings {
  editor: EditorSettings;
  browser: BrowserSettings;
}

const DEFAULT_SETTINGS: AppSettings = {
  editor: {
    type: 'vscode',
  },
  browser: {
    type: 'chrome',
  },
};

/**
 * Get a setting value by key
 */
export function getSetting(key: string): string | null {
  return getDatabaseManager().getSetting(key);
}

/**
 * Set a setting value by key
 */
export function setSetting(key: string, value: string): void {
  getDatabaseManager().setSetting(key, value);
}

/**
 * Get all settings as a key-value object
 */
export function getAllSettings(): Record<string, string> {
  return getDatabaseManager().getAllSettings();
}

/**
 * Get editor settings
 */
export function getEditorSettings(): EditorSettings {
  const db = getDatabaseManager();
  const type = (db.getSetting('editor.type') as EditorType) || DEFAULT_SETTINGS.editor.type;
  const customPath = db.getSetting('editor.customPath') || undefined;
  
  return {
    type,
    customPath,
  };
}

/**
 * Set editor settings
 */
export function setEditorSettings(settings: EditorSettings): void {
  const db = getDatabaseManager();
  db.setSetting('editor.type', settings.type);
  if (settings.customPath) {
    db.setSetting('editor.customPath', settings.customPath);
  }
  // Note: Removing settings is not yet supported via the API
  // Setting to empty string would achieve similar effect if needed
}

/**
 * Get browser settings
 */
export function getBrowserSettings(): BrowserSettings {
  const db = getDatabaseManager();
  const type = (db.getSetting('browser.type') as BrowserType) || DEFAULT_SETTINGS.browser.type;
  const customPath = db.getSetting('browser.customPath') || undefined;
  
  return {
    type,
    customPath,
  };
}

/**
 * Set browser settings
 */
export function setBrowserSettings(settings: BrowserSettings): void {
  const db = getDatabaseManager();
  db.setSetting('browser.type', settings.type);
  if (settings.customPath) {
    db.setSetting('browser.customPath', settings.customPath);
  }
  // Note: Removing settings is not yet supported via the API
  // Setting to empty string would achieve similar effect if needed
}

/**
 * Get all app settings
 */
export function getAppSettings(): AppSettings {
  return {
    editor: getEditorSettings(),
    browser: getBrowserSettings(),
  };
}

/**
 * Set all app settings
 */
export function setAppSettings(settings: AppSettings): void {
  setEditorSettings(settings.editor);
  setBrowserSettings(settings.browser);
}

