/**
 * Get the current git branch for a project
 * @param projectPath The path to the project directory
 * @returns The current branch name, or null if not a git repo or on error
 */
export declare function getCurrentBranch(projectPath: string): string | null;
/**
 * Get git branches for multiple projects
 * @param projectPaths Array of project paths
 * @returns Map of project path to branch name (or null)
 */
export declare function getBranchesForProjects(projectPaths: string[]): Map<string, string | null>;
