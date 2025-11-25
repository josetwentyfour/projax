import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

/**
 * Get the current working directory from environment or default
 */
export function getCurrentDirectory(): string {
  return process.env.PWD || process.cwd();
}

/**
 * Check if a path is within another path
 */
export function isPathWithin(childPath: string, parentPath: string): boolean {
  const relative = path.relative(parentPath, childPath);
  return !relative.startsWith('..') && !path.isAbsolute(relative);
}

/**
 * Find the closest parent project path that matches a registered project
 */
export function findProjectPath(currentPath: string, registeredPaths: string[]): string | null {
  let currentDir = path.resolve(currentPath);
  
  // Check if current directory or any parent is a registered project
  while (currentDir !== path.dirname(currentDir)) {
    if (registeredPaths.includes(currentDir)) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  
  // Check if current path is within any registered project
  for (const projectPath of registeredPaths) {
    if (isPathWithin(currentPath, projectPath)) {
      return projectPath;
    }
  }
  
  return null;
}

/**
 * Get the Projax data directory
 */
export function getProjaxDataDir(): string {
  return path.join(os.homedir(), '.projax');
}

/**
 * Check if Projax API is available
 */
export function isApiAvailable(): boolean {
  const dataDir = getProjaxDataDir();
  const portFile = path.join(dataDir, 'api-port.txt');
  return fs.existsSync(portFile);
}

/**
 * Get the API port from the port file
 */
export function getApiPort(): number {
  const dataDir = getProjaxDataDir();
  const portFile = path.join(dataDir, 'api-port.txt');
  
  if (!fs.existsSync(portFile)) {
    return 38124; // Default port
  }
  
  try {
    const portStr = fs.readFileSync(portFile, 'utf-8').trim();
    return parseInt(portStr, 10) || 38124;
  } catch {
    return 38124;
  }
}
