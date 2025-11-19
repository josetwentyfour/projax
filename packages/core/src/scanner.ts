import { getDatabaseManager, Project, Test } from './database';

export interface ScanResult {
  project: Project;
  testsFound: number;
  tests: Test[];
}

export function scanProject(projectId: number): ScanResult {
  return getDatabaseManager().scanProject(projectId);
}

export function scanAllProjects(): ScanResult[] {
  return getDatabaseManager().scanAllProjects();
}

