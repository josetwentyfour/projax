import * as fs from 'fs';
import * as path from 'path';
import { getDatabase } from '../database';
import { Project, Test } from '../types';

export interface ScanResult {
  project: Project;
  testsFound: number;
  tests: Test[];
}

function detectTestFramework(projectPath: string): string | null {
  const packageJsonPath = path.join(projectPath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps['jest'] || deps['@jest/core']) {
      return 'jest';
    }
    if (deps['mocha']) {
      return 'mocha';
    }
    if (deps['vitest']) {
      return 'vitest';
    }
    if (deps['@playwright/test']) {
      return 'playwright';
    }
    if (deps['cypress']) {
      return 'cypress';
    }
    if (deps['pytest'] || deps['pytest-asyncio']) {
      return 'pytest';
    }
    if (deps['unittest']) {
      return 'unittest';
    }
    
    return null;
  } catch {
    return null;
  }
}

function isTestFile(filePath: string, framework: string | null): boolean {
  const ext = path.extname(filePath).toLowerCase();
  const basename = path.basename(filePath).toLowerCase();
  
  // Common test file patterns
  if (basename.includes('.test.') || basename.includes('.spec.')) {
    return true;
  }
  
  // Framework-specific patterns
  if (framework === 'jest' || framework === 'vitest') {
    return ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx';
  }
  
  if (framework === 'mocha') {
    return ext === '.js' || ext === '.ts';
  }
  
  if (framework === 'pytest') {
    return ext === '.py' && (basename.startsWith('test_') || basename.includes('_test'));
  }
  
  if (framework === 'unittest') {
    return ext === '.py' && basename.startsWith('test');
  }
  
  // Default: check for test/spec in name
  return basename.includes('test') || basename.includes('spec');
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

export function scanProject(projectId: number): ScanResult {
  const db = getDatabase();
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

export function scanAllProjects(): ScanResult[] {
  const db = getDatabase();
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

