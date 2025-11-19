import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ProcessInfo {
  pid: number;
  command: string;
}

/**
 * Check if a port is in use (cross-platform)
 */
export async function detectPortInUse(port: number): Promise<boolean> {
  try {
    if (process.platform === 'win32') {
      // Windows: Use netstat
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      return stdout.trim().length > 0;
    } else {
      // macOS/Linux: Use lsof
      try {
        const { stdout } = await execAsync(`lsof -ti:${port}`);
        return stdout.trim().length > 0;
      } catch (error: any) {
        // lsof returns non-zero exit code when port is not in use
        if (error.code === 1) {
          return false;
        }
        // Try netstat as fallback
        try {
          const { stdout } = await execAsync(`netstat -an | grep :${port}`);
          return stdout.trim().length > 0;
        } catch {
          return false;
        }
      }
    }
  } catch (error) {
    return false;
  }
}

/**
 * Get process information for a port (cross-platform)
 */
export async function getProcessOnPort(port: number): Promise<ProcessInfo | null> {
  try {
    if (process.platform === 'win32') {
      // Windows: Get PID from netstat, then get process name
      const { stdout: netstatOutput } = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = netstatOutput.trim().split('\n');
      if (lines.length === 0) return null;

      // Parse PID from netstat output (last column)
      const pidMatch = lines[0].trim().split(/\s+/).pop();
      if (!pidMatch) return null;

      const pid = parseInt(pidMatch, 10);
      if (isNaN(pid)) return null;

      // Get process name
      try {
        const { stdout: tasklistOutput } = await execAsync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`);
        const parts = tasklistOutput.trim().split(',');
        const command = parts[0]?.replace(/"/g, '') || 'unknown';
        return { pid, command };
      } catch {
        return { pid, command: 'unknown' };
      }
    } else {
      // macOS/Linux: Use lsof
      try {
        const { stdout } = await execAsync(`lsof -ti:${port} -sTCP:LISTEN`);
        const pids = stdout.trim().split('\n').filter(Boolean);
        if (pids.length === 0) return null;

        const pid = parseInt(pids[0], 10);
        if (isNaN(pid)) return null;

        // Get process command
        try {
          const { stdout: psOutput } = await execAsync(`ps -p ${pid} -o comm=`);
          const command = psOutput.trim() || 'unknown';
          return { pid, command };
        } catch {
          return { pid, command: 'unknown' };
        }
      } catch (error: any) {
        if (error.code === 1) {
          return null;
        }
        throw error;
      }
    }
  } catch (error) {
    return null;
  }
}

/**
 * Kill process(es) using a port (cross-platform)
 */
export async function killProcessOnPort(port: number): Promise<boolean> {
  try {
    if (process.platform === 'win32') {
      // Windows: Get PID and kill with taskkill
      const { stdout: netstatOutput } = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = netstatOutput.trim().split('\n');
      if (lines.length === 0) return false;

      const pids = new Set<number>();
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(pid)) {
          pids.add(pid);
        }
      }

      let killed = false;
      for (const pid of pids) {
        try {
          await execAsync(`taskkill /F /PID ${pid}`);
          killed = true;
        } catch {
          // Ignore errors for individual PIDs
        }
      }
      return killed;
    } else {
      // macOS/Linux: Use lsof to find PIDs and kill them
      try {
        const { stdout } = await execAsync(`lsof -ti:${port}`);
        const pids = stdout.trim().split('\n').filter(Boolean);
        if (pids.length === 0) return false;

        let killed = false;
        for (const pidStr of pids) {
          const pid = parseInt(pidStr, 10);
          if (!isNaN(pid)) {
            try {
              await execAsync(`kill -9 ${pid}`);
              killed = true;
            } catch {
              // Ignore errors for individual PIDs
            }
          }
        }
        return killed;
      } catch (error: any) {
        if (error.code === 1) {
          return false; // Port not in use
        }
        throw error;
      }
    }
  } catch (error) {
    return false;
  }
}

/**
 * Extract port number from error messages
 * Handles common port conflict error patterns
 */
export function extractPortFromError(error: string): number | null {
  // Common patterns:
  // - "EADDRINUSE: address already in use :::3000"
  // - "Port 3000 is already in use"
  // - "Error: listen EADDRINUSE: address already in use 0.0.0.0:3000"
  // - "Address already in use: 3000"
  // - "port 3000 is already in use by another process"

  const patterns = [
    /(?:port|Port)\s+(\d+)\s+(?:is\s+)?(?:already\s+)?(?:in\s+use|taken)/i,
    /EADDRINUSE[^:]*:\s*(?:address\s+already\s+in\s+use[^:]*:)?\s*(?:::|0\.0\.0\.0|127\.0\.0\.1|localhost)?:?(\d+)/i,
    /(?:address|Address)\s+already\s+in\s+use[^:]*:?\s*(\d+)/i,
    /(?:listen|Listen)\s+EADDRINUSE[^:]*:\s*(?:address\s+already\s+in\s+use[^:]*:)?\s*(?:::|0\.0\.0\.0|127\.0\.0\.1|localhost)?:?(\d+)/i,
    /:(\d+)\s+\(EADDRINUSE\)/i,
  ];

  for (const pattern of patterns) {
    const match = error.match(pattern);
    if (match && match[1]) {
      const port = parseInt(match[1], 10);
      if (!isNaN(port) && port > 0 && port <= 65535) {
        return port;
      }
    }
  }

  return null;
}

