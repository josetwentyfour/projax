import * as vscode from 'vscode';
import { getConnectionManager } from './services/ConnectionManager';
import { getLogger } from './utils/logger';
import { WorkspaceDetector } from './services/WorkspaceDetector';
import { ProjectsViewProvider } from './providers/ProjectsViewProvider';
import { ProjectDetailsViewProvider } from './providers/ProjectDetailsViewProvider';

let workspaceDetector: WorkspaceDetector | null = null;
let projectsProvider: ProjectsViewProvider | null = null;
let detailsProvider: ProjectDetailsViewProvider | null = null;

export async function activate(context: vscode.ExtensionContext) {
  const logger = getLogger();
  logger.info('PROJAX extension activating...');

  // Get configuration
  const config = vscode.workspace.getConfiguration('projax');
  const manualPort = config.get<number | null>('apiPort') || undefined;

  // Initialize connection
  const connectionManager = getConnectionManager();
  let provider;
  try {
    provider = await connectionManager.connect(manualPort);
    const mode = connectionManager.getMode();
    logger.info(`Connected to PROJAX (mode: ${mode})`);
  } catch (error) {
    logger.error('Failed to connect to PROJAX', error as Error);
    vscode.window.showErrorMessage('Failed to connect to PROJAX. Check the output panel for details.');
    return;
  }

  // Initialize workspace detector
  workspaceDetector = new WorkspaceDetector(provider);
  
  // Initialize view providers
  projectsProvider = new ProjectsViewProvider(context.extensionUri, provider, workspaceDetector);
  detailsProvider = new ProjectDetailsViewProvider(context.extensionUri, provider, workspaceDetector, projectsProvider);
  // Link them together
  projectsProvider.setDetailsProvider(detailsProvider);
  
  // Detect current project and notify details provider
  logger.info('Detecting current workspace project...');
  const currentProject = await workspaceDetector.detectCurrentProject();
  if (currentProject) {
    logger.info(`Current workspace project detected: ${currentProject.name} (ID: ${currentProject.id})`);
    detailsProvider.setProject(currentProject);
  } else {
    logger.info('No current workspace project detected');
  }
  
  workspaceDetector.watchWorkspaceChanges();

  // Register webview providers
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('projax.projects', projectsProvider)
  );
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('projax.details', detailsProvider)
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('projax.openProject', async () => {
      if (!projectsProvider) {
        return;
      }
      const projects = await provider.getProjects();
      if (projects.length === 0) {
        vscode.window.showInformationMessage('No projects found in PROJAX.');
        return;
      }
      const items = projects.map(p => ({
        label: p.name,
        description: p.path,
        project: p,
      }));
      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a project to open',
      });
      if (selected) {
        await projectsProvider.openProject(selected.project);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('projax.addProject', async () => {
      const folders = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: 'Add to PROJAX',
      });
      if (folders && folders.length > 0) {
        const folderPath = folders[0].fsPath;
        const name = await vscode.window.showInputBox({
          prompt: 'Enter project name',
          value: require('path').basename(folderPath),
        });
        if (name) {
          try {
            await provider.addProject(name, folderPath);
            vscode.window.showInformationMessage(`Added project: ${name}`);
            if (projectsProvider) {
              projectsProvider.refresh();
            }
          } catch (error) {
            vscode.window.showErrorMessage(`Failed to add project: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('projax.refreshProjects', () => {
      if (projectsProvider) {
        projectsProvider.refresh();
      }
      if (detailsProvider) {
        detailsProvider.refresh();
      }
      workspaceDetector?.detectCurrentProject();
      vscode.window.showInformationMessage('Projects refreshed');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('projax.scanProject', async () => {
      if (!projectsProvider) {
        return;
      }
      const projects = await provider.getProjects();
      if (projects.length === 0) {
        vscode.window.showInformationMessage('No projects found in PROJAX.');
        return;
      }
      const items = projects.map(p => ({
        label: p.name,
        description: p.path,
        project: p,
      }));
      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a project to scan',
      });
      if (selected) {
        try {
          await provider.scanProject(selected.project.id);
          vscode.window.showInformationMessage(`Scanned project: ${selected.project.name}`);
          if (detailsProvider) {
            detailsProvider.refresh();
          }
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to scan project: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('projax.scanAllProjects', async () => {
      try {
        await provider.scanAllProjects();
        vscode.window.showInformationMessage('Scanned all projects');
        if (detailsProvider) {
          detailsProvider.refresh();
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to scan projects: ${error instanceof Error ? error.message : String(error)}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('projax.openSettings', () => {
      vscode.commands.executeCommand('workbench.action.openSettings', '@ext:projax');
    })
  );

  // Add current workspace to PROJAX
  context.subscriptions.push(
    vscode.commands.registerCommand('projax.addCurrentProject', async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showWarningMessage('No workspace folder open');
        return;
      }
      const folderPath = workspaceFolders[0].uri.fsPath;
      const name = await vscode.window.showInputBox({
        prompt: 'Enter project name',
        value: require('path').basename(folderPath),
      });
      if (name) {
        try {
          await provider.addProject(name, folderPath);
          vscode.window.showInformationMessage(`Added "${name}" to PROJAX`);
          if (projectsProvider) {
            projectsProvider.refresh();
          }
          if (workspaceDetector) {
            await workspaceDetector.detectCurrentProject();
          }
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to add project: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    })
  );

  // Remove current project from PROJAX
  context.subscriptions.push(
    vscode.commands.registerCommand('projax.removeCurrentProject', async () => {
      const currentProject = workspaceDetector?.getCurrentProject();
      if (!currentProject) {
        vscode.window.showWarningMessage('Current workspace is not a PROJAX project');
        return;
      }
      const confirm = await vscode.window.showWarningMessage(
        `Remove "${currentProject.name}" from PROJAX?`,
        { modal: true },
        'Remove'
      );
      if (confirm === 'Remove') {
        try {
          await provider.removeProject(currentProject.id);
          vscode.window.showInformationMessage(`Removed "${currentProject.name}" from PROJAX`);
          if (projectsProvider) {
            projectsProvider.refresh();
          }
          if (detailsProvider) {
            detailsProvider.refresh();
          }
          if (workspaceDetector) {
            await workspaceDetector.detectCurrentProject();
          }
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to remove project: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    })
  );

  // Open current project in PROJAX Desktop
  context.subscriptions.push(
    vscode.commands.registerCommand('projax.openInDesktop', async () => {
      const currentProject = workspaceDetector?.getCurrentProject();
      if (!currentProject) {
        vscode.window.showWarningMessage('Current workspace is not a PROJAX project. Add it first with "PROJAX: Add Current Workspace to PROJAX"');
        return;
      }
      try {
        // Try to open the desktop app with the project
        const apiStatus = await connectionManager.getMode();
        if (apiStatus === 'api') {
          // API is running, which means the desktop app might be running
          vscode.window.showInformationMessage(`Opening "${currentProject.name}" in PROJAX Desktop...`);
          // The desktop app should already be showing this project if it's running
          // TODO: In the future, we could send a message to the desktop app to focus this project
        } else {
          vscode.window.showWarningMessage('PROJAX Desktop app is not running. Start it with: prx web');
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to open in desktop: ${error instanceof Error ? error.message : String(error)}`);
      }
    })
  );

  // Run script
  context.subscriptions.push(
    vscode.commands.registerCommand('projax.runScript', async () => {
      const currentProject = workspaceDetector?.getCurrentProject();
      if (!currentProject) {
        vscode.window.showWarningMessage('Current workspace is not a PROJAX project');
        return;
      }
      try {
        const { getScriptRunner } = await import('./services/ScriptRunner');
        const scriptRunner = getScriptRunner();
        const projectScripts = await scriptRunner.getProjectScripts(currentProject.path);
        if (projectScripts.length === 0) {
          vscode.window.showInformationMessage('No scripts found in this project');
          return;
        }
        const items = projectScripts.map(s => ({
          label: s.name,
          description: s.command,
        }));
        const selected = await vscode.window.showQuickPick(items, {
          placeHolder: 'Select a script to run',
        });
        if (selected) {
          await scriptRunner.runScript(currentProject.path, selected.label);
          vscode.window.showInformationMessage(`Running script: ${selected.label}`);
          if (detailsProvider) {
            detailsProvider.refresh();
          }
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to run script: ${error instanceof Error ? error.message : String(error)}`);
      }
    })
  );

  // Stop all scripts
  context.subscriptions.push(
    vscode.commands.registerCommand('projax.stopAllScripts', async () => {
      const currentProject = workspaceDetector?.getCurrentProject();
      if (!currentProject) {
        vscode.window.showWarningMessage('Current workspace is not a PROJAX project');
        return;
      }
      try {
        const { getScriptRunner } = await import('./services/ScriptRunner');
        const scriptRunner = getScriptRunner();
        const runningProcesses = scriptRunner.getRunningProcessesForProject(currentProject.path);
        if (runningProcesses.length === 0) {
          vscode.window.showInformationMessage('No running processes for this project');
          return;
        }
        for (const process of runningProcesses) {
          await scriptRunner.stopScript(process.pid);
        }
        vscode.window.showInformationMessage(`Stopped ${runningProcesses.length} process(es)`);
        if (detailsProvider) {
          detailsProvider.refresh();
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to stop scripts: ${error instanceof Error ? error.message : String(error)}`);
      }
    })
  );

  // Show running processes
  context.subscriptions.push(
    vscode.commands.registerCommand('projax.showRunningProcesses', async () => {
      const currentProject = workspaceDetector?.getCurrentProject();
      if (!currentProject) {
        vscode.window.showWarningMessage('Current workspace is not a PROJAX project');
        return;
      }
      try {
        const { getScriptRunner } = await import('./services/ScriptRunner');
        const scriptRunner = getScriptRunner();
        const runningProcesses = scriptRunner.getRunningProcessesForProject(currentProject.path);
        if (runningProcesses.length === 0) {
          vscode.window.showInformationMessage('No running processes for this project');
          return;
        }
        const items = runningProcesses.map(p => ({
          label: `${p.scriptName} (PID: ${p.pid})`,
          description: p.projectName,
          pid: p.pid,
        }));
        const selected = await vscode.window.showQuickPick(items, {
          placeHolder: 'Select a process to stop',
        });
        if (selected) {
          await scriptRunner.stopScript(selected.pid);
          vscode.window.showInformationMessage(`Stopped process: ${selected.label}`);
          if (detailsProvider) {
            detailsProvider.refresh();
          }
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to show processes: ${error instanceof Error ? error.message : String(error)}`);
      }
    })
  );

  // Open project URL
  context.subscriptions.push(
    vscode.commands.registerCommand('projax.openProjectUrl', async () => {
      const currentProject = workspaceDetector?.getCurrentProject();
      if (!currentProject) {
        vscode.window.showWarningMessage('Current workspace is not a PROJAX project');
        return;
      }
      try {
        const ports = await provider.getProjectPorts(currentProject.id);
        if (ports.length === 0) {
          vscode.window.showInformationMessage('No URLs detected for this project. Try running a script first.');
          return;
        }
        const items = ports.map(p => ({
          label: `${p.protocol}://${p.host}:${p.port}`,
          description: p.script_name || 'Unknown script',
          url: `${p.protocol}://${p.host}:${p.port}`,
        }));
        const selected = await vscode.window.showQuickPick(items, {
          placeHolder: 'Select a URL to open',
        });
        if (selected) {
          vscode.env.openExternal(vscode.Uri.parse(selected.url));
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to open URL: ${error instanceof Error ? error.message : String(error)}`);
      }
    })
  );

  // Watch for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration('projax.apiPort')) {
        const config = vscode.workspace.getConfiguration('projax');
        const manualPort = config.get<number | null>('apiPort') || undefined;
        try {
          const newProvider = await connectionManager.reconnect(manualPort);
          workspaceDetector?.setProvider(newProvider);
          projectsProvider?.setProvider(newProvider);
          detailsProvider?.setProvider(newProvider);
          logger.info('Reconnected to PROJAX');
        } catch (error) {
          logger.error('Failed to reconnect', error as Error);
        }
      }
    })
  );

  logger.info('PROJAX extension activated');
}

export function deactivate() {
  const logger = getLogger();
  logger.info('PROJAX extension deactivating...');
  workspaceDetector = null;
  projectsProvider = null;
  detailsProvider = null;
}

