import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { spawn, ChildProcess } from 'child_process';
import {
  getDatabaseManager,
  getAllProjects,
  addProject,
  removeProject,
  scanProject,
  scanAllProjects,
  getTestsByProject,
} from './core';
import type { Project, Test } from 'projax-core';

let mainWindow: BrowserWindow | null = null;
let apiProcess: ChildProcess | null = null;

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  function createWindow() {
    // Don't create a new window if one already exists
    if (mainWindow) {
      mainWindow.focus();
      return;
    }


    const isDev = process.env.NODE_ENV === 'development';
    
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      frame: false,
      titleBarStyle: 'hidden',
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Load the app
    if (isDev) {
      mainWindow.loadURL('http://localhost:7898');
      mainWindow.webContents.openDevTools();
    } else {
      // Try bundled renderer path first (when bundled in CLI: dist/electron/renderer/index.html)
      // Then try local dev path (packages/desktop/dist/renderer/index.html)
      const bundledRenderer = path.join(__dirname, 'renderer', 'index.html');
      const localRenderer = path.join(__dirname, '..', 'renderer', 'index.html');
      
      if (fs.existsSync(bundledRenderer)) {
        mainWindow.loadFile(bundledRenderer);
      } else if (fs.existsSync(localRenderer)) {
        mainWindow.loadFile(localRenderer);
      } else {
        console.error('Error: Renderer index.html not found');
        console.error('Bundled path:', bundledRenderer);
        console.error('Local path:', localRenderer);
        app.quit();
      }
    }

    // Handle external links securely
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      // Only allow http/https links to be opened externally for security
      const isExternal = url.startsWith('http:') || url.startsWith('https:');
      
      if (isExternal) {
        shell.openExternal(url);
        // Deny the default action of opening a new Electron window/tab
        return { action: 'deny' };
      }
      
      // For internal or non-web links, allow the default behavior
      return { action: 'allow' };
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  // Start API server
  function startAPIServer() {
    try {
      // Try to find API server in various locations
      const apiPaths = [
        path.join(__dirname, '..', '..', '..', 'api', 'dist', 'index.js'),
        path.join(__dirname, '..', '..', 'api', 'dist', 'index.js'),
        path.join(process.cwd(), 'packages', 'api', 'dist', 'index.js'),
      ];

      let apiPath: string | null = null;
      for (const p of apiPaths) {
        if (fs.existsSync(p)) {
          apiPath = p;
          break;
        }
      }

      if (!apiPath) {
        console.warn('API server not found. Some features may not work.');
        return;
      }

      console.log('Starting API server...');
      apiProcess = spawn('node', [apiPath], {
        detached: false,
        stdio: 'pipe',
        env: { ...process.env },
      });

      apiProcess.stdout?.on('data', (data) => {
        console.log(`[API] ${data.toString().trim()}`);
      });

      apiProcess.stderr?.on('data', (data) => {
        console.error(`[API Error] ${data.toString().trim()}`);
      });

      apiProcess.on('exit', (code) => {
        console.log(`API server exited with code ${code}`);
        apiProcess = null;
      });
    } catch (error) {
      console.error('Failed to start API server:', error);
    }
  }

  app.whenReady().then(() => {
    startAPIServer();
    createWindow();

    app.on('activate', () => {
      // On macOS, re-create window when dock icon is clicked and no windows are open
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      } else if (mainWindow) {
        mainWindow.focus();
      }
    });
  });
}

