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
  await workspaceDetector.detectCurrentProject();
  workspaceDetector.watchWorkspaceChanges();

  // Initialize view providers
  projectsProvider = new ProjectsViewProvider(context.extensionUri, provider, workspaceDetector);
  detailsProvider = new ProjectDetailsViewProvider(context.extensionUri, provider, workspaceDetector, projectsProvider);
  // Link them together
  projectsProvider.setDetailsProvider(detailsProvider);

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

