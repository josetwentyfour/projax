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

export interface DisplaySettings {
  projectTiles: {
    showName: boolean;
    showDescription: boolean;
    showTags: boolean;
    showRunningIndicator: boolean;
    showPorts: boolean;
    showGitBranch: boolean;
  };
  projectDetails: {
    showStats: boolean;
    showTestResults: boolean;
    showTags: boolean;
    showUrls: boolean;
    showScripts: boolean;
    showJenkins: boolean;
  };
  workspaceTiles: {
    showName: boolean;
    showDescription: boolean;
    showPath: boolean;
    showTags: boolean;
    showProjectCount: boolean;
  };
  workspaceDetails: {
    showProjectList: boolean;
    showDescription: boolean;
    showPath: boolean;
  };
}

export interface AppearanceSettings {
  theme?: string;
  uiDensity?: 'compact' | 'normal' | 'comfortable';
  fontSize?: number;
  animations?: boolean;
  defaultView?: 'projects' | 'workspaces';
}

export interface BehaviorSettings {
  autoScanOnAdd?: boolean;
  refreshInterval?: number;
  autoOpenTerminal?: boolean;
  notifications?: boolean;
  defaultScriptSortOrder?: 'default' | 'alphabetical' | 'last-used';
}

export interface AdvancedSettings {
  apiPortOverride?: number | null;
  databaseLocation?: string;
  debugMode?: boolean;
}

export interface AppSettings {
  editor: EditorSettings;
  browser: BrowserSettings;
  display?: DisplaySettings;
  appearance?: AppearanceSettings;
  behavior?: BehaviorSettings;
  advanced?: AdvancedSettings;
}

const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  projectTiles: {
    showName: true,
    showDescription: true,
    showTags: true,
    showRunningIndicator: true,
    showPorts: true,
    showGitBranch: true,
  },
  projectDetails: {
    showStats: true,
    showTestResults: true,
    showTags: true,
    showUrls: true,
    showScripts: true,
    showJenkins: false,
  },
  workspaceTiles: {
    showName: true,
    showDescription: true,
    showPath: true,
    showTags: true,
    showProjectCount: true,
  },
  workspaceDetails: {
    showProjectList: true,
    showDescription: true,
    showPath: true,
  },
};

