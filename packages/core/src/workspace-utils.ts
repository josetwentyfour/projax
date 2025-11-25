import * as fs from 'fs';
import * as path from 'path';

export interface WorkspaceFolder {
  path: string;
  name?: string;
}

export interface WorkspaceSettings {
  [key: string]: any;
}

export interface WorkspaceExtensions {
  recommendations?: string[];
  unwantedRecommendations?: string[];
}

export interface ParsedWorkspace {
  folders: WorkspaceFolder[];
  settings?: WorkspaceSettings;
  extensions?: WorkspaceExtensions;
}

/**
 * Parse a .code-workspace file
 * @param filePath Path to the .code-workspace file
 * @returns Parsed workspace structure
 */
export function parseWorkspaceFile(filePath: string): ParsedWorkspace {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Workspace file not found: ${filePath}`);
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const workspace = JSON.parse(content) as ParsedWorkspace;

    // Validate structure
    if (!workspace.folders || !Array.isArray(workspace.folders)) {
      throw new Error('Invalid workspace file: missing or invalid folders array');
    }

    // Normalize folder paths to absolute paths
    const workspaceDir = path.dirname(filePath);
    workspace.folders = workspace.folders.map(folder => {
      if (typeof folder === 'string') {
        // Legacy format: folders can be strings
        const absolutePath = path.isAbsolute(folder)
          ? folder
          : path.resolve(workspaceDir, folder);
        return { path: absolutePath };
      } else {
        // Modern format: folders are objects with path property
        const absolutePath = path.isAbsolute(folder.path)
          ? folder.path
          : path.resolve(workspaceDir, folder.path);
        return {
          ...folder,
          path: absolutePath,
        };
      }
    });

    return workspace;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in workspace file: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Generate a .code-workspace file
 * @param workspaceName Name of the workspace (used in comments)
 * @param projects Array of project paths (absolute or relative)
 * @param outputPath Path where the .code-workspace file should be created
 * @param settings Optional workspace settings
 * @param extensions Optional workspace extensions recommendations
 */
export function generateWorkspaceFile(
  workspaceName: string,
  projects: string[],
  outputPath: string,
  settings?: WorkspaceSettings,
  extensions?: WorkspaceExtensions
): void {
  const workspaceDir = path.dirname(outputPath);
  
  // Convert project paths to relative paths if they're within the workspace directory
  const folders: WorkspaceFolder[] = projects.map(projectPath => {
    const absolutePath = path.isAbsolute(projectPath)
      ? projectPath
      : path.resolve(process.cwd(), projectPath);
    
    // Try to make path relative to workspace directory if possible
    let relativePath: string;
    try {
      relativePath = path.relative(workspaceDir, absolutePath);
      // If relative path goes outside workspace dir, use absolute
      if (relativePath.startsWith('..')) {
        relativePath = absolutePath;
      }
    } catch {
      relativePath = absolutePath;
    }

    return {
      path: relativePath,
    };
  });

  const workspace: ParsedWorkspace = {
    folders,
    ...(settings && { settings }),
    ...(extensions && { extensions }),
  };

  // Add comment header
  const content = JSON.stringify(workspace, null, 2);
  const withHeader = `// ${workspaceName} Workspace\n${content}`;

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, withHeader, 'utf-8');
}

/**
 * Validate that a path is a valid workspace file
 * @param filePath Path to check
 * @returns true if the path exists and is a valid .code-workspace file
 */
export function validateWorkspacePath(filePath: string): boolean {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  if (!filePath.endsWith('.code-workspace')) {
    return false;
  }

  try {
    parseWorkspaceFile(filePath);
    return true;
  } catch {
    return false;
  }
}

