import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as net from 'net';
import axios, { AxiosInstance } from 'axios';
import { Project, Test, ProjectPort } from '../types';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

export type ConnectionMode = 'api' | 'direct';

export interface ProjaxDataProvider {
  mode: ConnectionMode;
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | null>;
  getProjectByPath(projectPath: string): Promise<Project | null>;
  addProject(name: string, projectPath: string): Promise<Project>;
  updateProject(id: number, updates: Partial<Omit<Project, 'id' | 'created_at'>>): Promise<Project>;
  removeProject(id: number): Promise<void>;
  getTestsByProject(projectId: number): Promise<Test[]>;
  getProjectPorts(projectId: number): Promise<ProjectPort[]>;
  getAllTags(): Promise<string[]>;
  scanProject(id: number): Promise<{ project: Project; testsFound: number; tests: Test[] }>;
  scanAllProjects(): Promise<Array<{ project: Project; testsFound: number; tests: Test[] }>>;
}

class APIDataProvider implements ProjaxDataProvider {
  mode: ConnectionMode = 'api';
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 5000,
    });
  }

  async getProjects(): Promise<Project[]> {
    const response = await this.client.get<Project[]>('/projects');
    return response.data;
  }

  async getProject(id: number): Promise<Project | null> {
    try {
      const response = await this.client.get<Project>(`/projects/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getProjectByPath(projectPath: string): Promise<Project | null> {
    const projects = await this.getProjects();
    return projects.find(p => p.path === projectPath) || null;
  }

  async addProject(name: string, projectPath: string): Promise<Project> {
    const response = await this.client.post<Project>('/projects', { name, path: projectPath });
    return response.data;
  }

  async updateProject(id: number, updates: Partial<Omit<Project, 'id' | 'created_at'>>): Promise<Project> {
    const response = await this.client.put<Project>(`/projects/${id}`, updates);
    return response.data;
  }

  async removeProject(id: number): Promise<void> {
    await this.client.delete(`/projects/${id}`);
  }

  async getTestsByProject(projectId: number): Promise<Test[]> {
    const response = await this.client.get<Test[]>(`/projects/${projectId}/tests`);
    return response.data;
  }

  async getProjectPorts(projectId: number): Promise<ProjectPort[]> {
    const response = await this.client.get<ProjectPort[]>(`/projects/${projectId}/ports`);
    return response.data;
  }

  async getAllTags(): Promise<string[]> {
    const response = await this.client.get<string[]>('/projects/tags');
    return response.data;
  }

  async scanProject(id: number): Promise<{ project: Project; testsFound: number; tests: Test[] }> {
    const response = await this.client.post<{ project: Project; testsFound: number; tests: Test[] }>(
      `/projects/${id}/scan`
    );
    return response.data;
  }

  async scanAllProjects(): Promise<Array<{ project: Project; testsFound: number; tests: Test[] }>> {
    const response = await this.client.post<Array<{ project: Project; testsFound: number; tests: Test[] }>>(
      '/projects/scan/all'
    );
    return response.data;
  }
}

// Simplified JSONDatabase for direct access
interface DatabaseSchema {
  projects: Project[];
  tests: Test[];
  project_ports: ProjectPort[];
  settings: Array<{ key: string; value: string; updated_at: number }>;
}

class JSONDatabase {
  private data: DatabaseSchema;
  private dbPath: string;

  constructor() {
    const dataDir = path.join(os.homedir(), '.projax');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dbPath = path.join(dataDir, 'data.json');

    if (fs.existsSync(this.dbPath)) {
      try {
        const fileContent = fs.readFileSync(this.dbPath, 'utf-8');
        this.data = JSON.parse(fileContent);
        this.migrateData();
      } catch {
        this.data = { projects: [], tests: [], project_ports: [], settings: [] };
        this.write();
      }
    } else {
      this.data = { projects: [], tests: [], project_ports: [], settings: [] };
      this.write();
    }
  }

  private migrateData(): void {
    let needsWrite = false;
    if (this.data.projects) {
      for (const project of this.data.projects) {
        if (project.framework === undefined) {
          project.framework = null;
          needsWrite = true;
        }
        if (project.description === undefined) {
          project.description = null;
          needsWrite = true;
        }
        if (project.tags === undefined) {
          project.tags = [];
          needsWrite = true;
        }
      }
    }
    if (!this.data.tests) {
      this.data.tests = [];
      needsWrite = true;
    }
    if (!this.data.project_ports) {
      this.data.project_ports = [];
      needsWrite = true;
    }
    if (!this.data.settings) {
      this.data.settings = [];
      needsWrite = true;
    }
    if (needsWrite) {
      this.write();
    }
  }

  private write(): void {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing database file:', error);
    }
  }

  addProject(name: string, projectPath: string): Project {
    const existing = this.data.projects.find(p => p.path === projectPath);
    if (existing) {
      throw new Error('Project with this path already exists');
    }
    const newId = this.data.projects.length > 0
      ? Math.max(...this.data.projects.map(p => p.id)) + 1
      : 1;
    const project: Project = {
      id: newId,
      name,
      path: projectPath,
      description: null,
      framework: null,
      last_scanned: null,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
    };
    this.data.projects.push(project);
    this.write();
    return project;
  }

  getAllTags(): string[] {
    const tagsSet = new Set<string>();
    for (const project of this.data.projects) {
      if (project.tags) {
        for (const tag of project.tags) {
          tagsSet.add(tag);
        }
      }
    }
    return Array.from(tagsSet).sort();
  }

  getProject(id: number): Project | null {
    return this.data.projects.find(p => p.id === id) || null;
  }

  getProjectByPath(projectPath: string): Project | null {
    return this.data.projects.find(p => p.path === projectPath) || null;
  }

  getAllProjects(): Project[] {
    return [...this.data.projects].sort((a, b) => a.id - b.id);
  }

  updateProject(id: number, updates: Partial<Omit<Project, 'id' | 'created_at'>>): Project {
    const project = this.data.projects.find(p => p.id === id);
    if (!project) {
      throw new Error('Project not found');
    }
    if (updates.name !== undefined) project.name = updates.name;
    if (updates.path !== undefined) project.path = updates.path;
    if (updates.description !== undefined) project.description = updates.description;
    if (updates.framework !== undefined) project.framework = updates.framework;
    if (updates.last_scanned !== undefined) project.last_scanned = updates.last_scanned;
    if (updates.tags !== undefined) project.tags = updates.tags;
    this.write();
    return project;
  }

  removeProject(id: number): void {
    this.data.projects = this.data.projects.filter(p => p.id !== id);
    this.data.tests = this.data.tests.filter(t => t.project_id !== id);
    this.data.project_ports = this.data.project_ports.filter(p => p.project_id !== id);
    this.write();
  }

  getTestsByProject(projectId: number): Test[] {
    return this.data.tests
      .filter(t => t.project_id === projectId)
      .sort((a, b) => a.file_path.localeCompare(b.file_path));
  }

  getProjectPorts(projectId: number): ProjectPort[] {
    return this.data.project_ports
      .filter(p => p.project_id === projectId)
      .sort((a, b) => a.port - b.port);
  }
}

class DirectDataProvider implements ProjaxDataProvider {
  mode: ConnectionMode = 'direct';
  private db: JSONDatabase;

  constructor() {
    this.db = new JSONDatabase();
  }

  async getProjects(): Promise<Project[]> {
    return this.db.getAllProjects();
  }

  async getProject(id: number): Promise<Project | null> {
    return this.db.getProject(id);
  }

  async getProjectByPath(projectPath: string): Promise<Project | null> {
    return this.db.getProjectByPath(projectPath);
  }

  async addProject(name: string, projectPath: string): Promise<Project> {
    return this.db.addProject(name, projectPath);
  }

  async updateProject(id: number, updates: Partial<Omit<Project, 'id' | 'created_at'>>): Promise<Project> {
    return this.db.updateProject(id, updates);
  }

  async removeProject(id: number): Promise<void> {
    this.db.removeProject(id);
  }

  async getTestsByProject(projectId: number): Promise<Test[]> {
    return this.db.getTestsByProject(projectId);
  }

  async getProjectPorts(projectId: number): Promise<ProjectPort[]> {
    return this.db.getProjectPorts(projectId);
  }

  async getAllTags(): Promise<string[]> {
    return this.db.getAllTags();
  }

  async scanProject(id: number): Promise<{ project: Project; testsFound: number; tests: Test[] }> {
    // For direct mode, we'd need to import the scanner service
    // For now, return a basic response
    const project = await this.getProject(id);
    if (!project) {
      throw new Error('Project not found');
    }
    const tests = await this.getTestsByProject(id);
    return {
      project,
      testsFound: tests.length,
      tests,
    };
  }

  async scanAllProjects(): Promise<Array<{ project: Project; testsFound: number; tests: Test[] }>> {
    const projects = await this.getProjects();
    const results = await Promise.all(
      projects.map(async (project) => {
        const tests = await this.getTestsByProject(project.id);
        return {
          project,
          testsFound: tests.length,
          tests,
        };
      })
    );
    return results;
  }
}

export class ConnectionManager {
  private provider: ProjaxDataProvider | null = null;
  private mode: ConnectionMode | null = null;

  /**
   * Attempt to connect to the API server
   */
  private async tryAPIConnection(manualPort?: number): Promise<string | null> {
    const dataDir = path.join(os.homedir(), '.projax');
    const portFile = path.join(dataDir, 'api-port.txt');

    let portsToTry: number[] = [];

    if (manualPort) {
      portsToTry = [manualPort];
    } else if (fs.existsSync(portFile)) {
      try {
        const portStr = fs.readFileSync(portFile, 'utf-8').trim();
        const port = parseInt(portStr, 10);
        if (!isNaN(port)) {
          portsToTry = [port];
        }
      } catch {
        // Fall through to default range
      }
    }

    // If no port file or manual port, try range 3001-3010
    if (portsToTry.length === 0) {
      portsToTry = Array.from({ length: 10 }, (_, i) => 3001 + i);
    }

    // Test each port
    for (const port of portsToTry) {
      const baseUrl = `http://localhost:${port}`;
      try {
        const response = await axios.get(`${baseUrl}/health`, { timeout: 2000 });
        if (response.status === 200) {
          return `${baseUrl}/api`;
        }
      } catch {
        // Try next port
        continue;
      }
    }

    return null;
  }

  /**
   * Initialize connection - try API first, fallback to direct
   */
  async connect(manualPort?: number): Promise<ProjaxDataProvider> {
    // Try API connection first
    const apiUrl = await this.tryAPIConnection(manualPort);
    if (apiUrl) {
      try {
        this.provider = new APIDataProvider(apiUrl);
        this.mode = 'api';
        return this.provider;
      } catch (error) {
        // Fall through to direct
      }
    }

    // Fallback to direct database access
    this.provider = new DirectDataProvider();
    this.mode = 'direct';
    return this.provider;
  }

  /**
   * Get current provider
   */
  getProvider(): ProjaxDataProvider | null {
    return this.provider;
  }

  /**
   * Get current connection mode
   */
  getMode(): ConnectionMode | null {
    return this.mode;
  }

  /**
   * Reconnect (useful after API server starts)
   */
  async reconnect(manualPort?: number): Promise<ProjaxDataProvider> {
    return this.connect(manualPort);
  }
}

// Singleton instance
let connectionManager: ConnectionManager | null = null;

export function getConnectionManager(): ConnectionManager {
  if (!connectionManager) {
    connectionManager = new ConnectionManager();
  }
  return connectionManager;
}

