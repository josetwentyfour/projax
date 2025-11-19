export * from './database';
export * from './detector';
export * from './scanner';
export * from './settings';
export { getDatabaseManager } from './database';

// Convenience functions for common operations
import { getDatabaseManager, Project, Test } from './database';

export function getAllProjects(): Project[] {
  return getDatabaseManager().getAllProjects();
}

export function addProject(name: string, projectPath: string): Project {
  return getDatabaseManager().addProject(name, projectPath);
}

export function removeProject(id: number): void {
  getDatabaseManager().removeProject(id);
}

export function getTestsByProject(projectId: number): Test[] {
  return getDatabaseManager().getTestsByProject(projectId);
}

