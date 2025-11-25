import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Get the current git branch for a project
 * @param projectPath The path to the project directory
 * @returns The current branch name, or null if not a git repo or on error
 */
export function getCurrentBranch(projectPath: string): string | null {
  try {
    // Check if .git directory exists
    const gitDir = path.join(projectPath, '.git');
    if (!fs.existsSync(gitDir) && !fs.existsSync(path.join(projectPath, '.git', 'HEAD'))) {
      // Check if it's a worktree or submodule
      const gitConfig = path.join(projectPath, '.git');
      if (!fs.existsSync(gitConfig)) {
        return null;
      }
    }

    // Try to get the current branch
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: projectPath,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();

    // Handle detached HEAD state (returns "HEAD")
    if (branch === 'HEAD') {
      // Try to get the commit hash instead
      try {
        const commit = execSync('git rev-parse --short HEAD', {
          cwd: projectPath,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe'],
        }).trim();
        return `detached@${commit}`;
      } catch {
        return 'detached';
      }
    }

    return branch || null;
  } catch (error) {
    // Not a git repo, or git command failed
    return null;
  }
}

/**
 * Get git branches for multiple projects
 * @param projectPaths Array of project paths
 * @returns Map of project path to branch name (or null)
 */
export function getBranchesForProjects(projectPaths: string[]): Map<string, string | null> {
  const branches = new Map<string, string | null>();
  
  for (const projectPath of projectPaths) {
    branches.set(projectPath, getCurrentBranch(projectPath));
  }
  
  return branches;
}