app.on('window-all-closed', () => {
  // Kill API server
  if (apiProcess) {
    console.log('Stopping API server...');
    apiProcess.kill();
    apiProcess = null;
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Kill API server before quitting
  if (apiProcess) {
    console.log('Stopping API server...');
    apiProcess.kill();
    apiProcess = null;
  }
});

// IPC Handlers

ipcMain.handle('get-projects', async (): Promise<Project[]> => {
  try {
    console.log('Getting projects from database...');
    const projects = getAllProjects();
    console.log(`Found ${projects.length} project(s)`);
    return projects;
  } catch (error) {
    console.error('Error getting projects:', error);
    throw error;
  }
});

ipcMain.handle('add-project', async (_, projectPath: string): Promise<Project> => {
  if (!fs.existsSync(projectPath)) {
    throw new Error('Path does not exist');
  }
  if (!fs.statSync(projectPath).isDirectory()) {
    throw new Error('Path must be a directory');
  }
  
  const db = getDatabaseManager();
  const existingProject = db.getProjectByPath(projectPath);
  
  if (existingProject) {
    throw new Error('Project already exists');
  }
  
  const projectName = path.basename(projectPath);
  return db.addProject(projectName, projectPath);
});

ipcMain.handle('remove-project', async (_, projectId: number): Promise<void> => {
  removeProject(projectId);
});

ipcMain.handle('scan-project', async (_, projectId: number) => {
  return scanProject(projectId);
});

ipcMain.handle('scan-all-projects', async () => {
  return scanAllProjects();
});

ipcMain.handle('get-tests', async (_, projectId: number): Promise<Test[]> => {
  try {
    const db = getDatabaseManager();
    return getTestsByProject(projectId);
  } catch (error) {
    console.error('Error getting tests:', error);
    throw error;
  }
});

ipcMain.handle('select-directory', async (): Promise<string | null> => {
  if (!mainWindow) return null;
  
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  
  return result.filePaths[0];
});

// Window controls
ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

// Update project
ipcMain.handle('update-project', async (_, projectId: number, updates: { description?: string | null }) => {
  const db = getDatabaseManager();
  const updated = db.updateProject(projectId, updates);
  return updated;
});

// Rename project
ipcMain.handle('rename-project', async (_, projectId: number, newName: string): Promise<Project> => {
  const db = getDatabaseManager();
  return db.updateProjectName(projectId, newName);
});

// Get project scripts
ipcMain.handle('get-project-scripts', async (_, projectPath: string) => {
  // Try bundled path first (when bundled in CLI: dist/electron/main.js -> dist/script-runner.js)
  // Then try local dev path (packages/desktop/dist/main.js -> packages/cli/dist/script-runner.js)
  const bundledScriptRunnerPath = path.join(__dirname, '..', 'script-runner.js');
  const localScriptRunnerPath = path.join(__dirname, '..', '..', 'cli', 'dist', 'script-runner.js');
  
  let scriptRunnerPath: string;
  if (fs.existsSync(bundledScriptRunnerPath)) {
    scriptRunnerPath = bundledScriptRunnerPath;
  } else {
    scriptRunnerPath = localScriptRunnerPath;
  }
  
  const { getProjectScripts } = await import(scriptRunnerPath);
  const result = getProjectScripts(projectPath);
  // Convert Map to array for IPC serialization
  const scriptsArray = Array.from(result.scripts.entries() as Iterable<[string, any]>).map(([name, script]) => ({
    name,
    ...script,
  }));
  return {
    type: result.type,
    scripts: scriptsArray,
  };
});

// Run script
ipcMain.handle('run-script', async (_, projectPath: string, scriptName: string, args: string[] = [], background: boolean = false) => {
  try {
  // Try bundled path first (when bundled in CLI: dist/electron/main.js -> dist/script-runner.js)
  // Then try local dev path (packages/desktop/dist/main.js -> packages/cli/dist/script-runner.js)
  const bundledScriptRunnerPath = path.join(__dirname, '..', 'script-runner.js');
  const localScriptRunnerPath = path.join(__dirname, '..', '..', 'cli', 'dist', 'script-runner.js');
  
  let scriptRunnerPath: string;
  if (fs.existsSync(bundledScriptRunnerPath)) {
    scriptRunnerPath = bundledScriptRunnerPath;
    } else if (fs.existsSync(localScriptRunnerPath)) {
      scriptRunnerPath = localScriptRunnerPath;
  } else {
      throw new Error(`Script runner not found. Tried: ${bundledScriptRunnerPath} and ${localScriptRunnerPath}`);
  }
  
    const scriptRunnerModule = await import(scriptRunnerPath);
    const { runScriptInBackground } = scriptRunnerModule;
    
    if (!runScriptInBackground || typeof runScriptInBackground !== 'function') {
      throw new Error('runScriptInBackground function not found in script runner module');
    }
    
  const db = getDatabaseManager();
  const project = db.getProjectByPath(projectPath);
  
  if (!project) {
    throw new Error('Project not found');
  }
  
  // Run in background (foreground scripts would need IPC streaming for output)
    const pid = await runScriptInBackground(projectPath, project.name, scriptName, args, false);
    return { success: true, background: true, pid };
  } catch (error) {
    console.error('Error running script:', error);
    throw error;
  }
});

// Scan ports
ipcMain.handle('scan-project-ports', async (_, projectId: number) => {
  // Try bundled path first (when bundled in CLI: dist/electron/main.js -> dist/port-scanner.js)
  // Then try local dev path (packages/desktop/dist/main.js -> packages/cli/dist/port-scanner.js)
  const bundledPortScannerPath = path.join(__dirname, '..', 'port-scanner.js');
  const localPortScannerPath = path.join(__dirname, '..', '..', 'cli', 'dist', 'port-scanner.js');
  
  let portScannerPath: string;
  if (fs.existsSync(bundledPortScannerPath)) {
    portScannerPath = bundledPortScannerPath;
  } else {
    portScannerPath = localPortScannerPath;
  }
  
  const { scanProjectPorts } = await import(portScannerPath);
  await scanProjectPorts(projectId);
  const db = getDatabaseManager();
  return db.getProjectPorts(projectId);
});

ipcMain.handle('scan-all-ports', async () => {
  // Try bundled path first (when bundled in CLI: dist/electron/main.js -> dist/port-scanner.js)
  // Then try local dev path (packages/desktop/dist/main.js -> packages/cli/dist/port-scanner.js)
  const bundledPortScannerPath = path.join(__dirname, '..', 'port-scanner.js');
  const localPortScannerPath = path.join(__dirname, '..', '..', 'cli', 'dist', 'port-scanner.js');
  
  let portScannerPath: string;
  if (fs.existsSync(bundledPortScannerPath)) {
    portScannerPath = bundledPortScannerPath;
  } else {
    portScannerPath = localPortScannerPath;
  }
  
  const { scanAllProjectPorts } = await import(portScannerPath);
  await scanAllProjectPorts();
  const db = getDatabaseManager();
  const projects = getAllProjects();
  const result: Record<number, any[]> = {};
  for (const project of projects) {
    result[project.id] = db.getProjectPorts(project.id);
  }
  return result;
});

// Get project ports
ipcMain.handle('get-project-ports', async (_, projectId: number) => {
  const db = getDatabaseManager();
  return db.getProjectPorts(projectId);
});

// Get running processes
ipcMain.handle('get-running-processes', async () => {
  // Try bundled path first (when bundled in CLI: dist/electron/main.js -> dist/script-runner.js)
  // Then try local dev path (packages/desktop/dist/main.js -> packages/cli/dist/script-runner.js)
  const bundledScriptRunnerPath = path.join(__dirname, '..', 'script-runner.js');
  const localScriptRunnerPath = path.join(__dirname, '..', '..', 'cli', 'dist', 'script-runner.js');
  
  let scriptRunnerPath: string;
  if (fs.existsSync(bundledScriptRunnerPath)) {
    scriptRunnerPath = bundledScriptRunnerPath;
  } else {
    scriptRunnerPath = localScriptRunnerPath;
  }
  
  const { getRunningProcessesClean } = await import(scriptRunnerPath);
  return await getRunningProcessesClean();
});

// Stop script by PID
ipcMain.handle('stop-script', async (_, pid: number) => {
  // Try bundled path first (when bundled in CLI: dist/electron/main.js -> dist/script-runner.js)
  // Then try local dev path (packages/desktop/dist/main.js -> packages/cli/dist/script-runner.js)
  const bundledScriptRunnerPath = path.join(__dirname, '..', 'script-runner.js');
  const localScriptRunnerPath = path.join(__dirname, '..', '..', 'cli', 'dist', 'script-runner.js');
  
  let scriptRunnerPath: string;
  if (fs.existsSync(bundledScriptRunnerPath)) {
    scriptRunnerPath = bundledScriptRunnerPath;
  } else {
    scriptRunnerPath = localScriptRunnerPath;
  }
  
  const { stopScript } = await import(scriptRunnerPath);
  return await stopScript(pid);
});

// Stop all processes for a project
ipcMain.handle('stop-project', async (_, projectPath: string) => {
  // Try bundled path first (when bundled in CLI: dist/electron/main.js -> dist/script-runner.js)
  // Then try local dev path (packages/desktop/dist/main.js -> packages/cli/dist/script-runner.js)
  const bundledScriptRunnerPath = path.join(__dirname, '..', 'script-runner.js');
  const localScriptRunnerPath = path.join(__dirname, '..', '..', 'cli', 'dist', 'script-runner.js');
  
  let scriptRunnerPath: string;
  if (fs.existsSync(bundledScriptRunnerPath)) {
    scriptRunnerPath = bundledScriptRunnerPath;
  } else {
    scriptRunnerPath = localScriptRunnerPath;
  }
  
  const { stopProjectProcesses } = await import(scriptRunnerPath);
  return await stopProjectProcesses(projectPath);
});

// Open URL in browser
ipcMain.handle('open-url', async (_, url: string) => {
  // Try bundled path first (when bundled in CLI: dist/electron/main.js -> dist/core)
  // Then try local dev path (packages/desktop/dist/main.js -> packages/core/dist)
  const bundledCorePath = path.join(__dirname, '..', 'core');
  const localCorePath = path.join(__dirname, '..', '..', '..', 'core', 'dist');
  
  let corePath: string;
  if (fs.existsSync(bundledCorePath)) {
    corePath = bundledCorePath;
  } else {
    corePath = localCorePath;
  }
  
  const coreModule = require(corePath);
  const { getBrowserSettings } = coreModule;
  const browserSettings = getBrowserSettings();
  
  let command: string;
  let args: string[] = [url];
  
  if (browserSettings.type === 'custom' && browserSettings.customPath) {
    command = browserSettings.customPath;
  } else {
    // Platform-specific browser commands
    if (process.platform === 'darwin') {
      // macOS
      switch (browserSettings.type) {
        case 'chrome':
          command = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
          break;
        case 'firefox':
          command = '/Applications/Firefox.app/Contents/MacOS/firefox';
          break;
        case 'safari':
          command = 'open';
          args = ['-a', 'Safari', url];
          break;
        case 'edge':
          command = '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';
          break;
        default:
          command = 'open';
          args = [url];
      }
    } else if (process.platform === 'win32') {
      // Windows
      switch (browserSettings.type) {
        case 'chrome':
          command = 'chrome';
          break;
        case 'firefox':
          command = 'firefox';
          break;
        case 'edge':
          command = 'msedge';
          break;
        case 'safari':
          command = 'safari';
          break;
        default:
          command = 'start';
          args = [url];
      }
    } else {
      // Linux
      switch (browserSettings.type) {
        case 'chrome':
          command = 'google-chrome';
          break;
        case 'firefox':
          command = 'firefox';
          break;
        case 'edge':
          command = 'microsoft-edge';
          break;
        case 'safari':
          command = 'safari';
          break;
        default:
          command = 'xdg-open';
          args = [url];
      }
    }
  }
  
  const { spawn } = require('child_process');
  spawn(command, args, {
    detached: true,
    stdio: 'ignore',
  }).unref();
});

// Open project in editor
ipcMain.handle('open-in-editor', async (_, projectPath: string) => {
  // Try bundled path first (when bundled in CLI: dist/electron/main.js -> dist/core/settings)
  // Then try local dev path (packages/desktop/dist/main.js -> packages/core/dist/settings)
  const bundledSettingsPath = path.join(__dirname, '..', 'core', 'settings');
  const localSettingsPath = path.join(__dirname, '..', '..', '..', 'core', 'dist', 'settings');
  
  let settingsPath: string;
  if (fs.existsSync(bundledSettingsPath + '.js')) {
    settingsPath = bundledSettingsPath;
  } else {
    settingsPath = localSettingsPath;
  }
  
  const { getEditorSettings } = require(settingsPath);
  const editorSettings = getEditorSettings();
  
  let command: string;
  let args: string[] = [projectPath];
  
  if (editorSettings.type === 'custom' && editorSettings.customPath) {
    command = editorSettings.customPath;
  } else {
    switch (editorSettings.type) {
      case 'vscode':
        command = 'code';
        break;
      case 'cursor':
        command = 'cursor';
        break;
      case 'windsurf':
        command = 'windsurf';
        break;
      case 'zed':
        command = 'zed';
        break;
      default:
        command = 'code'; // Default to VS Code
    }
  }
  
  const { spawn } = require('child_process');
  spawn(command, args, {
    detached: true,
    stdio: 'ignore',
  }).unref();
});

// Open project directory in file manager
ipcMain.handle('open-in-files', async (_, projectPath: string) => {
  try {
    await shell.openPath(projectPath);
  } catch (error) {
    console.error('Error opening directory:', error);
    throw error;
  }
});


// Get settings
ipcMain.handle('get-settings', async () => {
  try {
    // Load settings module directly
    const bundledSettingsPath = path.join(__dirname, '..', 'core', 'settings');
    const localSettingsPath = path.join(__dirname, '..', '..', '..', 'core', 'dist', 'settings');
    
    let settingsPath: string;
    if (fs.existsSync(bundledSettingsPath + '.js')) {
      settingsPath = bundledSettingsPath;
    } else {
      settingsPath = localSettingsPath;
    }
    
    const { getAppSettings } = require(settingsPath);
    return getAppSettings();
  } catch (error) {
    console.error('Error getting settings:', error);
    throw error;
  }
});

// Save settings
ipcMain.handle('save-settings', async (_, settings: {
  editor: { type: string; customPath?: string };
  browser: { type: string; customPath?: string };
}) => {
  try {
    // Load settings module directly
    const bundledSettingsPath = path.join(__dirname, '..', 'core', 'settings');
    const localSettingsPath = path.join(__dirname, '..', '..', '..', 'core', 'dist', 'settings');
    
    let settingsPath: string;
    if (fs.existsSync(bundledSettingsPath + '.js')) {
      settingsPath = bundledSettingsPath;
    } else {
      settingsPath = localSettingsPath;
    }
    
    const { setAppSettings } = require(settingsPath);
    setAppSettings(settings);
    console.log('Settings saved successfully');
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
});

// Open external URL securely (for anchor tags and manual calls)
ipcMain.on('open-external-url', (event, url: string) => {
  try {
    // SECURITY: Ensure only http/https links to prevent arbitrary file execution
    const parsedUrl = new URL(url);
    if (['http:', 'https:'].includes(parsedUrl.protocol)) {
      shell.openExternal(url);
    } else {
      console.warn(`Blocked attempt to open non-http/https URL: ${url}`);
    }
  } catch (error) {
    console.error('Error opening external URL:', error);
  }
});

