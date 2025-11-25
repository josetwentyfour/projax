"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentBranch = getCurrentBranch;
exports.getBranchesForProjects = getBranchesForProjects;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Get the current git branch for a project
 * @param projectPath The path to the project directory
 * @returns The current branch name, or null if not a git repo or on error
 */
function getCurrentBranch(projectPath) {
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
        const branch = (0, child_process_1.execSync)('git rev-parse --abbrev-ref HEAD', {
            cwd: projectPath,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
        }).trim();
        // Handle detached HEAD state (returns "HEAD")
        if (branch === 'HEAD') {
            // Try to get the commit hash instead
            try {
                const commit = (0, child_process_1.execSync)('git rev-parse --short HEAD', {
                    cwd: projectPath,
                    encoding: 'utf-8',
                    stdio: ['pipe', 'pipe', 'pipe'],
                }).trim();
                return `detached@${commit}`;
            }
            catch {
                return 'detached';
            }
        }
        return branch || null;
    }
    catch (error) {
        // Not a git repo, or git command failed
        return null;
    }
}
/**
 * Get git branches for multiple projects
 * @param projectPaths Array of project paths
 * @returns Map of project path to branch name (or null)
 */
function getBranchesForProjects(projectPaths) {
    const branches = new Map();
    for (const projectPath of projectPaths) {
        branches.set(projectPath, getCurrentBranch(projectPath));
    }
    return branches;
}
