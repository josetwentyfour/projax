import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { exec, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface RunningProcess {
  pid: number;
  projectPath: string;
  scriptName: string;
  command: string;
  startedAt: number;
  detectedPorts?: number[];
  detectedUrls?: string[];
}

export class ScriptRunner {
  private runningProcesses: Map<number, RunningProcess> = new Map();
  private terminals: Map<number, vscode.Terminal> = new Map();

  /**
   * Detect package manager (npm, yarn, pnpm)
   */
  private async detectPackageManager(projectPath: string): Promise<'npm' | 'yarn' | 'pnpm'> {
    if (fs.existsSync(path.join(projectPath, 'yarn.lock'))) {
      return 'yarn';
    }
    if (fs.existsSync(path.join(projectPath, 'pnpm-lock.yaml'))) {
      return 'pnpm';
    }
    return 'npm';
  }

  /**
   * Get package.json scripts
   */
  async getProjectScripts(projectPath: string): Promise<{ type: string; scripts: Array<{ name: string; command: string; runner: string }> }> {
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      return { type: 'unknown', scripts: [] };
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const scripts = packageJson.scripts || {};
      const packageManager = await this.detectPackageManager(projectPath);

      const scriptList = Object.entries(scripts).map(([name, command]) => ({
        name,
        command: command as string,
        runner: packageManager,
      }));

      return {
        type: packageManager,
        scripts: scriptList,
      };
    } catch (error) {
      return { type: 'unknown', scripts: [] };
    }
  }

  /**
   * Run a script
   */
  async runScript(
    projectPath: string,
    scriptName: string,
    background: boolean = true
  ): Promise<RunningProcess> {
    const packageManager = await this.detectPackageManager(projectPath);
    const command = `${packageManager} run ${scriptName}`;

    let process: ChildProcess;
    let terminal: vscode.Terminal | undefined;

    if (background) {
      // Run in background (detached)
      process = spawn(command, [], {
        cwd: projectPath,
        shell: true,
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      // Unref so parent can exit independently
      process.unref();
    } else {
      // Run in visible terminal
      terminal = vscode.window.createTerminal({
        name: `PROJAX: ${scriptName}`,
        cwd: projectPath,
      });
      terminal.sendText(command);
      terminal.show();

      // For visible terminals, we can't easily track the PID
      // Use a placeholder PID
      process = { pid: Date.now() } as ChildProcess;
    }

    const runningProcess: RunningProcess = {
      pid: process.pid || Date.now(),
      projectPath,
      scriptName,
      command,
      startedAt: Date.now(),
      detectedPorts: [],
      detectedUrls: [],
    };

    // Track process
    this.runningProcesses.set(runningProcess.pid, runningProcess);
    if (terminal) {
      this.terminals.set(runningProcess.pid, terminal);
    }

    // Monitor output for ports/URLs (background only)
    if (background && process.stdout) {
      process.stdout.on('data', (data: Buffer) => {
        this.parseOutputForPorts(runningProcess, data.toString());
      });
    }

    if (background && process.stderr) {
      process.stderr.on('data', (data: Buffer) => {
        this.parseOutputForPorts(runningProcess, data.toString());
      });
    }

    return runningProcess;
  }

  /**
   * Parse output for detected ports and URLs
   */
  private parseOutputForPorts(process: RunningProcess, output: string): void {
    // Look for localhost URLs
    const urlRegex = /https?:\/\/localhost(:\d+)?/gi;
    const urls = output.match(urlRegex);
    if (urls) {
      process.detectedUrls = Array.from(new Set([...(process.detectedUrls || []), ...urls]));
    }

    // Look for port numbers (common patterns)
    const portPatterns = [
      /listening on port (\d+)/i,
      /server running on port (\d+)/i,
      /:(\d{4,5})\b/g,
      /port (\d+)/i,
    ];

    const ports: number[] = [];
    for (const pattern of portPatterns) {
      const matches = output.matchAll(pattern);
      for (const match of matches) {
        const port = parseInt(match[1] || match[0].replace(/\D/g, ''), 10);
        if (port && port > 1024 && port < 65536) {
          ports.push(port);
        }
      }
    }

    if (ports.length > 0) {
      process.detectedPorts = Array.from(new Set([...(process.detectedPorts || []), ...ports]));
    }
  }

  /**
   * Stop a script by PID
   */
  async stopScript(pid: number): Promise<boolean> {
    const process = this.runningProcesses.get(pid);
    if (!process) {
      return false;
    }

    try {
      if (os.platform() === 'win32') {
        // Windows: use taskkill
        await execAsync(`taskkill /PID ${pid} /T /F`);
      } else {
        // Unix: use kill
        await execAsync(`kill -TERM ${pid}`);
        // If that doesn't work, try kill -9
        setTimeout(async () => {
          try {
            await execAsync(`kill -9 ${pid}`);
          } catch {
            // Ignore
          }
        }, 1000);
      }

      // Clean up terminal if exists
      const terminal = this.terminals.get(pid);
      if (terminal) {
        terminal.dispose();
        this.terminals.delete(pid);
      }

      this.runningProcesses.delete(pid);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Stop all scripts for a project
   */
  async stopProject(projectPath: string): Promise<number> {
    const projectProcesses = Array.from(this.runningProcesses.values()).filter(
      p => p.projectPath === projectPath
    );

    let stopped = 0;
    for (const proc of projectProcesses) {
      if (await this.stopScript(proc.pid)) {
        stopped++;
      }
    }

    return stopped;
  }

  /**
   * Get all running processes
   */
  getRunningProcesses(): RunningProcess[] {
    return Array.from(this.runningProcesses.values());
  }

  /**
   * Get running processes for a project
   */
  getRunningProcessesForProject(projectPath: string): RunningProcess[] {
    return this.getRunningProcesses().filter(p => p.projectPath === projectPath);
  }
}

// Singleton instance
let scriptRunner: ScriptRunner | null = null;

export function getScriptRunner(): ScriptRunner {
  if (!scriptRunner) {
    scriptRunner = new ScriptRunner();
  }
  return scriptRunner;
}

