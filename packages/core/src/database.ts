import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { execSync } from 'child_process';

export interface Project {
  id: number;
  name: string;
  path: string;
  last_scanned: number | null;
  created_at: number;
}

export interface Test {
  id: number;
  project_id: number;
  file_path: string;
  framework: string | null;
  status: string | null;
  last_run: number | null;
  created_at: number;
}

export interface JenkinsJob {
  id: number;
  project_id: number;
  job_name: string;
  job_url: string;
  last_build_status: string | null;
  last_build_number: number | null;
  last_updated: number | null;
  created_at: number;
}

export interface ProjectPort {
  id: number;
  project_id: number;
  port: number;
  script_name: string | null;
  config_source: string;
  last_detected: number;
  created_at: number;
}

class DatabaseManager {
  private apiBaseUrl: string;
  private defaultPort = 3001;

  constructor() {
    // Read API port from file, or use default
    const dataDir = path.join(os.homedir(), '.projax');
    const portFile = path.join(dataDir, 'api-port.txt');
    
    let port = this.defaultPort;
    if (fs.existsSync(portFile)) {
      try {
        const portStr = fs.readFileSync(portFile, 'utf-8').trim();
        port = parseInt(portStr, 10) || this.defaultPort;
      } catch {
        // Use default if file read fails
      }
    }
    
    this.apiBaseUrl = `http://localhost:${port}/api`;
  }

  private request<T>(endpoint: string, options: { method?: string; body?: string } = {}): T {
    const url = `${this.apiBaseUrl}${endpoint}`;
    const method = options.method || 'GET';
    const body = options.body;

    try {
      let curlCmd: string;
      
      if (method === 'GET') {
        curlCmd = `curl -s -f "${url}"`;
      } else if (method === 'DELETE') {
        curlCmd = `curl -s -f -X DELETE "${url}"`;
      } else {
        // POST, PUT, PATCH
        const tempFile = path.join(os.tmpdir(), `prx-${Date.now()}.json`);
        if (body) {
          fs.writeFileSync(tempFile, body);
        }
        curlCmd = `curl -s -f -X ${method} -H "Content-Type: application/json" ${body ? `-d @${tempFile}` : ''} "${url}"`;
      }

      const result = execSync(curlCmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
      
      // Clean up temp file if created
      if (method !== 'GET' && method !== 'DELETE' && body) {
        const tempFile = path.join(os.tmpdir(), `prx-${Date.now()}.json`);
        try {
          fs.unlinkSync(tempFile);
        } catch {
          // Ignore cleanup errors
        }
      }

      if (!result || result.trim() === '') {
        return undefined as T;
      }

      return JSON.parse(result) as T;
    } catch (error) {
      // Check if it's a 404 or other HTTP error
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Resource not found');
      }
      throw new Error(`API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Project operations
  addProject(name: string, projectPath: string): Project {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, path: projectPath }),
    });
  }

  getProject(id: number): Project | null {
    try {
      return this.request<Project>(`/projects/${id}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  getProjectByPath(projectPath: string): Project | null {
    const projects = this.getAllProjects();
    return projects.find(p => p.path === projectPath) || null;
  }

  getAllProjects(): Project[] {
    return this.request<Project[]>('/projects');
  }

  updateProjectLastScanned(id: number): void {
    // Fire and forget - this is handled by the scan endpoint
    // No need to explicitly update last_scanned
  }

  updateProjectName(id: number, newName: string): Project {
    return this.request<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: newName }),
    });
  }

  removeProject(id: number): void {
    this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Test operations
  addTest(projectId: number, filePath: string, framework: string | null = null): Test {
    // Tests are added via scan endpoint, not directly
    throw new Error('addTest should not be called directly. Use scan endpoint instead.');
  }

  getTest(id: number): Test | null {
    // This endpoint doesn't exist yet
    throw new Error('getTest endpoint not yet implemented in API');
  }

  getTestsByProject(projectId: number): Test[] {
    return this.request<Test[]>(`/projects/${projectId}/tests`);
  }

  removeTestsByProject(projectId: number): void {
    // This is handled by the scan endpoint
    // For now, we'll just call scan which removes and re-adds
    throw new Error('removeTestsByProject should not be called directly. Use scan endpoint instead.');
  }

  // Jenkins operations
  addJenkinsJob(projectId: number, jobName: string, jobUrl: string): JenkinsJob {
    // This endpoint doesn't exist yet
    throw new Error('addJenkinsJob endpoint not yet implemented in API');
  }

  getJenkinsJob(id: number): JenkinsJob | null {
    // This endpoint doesn't exist yet
    throw new Error('getJenkinsJob endpoint not yet implemented in API');
  }

  getJenkinsJobsByProject(projectId: number): JenkinsJob[] {
    // This endpoint doesn't exist yet
    throw new Error('getJenkinsJobsByProject endpoint not yet implemented in API');
  }

  // Project port operations
  addProjectPort(
    projectId: number,
    port: number,
    configSource: string,
    scriptName: string | null = null
  ): ProjectPort {
    // This endpoint doesn't exist yet
    throw new Error('addProjectPort endpoint not yet implemented in API');
  }

  getProjectPort(id: number): ProjectPort | null {
    // This endpoint doesn't exist yet
    throw new Error('getProjectPort endpoint not yet implemented in API');
  }

  getProjectPorts(projectId: number): ProjectPort[] {
    return this.request<ProjectPort[]>(`/projects/${projectId}/ports`);
  }

  getProjectPortsByScript(projectId: number, scriptName: string): ProjectPort[] {
    const ports = this.getProjectPorts(projectId);
    return ports.filter(p => p.script_name === scriptName);
  }

  removeProjectPorts(projectId: number): void {
    // This endpoint doesn't exist yet
    throw new Error('removeProjectPorts endpoint not yet implemented in API');
  }

  updateProjectPortLastDetected(projectId: number, port: number, scriptName: string | null): void {
    // This endpoint doesn't exist yet - no-op for now
    // Ports are updated via the scan endpoint
  }

  // Settings operations
  getSetting(key: string): string | null {
    const settings = this.getAllSettings();
    return settings[key] || null;
  }

  setSetting(key: string, value: string): void {
    this.request(`/settings/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }

  getAllSettings(): Record<string, string> {
    return this.request<Record<string, string>>('/settings');
  }

  close(): void {
    // No-op for API client
  }
}

// Singleton instance
let dbManager: DatabaseManager | null = null;

export function getDatabaseManager(): DatabaseManager {
  if (!dbManager) {
    dbManager = new DatabaseManager();
  }
  return dbManager;
}