const DEFAULT_SETTINGS: AppSettings = {
  editor: {
    type: 'vscode',
  },
  browser: {
    type: 'chrome',
  },
  display: DEFAULT_DISPLAY_SETTINGS,
  appearance: {
    uiDensity: 'normal',
    fontSize: 13,
    animations: true,
    defaultView: 'projects',
  },
  behavior: {
    autoScanOnAdd: true,
    refreshInterval: 5000,
    autoOpenTerminal: false,
    notifications: true,
    defaultScriptSortOrder: 'default',
  },
  advanced: {
    apiPortOverride: null,
    debugMode: false,
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
 * Get display settings
 */
export function getDisplaySettings(): DisplaySettings {
  const db = getDatabaseManager();
  const settings: DisplaySettings = { ...DEFAULT_DISPLAY_SETTINGS };
  
  // Project tiles
  const ptShowName = db.getSetting('display.projectTiles.showName');
  if (ptShowName !== null) settings.projectTiles.showName = ptShowName === 'true';
  const ptShowDesc = db.getSetting('display.projectTiles.showDescription');
  if (ptShowDesc !== null) settings.projectTiles.showDescription = ptShowDesc === 'true';
  const ptShowTags = db.getSetting('display.projectTiles.showTags');
  if (ptShowTags !== null) settings.projectTiles.showTags = ptShowTags === 'true';
  const ptShowRunning = db.getSetting('display.projectTiles.showRunningIndicator');
  if (ptShowRunning !== null) settings.projectTiles.showRunningIndicator = ptShowRunning === 'true';
  const ptShowPorts = db.getSetting('display.projectTiles.showPorts');
  if (ptShowPorts !== null) settings.projectTiles.showPorts = ptShowPorts === 'true';
  const ptShowGit = db.getSetting('display.projectTiles.showGitBranch');
  if (ptShowGit !== null) settings.projectTiles.showGitBranch = ptShowGit === 'true';
  
  // Project details
  const pdShowStats = db.getSetting('display.projectDetails.showStats');
  if (pdShowStats !== null) settings.projectDetails.showStats = pdShowStats === 'true';
  const pdShowTests = db.getSetting('display.projectDetails.showTestResults');
  if (pdShowTests !== null) settings.projectDetails.showTestResults = pdShowTests === 'true';
  const pdShowTags = db.getSetting('display.projectDetails.showTags');
  if (pdShowTags !== null) settings.projectDetails.showTags = pdShowTags === 'true';
  const pdShowUrls = db.getSetting('display.projectDetails.showUrls');
  if (pdShowUrls !== null) settings.projectDetails.showUrls = pdShowUrls === 'true';
  const pdShowScripts = db.getSetting('display.projectDetails.showScripts');
  if (pdShowScripts !== null) settings.projectDetails.showScripts = pdShowScripts === 'true';
  const pdShowJenkins = db.getSetting('display.projectDetails.showJenkins');
  if (pdShowJenkins !== null) settings.projectDetails.showJenkins = pdShowJenkins === 'true';
  
  // Workspace tiles
  const wtShowName = db.getSetting('display.workspaceTiles.showName');
  if (wtShowName !== null) settings.workspaceTiles.showName = wtShowName === 'true';
  const wtShowDesc = db.getSetting('display.workspaceTiles.showDescription');
  if (wtShowDesc !== null) settings.workspaceTiles.showDescription = wtShowDesc === 'true';
  const wtShowPath = db.getSetting('display.workspaceTiles.showPath');
  if (wtShowPath !== null) settings.workspaceTiles.showPath = wtShowPath === 'true';
  const wtShowTags = db.getSetting('display.workspaceTiles.showTags');
  if (wtShowTags !== null) settings.workspaceTiles.showTags = wtShowTags === 'true';
  const wtShowCount = db.getSetting('display.workspaceTiles.showProjectCount');
  if (wtShowCount !== null) settings.workspaceTiles.showProjectCount = wtShowCount === 'true';
  
  // Workspace details
  const wdShowList = db.getSetting('display.workspaceDetails.showProjectList');
  if (wdShowList !== null) settings.workspaceDetails.showProjectList = wdShowList === 'true';
  const wdShowDesc = db.getSetting('display.workspaceDetails.showDescription');
  if (wdShowDesc !== null) settings.workspaceDetails.showDescription = wdShowDesc === 'true';
  const wdShowPath = db.getSetting('display.workspaceDetails.showPath');
  if (wdShowPath !== null) settings.workspaceDetails.showPath = wdShowPath === 'true';
  
  return settings;
}

/**
 * Set display settings
 */
export function setDisplaySettings(settings: DisplaySettings): void {
  const db = getDatabaseManager();
  
  // Project tiles
  db.setSetting('display.projectTiles.showName', String(settings.projectTiles.showName));
  db.setSetting('display.projectTiles.showDescription', String(settings.projectTiles.showDescription));
  db.setSetting('display.projectTiles.showTags', String(settings.projectTiles.showTags));
  db.setSetting('display.projectTiles.showRunningIndicator', String(settings.projectTiles.showRunningIndicator));
  db.setSetting('display.projectTiles.showPorts', String(settings.projectTiles.showPorts));
  db.setSetting('display.projectTiles.showGitBranch', String(settings.projectTiles.showGitBranch));
  
  // Project details
  db.setSetting('display.projectDetails.showStats', String(settings.projectDetails.showStats));
  db.setSetting('display.projectDetails.showTestResults', String(settings.projectDetails.showTestResults));
  db.setSetting('display.projectDetails.showTags', String(settings.projectDetails.showTags));
  db.setSetting('display.projectDetails.showUrls', String(settings.projectDetails.showUrls));
  db.setSetting('display.projectDetails.showScripts', String(settings.projectDetails.showScripts));
  db.setSetting('display.projectDetails.showJenkins', String(settings.projectDetails.showJenkins));
  
  // Workspace tiles
  db.setSetting('display.workspaceTiles.showName', String(settings.workspaceTiles.showName));
  db.setSetting('display.workspaceTiles.showDescription', String(settings.workspaceTiles.showDescription));
  db.setSetting('display.workspaceTiles.showPath', String(settings.workspaceTiles.showPath));
  db.setSetting('display.workspaceTiles.showTags', String(settings.workspaceTiles.showTags));
  db.setSetting('display.workspaceTiles.showProjectCount', String(settings.workspaceTiles.showProjectCount));
  
  // Workspace details
  db.setSetting('display.workspaceDetails.showProjectList', String(settings.workspaceDetails.showProjectList));
  db.setSetting('display.workspaceDetails.showDescription', String(settings.workspaceDetails.showDescription));
  db.setSetting('display.workspaceDetails.showPath', String(settings.workspaceDetails.showPath));
}

/**
 * Get appearance settings
 */
export function getAppearanceSettings(): AppearanceSettings {
  const db = getDatabaseManager();
  const settings: AppearanceSettings = { ...DEFAULT_SETTINGS.appearance! };
  
  const theme = db.getSetting('appearance.theme');
  if (theme) settings.theme = theme;
  
  const uiDensity = db.getSetting('appearance.uiDensity');
  if (uiDensity && ['compact', 'normal', 'comfortable'].includes(uiDensity)) {
    settings.uiDensity = uiDensity as 'compact' | 'normal' | 'comfortable';
  }
  
  const fontSize = db.getSetting('appearance.fontSize');
  if (fontSize) {
    const size = parseInt(fontSize, 10);
    if (!isNaN(size)) settings.fontSize = size;
  }
  
  const animations = db.getSetting('appearance.animations');
  if (animations !== null) settings.animations = animations === 'true';
  
  const defaultView = db.getSetting('appearance.defaultView');
  if (defaultView && ['projects', 'workspaces'].includes(defaultView)) {
    settings.defaultView = defaultView as 'projects' | 'workspaces';
  }
  
  return settings;
}

/**
 * Set appearance settings
 */
export function setAppearanceSettings(settings: AppearanceSettings): void {
  const db = getDatabaseManager();
  if (settings.theme !== undefined) db.setSetting('appearance.theme', settings.theme);
  if (settings.uiDensity !== undefined) db.setSetting('appearance.uiDensity', settings.uiDensity);
  if (settings.fontSize !== undefined) db.setSetting('appearance.fontSize', String(settings.fontSize));
  if (settings.animations !== undefined) db.setSetting('appearance.animations', String(settings.animations));
  if (settings.defaultView !== undefined) db.setSetting('appearance.defaultView', settings.defaultView);
}

/**
 * Get behavior settings
 */
export function getBehaviorSettings(): BehaviorSettings {
  const db = getDatabaseManager();
  const settings: BehaviorSettings = { ...DEFAULT_SETTINGS.behavior! };
  
  const autoScan = db.getSetting('behavior.autoScanOnAdd');
  if (autoScan !== null) settings.autoScanOnAdd = autoScan === 'true';
  
  const refreshInterval = db.getSetting('behavior.refreshInterval');
  if (refreshInterval) {
    const interval = parseInt(refreshInterval, 10);
    if (!isNaN(interval)) settings.refreshInterval = interval;
  }
  
  const autoOpenTerminal = db.getSetting('behavior.autoOpenTerminal');
  if (autoOpenTerminal !== null) settings.autoOpenTerminal = autoOpenTerminal === 'true';
  
  const notifications = db.getSetting('behavior.notifications');
  if (notifications !== null) settings.notifications = notifications === 'true';
  
  const defaultSort = db.getSetting('behavior.defaultScriptSortOrder');
  if (defaultSort && ['default', 'alphabetical', 'last-used'].includes(defaultSort)) {
    settings.defaultScriptSortOrder = defaultSort as 'default' | 'alphabetical' | 'last-used';
  }
  
  return settings;
}

/**
 * Set behavior settings
 */
export function setBehaviorSettings(settings: BehaviorSettings): void {
  const db = getDatabaseManager();
  if (settings.autoScanOnAdd !== undefined) db.setSetting('behavior.autoScanOnAdd', String(settings.autoScanOnAdd));
  if (settings.refreshInterval !== undefined) db.setSetting('behavior.refreshInterval', String(settings.refreshInterval));
  if (settings.autoOpenTerminal !== undefined) db.setSetting('behavior.autoOpenTerminal', String(settings.autoOpenTerminal));
  if (settings.notifications !== undefined) db.setSetting('behavior.notifications', String(settings.notifications));
  if (settings.defaultScriptSortOrder !== undefined) db.setSetting('behavior.defaultScriptSortOrder', settings.defaultScriptSortOrder);
}

/**
 * Get advanced settings
 */
export function getAdvancedSettings(): AdvancedSettings {
  const db = getDatabaseManager();
  const settings: AdvancedSettings = { ...DEFAULT_SETTINGS.advanced! };
  
  const apiPort = db.getSetting('advanced.apiPortOverride');
  if (apiPort !== null) {
    if (apiPort === '') {
      settings.apiPortOverride = null;
    } else {
      const port = parseInt(apiPort, 10);
      if (!isNaN(port)) settings.apiPortOverride = port;
    }
  }
  
  const dbLocation = db.getSetting('advanced.databaseLocation');
  if (dbLocation) settings.databaseLocation = dbLocation;
  
  const debugMode = db.getSetting('advanced.debugMode');
  if (debugMode !== null) settings.debugMode = debugMode === 'true';
  
  return settings;
}

/**
 * Set advanced settings
 */
export function setAdvancedSettings(settings: AdvancedSettings): void {
  const db = getDatabaseManager();
  if (settings.apiPortOverride !== undefined) {
    db.setSetting('advanced.apiPortOverride', settings.apiPortOverride === null ? '' : String(settings.apiPortOverride));
  }
  if (settings.databaseLocation !== undefined && settings.databaseLocation) {
    db.setSetting('advanced.databaseLocation', settings.databaseLocation);
  }
  if (settings.debugMode !== undefined) db.setSetting('advanced.debugMode', String(settings.debugMode));
}

/**
 * Get all app settings
 */
export function getAppSettings(): AppSettings {
  return {
    editor: getEditorSettings(),
    browser: getBrowserSettings(),
    display: getDisplaySettings(),
    appearance: getAppearanceSettings(),
    behavior: getBehaviorSettings(),
    advanced: getAdvancedSettings(),
  };
}

/**
 * Set all app settings
 */
export function setAppSettings(settings: AppSettings): void {
  setEditorSettings(settings.editor);
  setBrowserSettings(settings.browser);
  if (settings.display) setDisplaySettings(settings.display);
  if (settings.appearance) setAppearanceSettings(settings.appearance);
  if (settings.behavior) setBehaviorSettings(settings.behavior);
  if (settings.advanced) setAdvancedSettings(settings.advanced);
}

