import * as fs from 'fs';
import * as path from 'path';
import { detectTestFramework, isTestFile } from './detector';
import { getDatabaseManager, Project, Test } from './database';

export interface ScanResult {
  project: Project;
  testsFound: number;
  tests: Test[];
}

export function scanProject(projectId: number): ScanResult {
  const db = getDatabaseManager();
  const project = db.getProject(projectId);
  
  if (!project) {
    throw new Error(`Project with id ${projectId} not found`);
  }
  
  if (!fs.existsSync(project.path)) {
    throw new Error(`Project path does not exist: ${project.path}`);
  }
  
  // Detect framework first
  const framework = detectTestFramework(project.path);
  
  // Remove existing tests for this project
  db.removeTestsByProject(projectId);
  
  // Scan for test files
  const tests: Test[] = [];
  const testFiles = findTestFiles(project.path, framework);
  
  for (const testFile of testFiles) {
    const relativePath = path.relative(project.path, testFile);
    const test = db.addTest(projectId, relativePath, framework);
    tests.push(test);
  }
  
  // Update last scanned timestamp
  db.updateProjectLastScanned(projectId);
  
  return {
    project: db.getProject(projectId)!,
    testsFound: tests.length,
    tests,
  };
}

function findTestFiles(dir: string, framework: string | null, results: string[] = []): string[] {
  if (!fs.existsSync(dir)) {
    return results;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // Skip node_modules, .git, and other common ignore directories
    if (entry.isDirectory()) {
      if (
        entry.name === 'node_modules' ||
        entry.name === '.git' ||
        entry.name === 'dist' ||
        entry.name === 'build' ||
        entry.name === '.next' ||
        entry.name === '.nuxt' ||
        entry.name === 'coverage' ||
        entry.name.startsWith('.')
      ) {
        continue;
      }
      
      findTestFiles(fullPath, framework, results);
    } else if (entry.isFile()) {
      if (isTestFile(fullPath, framework)) {
        results.push(fullPath);
      }
    }
  }
  
  return results;
}

export function scanAllProjects(): ScanResult[] {
  const db = getDatabaseManager();
  const projects = db.getAllProjects();
  const results: ScanResult[] = [];
  
  for (const project of projects) {
    try {
      const result = scanProject(project.id);
      results.push(result);
    } catch (error) {
      console.error(`Error scanning project ${project.name}:`, error);
    }
  }
  
  return results;
}

