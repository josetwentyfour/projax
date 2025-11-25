import { execSync } from 'child_process';
import * as path from 'path';
import { getApiPort, getCurrentDirectory, findProjectPath } from './detector';

interface Project {
  id: number;
  name: string;
  path: string;
  description: string | null;
  framework: string | null;
  tags?: string[];
  git_branch?: string | null;
}

interface Workspace {
  id: number;
  name: string;
  workspace_file_path: string;
  description: string | null;
  tags?: string[];
}

interface WorkspaceProject {
  id: number;
  workspace_id: number;
  project_path: string;
  order: number;
}

interface ProjectContext {
  project: {
    name: string;
    path: string;
    description: string | null;
    framework: string | null;
    tags: string[];
    git_branch: string | null;
  };
  linkedProjects: Array<{
    name: string;
    path: string;
    description: string | null;
    tags: string[];
  }>;
  workspace: {
    name: string;
    description: string | null;
    tags: string[];
  } | null;
}

/**
 * Make an API request to the Projax API
 */
function apiRequest<T>(endpoint: string): T | null {
  const port = getApiPort();
  const url = `http://localhost:${port}/api${endpoint}`;
  
  try {
    const result = execSync(`curl -s -f "${url}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    
    if (!result || result.trim() === '') {
      return null;
    }
    
    return JSON.parse(result) as T;
  } catch (error) {
    // API not available or request failed
    return null;
  }
}

/**
 * Get all projects from Projax
 */
export function getAllProjects(): Project[] {
  const projects = apiRequest<Project[]>('/projects');
  return projects || [];
}

/**
 * Get all workspaces from Projax
 */
export function getAllWorkspaces(): Workspace[] {
  const workspaces = apiRequest<Workspace[]>('/workspaces');
  return workspaces || [];
}

/**
 * Get projects in a workspace
 */
export function getWorkspaceProjects(workspaceId: number): WorkspaceProject[] {
  const projects = apiRequest<WorkspaceProject[]>(`/workspaces/${workspaceId}/projects`);
  return projects || [];
}

/**
 * Find workspace containing a project
 */
export function findWorkspaceForProject(projectPath: string): { workspace: Workspace; allProjects: Project[] } | null {
  const workspaces = getAllWorkspaces();
  const allProjects = getAllProjects();
  
  for (const workspace of workspaces) {
    const workspaceProjects = getWorkspaceProjects(workspace.id);
    
    // Check if this workspace contains the project
    const hasProject = workspaceProjects.some(wp => wp.project_path === projectPath);
    
    if (hasProject) {
      // Get all projects in this workspace
      const projectsInWorkspace = workspaceProjects
        .map(wp => allProjects.find(p => p.path === wp.project_path))
        .filter((p): p is Project => p !== undefined);
      
      return { workspace, allProjects: projectsInWorkspace };
    }
  }
  
  return null;
}

/**
 * Get project by path
 */
export function getProjectByPath(projectPath: string): Project | null {
  const projects = getAllProjects();
  return projects.find(p => p.path === projectPath) || null;
}

/**
 * Get current project context
 */
export function getCurrentProjectContext(): ProjectContext | null {
  const currentDir = getCurrentDirectory();
  const allProjects = getAllProjects();
  const projectPaths = allProjects.map(p => p.path);
  
  // Find the project that matches current directory
  const projectPath = findProjectPath(currentDir, projectPaths);
  
  if (!projectPath) {
    return null;
  }
  
  const project = getProjectByPath(projectPath);
  
  if (!project) {
    return null;
  }
  
  // Find workspace and linked projects
  const workspaceInfo = findWorkspaceForProject(projectPath);
  
  const context: ProjectContext = {
    project: {
      name: project.name,
      path: project.path,
      description: project.description,
      framework: project.framework,
      tags: project.tags || [],
      git_branch: project.git_branch || null,
    },
    linkedProjects: [],
    workspace: null,
  };
  
  if (workspaceInfo) {
    context.workspace = {
      name: workspaceInfo.workspace.name,
      description: workspaceInfo.workspace.description,
      tags: workspaceInfo.workspace.tags || [],
    };
    
    // Add linked projects (excluding current project)
    context.linkedProjects = workspaceInfo.allProjects
      .filter(p => p.path !== projectPath)
      .map(p => ({
        name: p.name,
        path: p.path,
        description: p.description,
        tags: p.tags || [],
      }));
  }
  
  return context;
}

/**
 * Get project context by specific path
 */
export function getProjectContextByPath(projectPath: string): ProjectContext | null {
  const project = getProjectByPath(projectPath);
  
  if (!project) {
    return null;
  }
  
  const workspaceInfo = findWorkspaceForProject(projectPath);
  
  const context: ProjectContext = {
    project: {
      name: project.name,
      path: project.path,
      description: project.description,
      framework: project.framework,
      tags: project.tags || [],
      git_branch: project.git_branch || null,
    },
    linkedProjects: [],
    workspace: null,
  };
  
  if (workspaceInfo) {
    context.workspace = {
      name: workspaceInfo.workspace.name,
      description: workspaceInfo.workspace.description,
      tags: workspaceInfo.workspace.tags || [],
    };
    
    context.linkedProjects = workspaceInfo.allProjects
      .filter(p => p.path !== projectPath)
      .map(p => ({
        name: p.name,
        path: p.path,
        description: p.description,
        tags: p.tags || [],
      }));
  }
  
  return context;
}

/**
 * Get workspace context by workspace file path
 */
export function getWorkspaceContext(workspaceFilePath: string): { workspace: Workspace; projects: Project[] } | null {
  const workspaces = getAllWorkspaces();
  const workspace = workspaces.find(w => w.workspace_file_path === workspaceFilePath);
  
  if (!workspace) {
    return null;
  }
  
  const workspaceProjects = getWorkspaceProjects(workspace.id);
  const allProjects = getAllProjects();
  
  const projects = workspaceProjects
    .map(wp => allProjects.find(p => p.path === wp.project_path))
    .filter((p): p is Project => p !== undefined);
  
  return { workspace, projects };
}

/**
 * Format context as readable text for AI
 */
export function formatContextAsText(context: ProjectContext): string {
  let text = `# Project Context\n\n`;
  text += `## Current Project\n`;
  text += `- Name: ${context.project.name}\n`;
  text += `- Path: ${context.project.path}\n`;
  
  if (context.project.description) {
    text += `- Description: ${context.project.description}\n`;
  }
  
  if (context.project.framework) {
    text += `- Framework: ${context.project.framework}\n`;
  }
  
  if (context.project.git_branch) {
    text += `- Git Branch: ${context.project.git_branch}\n`;
  }
  
  if (context.project.tags.length > 0) {
    text += `- Tags: ${context.project.tags.join(', ')}\n`;
  }
  
  if (context.workspace) {
    text += `\n## Workspace\n`;
    text += `- Name: ${context.workspace.name}\n`;
    
    if (context.workspace.description) {
      text += `- Description: ${context.workspace.description}\n`;
    }
    
    if (context.workspace.tags && context.workspace.tags.length > 0) {
      text += `- Tags: ${context.workspace.tags.join(', ')}\n`;
    }
  }
  
  if (context.linkedProjects.length > 0) {
    text += `\n## Linked Projects in Workspace\n`;
    
    for (const project of context.linkedProjects) {
      text += `\n### ${project.name}\n`;
      text += `- Path: ${project.path}\n`;
      
      if (project.description) {
        text += `- Description: ${project.description}\n`;
      }
      
      if (project.tags.length > 0) {
        text += `- Tags: ${project.tags.join(', ')}\n`;
      }
    }
  }
  
  return text;
}
