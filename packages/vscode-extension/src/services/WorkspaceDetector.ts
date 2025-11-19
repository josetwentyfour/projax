import * as vscode from 'vscode';
import * as path from 'path';
import { ProjaxDataProvider } from './ConnectionManager';
import { Project } from '../types';

export class WorkspaceDetector {
  private provider: ProjaxDataProvider | null = null;
  private currentProject: Project | null = null;
  private onProjectChangeCallbacks: Array<(project: Project | null) => void> = [];

  constructor(provider: ProjaxDataProvider) {
    this.provider = provider;
  }

  /**
   * Update the provider (when connection changes)
   */
  setProvider(provider: ProjaxDataProvider): void {
    this.provider = provider;
    this.detectCurrentProject();
  }

  /**
   * Detect if current workspace is a PROJAX project
   */
  async detectCurrentProject(): Promise<Project | null> {
    if (!this.provider) {
      return null;
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      this.currentProject = null;
      this.notifyCallbacks();
      return null;
    }

    // Use the first workspace folder
    const workspacePath = workspaceFolders[0].uri.fsPath;
    const normalizedPath = path.normalize(workspacePath);

    try {
      const projects = await this.provider.getProjects();
      const project = projects.find(p => {
        const projectPath = path.normalize(p.path);
        return projectPath === normalizedPath || normalizedPath.startsWith(projectPath + path.sep);
      });

      this.currentProject = project || null;
      this.notifyCallbacks();
      return this.currentProject;
    } catch (error) {
      this.currentProject = null;
      this.notifyCallbacks();
      return null;
    }
  }

  /**
   * Get current detected project
   */
  getCurrentProject(): Project | null {
    return this.currentProject;
  }

  /**
   * Subscribe to project changes
   */
  onProjectChange(callback: (project: Project | null) => void): vscode.Disposable {
    this.onProjectChangeCallbacks.push(callback);
    return new vscode.Disposable(() => {
      const index = this.onProjectChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.onProjectChangeCallbacks.splice(index, 1);
      }
    });
  }

  /**
   * Notify all callbacks of project change
   */
  private notifyCallbacks(): void {
    for (const callback of this.onProjectChangeCallbacks) {
      callback(this.currentProject);
    }
  }

  /**
   * Watch for workspace changes
   */
  watchWorkspaceChanges(): vscode.Disposable {
    const disposable = vscode.workspace.onDidChangeWorkspaceFolders(() => {
      this.detectCurrentProject();
    });

    return disposable;
  }
}

