import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { DatabaseSchema, Project, Test, JenkinsJob, ProjectPort, TestResult } from './types';

const defaultData: DatabaseSchema = {
  projects: [],
  tests: [],
  jenkins_jobs: [],
  project_ports: [],
  test_results: [],
  settings: [],
};

class JSONDatabase {
  private data: DatabaseSchema;
  private dbPath: string;

  constructor() {
    const dataDir = path.join(os.homedir(), '.projax');
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    this.dbPath = path.join(dataDir, 'data.json');
    
    // Load data from file or use defaults
    if (fs.existsSync(this.dbPath)) {
      try {
        const fileContent = fs.readFileSync(this.dbPath, 'utf-8');
        this.data = JSON.parse(fileContent);
        // Migrate/validate loaded data to ensure type safety
        this.migrateData();
      } catch (error) {
        console.error('Error reading database file, using defaults:', error);
        this.data = JSON.parse(JSON.stringify(defaultData));
        this.write();
      }
    } else {
      this.data = JSON.parse(JSON.stringify(defaultData));
      this.write();
    }
  }

  /**
   * Migrate and validate loaded data to ensure compatibility with current schema.
   * This ensures that projects loaded from older database versions have all required fields.
   */
  private migrateData(): void {
    let needsWrite = false;
    
    // Ensure all projects have the framework, description, and tags fields
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
    
    // Ensure all required top-level arrays exist
    if (!this.data.tests) {
      this.data.tests = [];
      needsWrite = true;
    }
    if (!this.data.jenkins_jobs) {
      this.data.jenkins_jobs = [];
      needsWrite = true;
    }
    if (!this.data.project_ports) {
      this.data.project_ports = [];
      needsWrite = true;
    }
    if (!this.data.test_results) {
      this.data.test_results = [];
      needsWrite = true;
    }
    if (!this.data.settings) {
      this.data.settings = [];
      needsWrite = true;
    }
    
    // Write migrated data back to disk if any changes were made
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

  // Project operations
  addProject(name: string, projectPath: string): Project {
    const projects = this.data.projects;
    
    // Check if project with same path already exists
    const existing = projects.find(p => p.path === projectPath);
    if (existing) {
      throw new Error('Project with this path already exists');
    }
    
    const newId = projects.length > 0 
      ? Math.max(...projects.map(p => p.id)) + 1 
      : 1;
    
    const project: Project = {
      id: newId,
      name,
      path: projectPath,
      description: null,
      framework: null,  // Will be detected on first scan
      last_scanned: null,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
    };
    
    projects.push(project);
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

  updateProjectLastScanned(id: number): void {
    const project = this.data.projects.find(p => p.id === id);
    if (project) {
      project.last_scanned = Math.floor(Date.now() / 1000);
      this.write();
    }
  }

  updateProjectName(id: number, newName: string): Project {
    const project = this.data.projects.find(p => p.id === id);
    if (!project) {
      throw new Error('Project not found');
    }
    project.name = newName;
    this.write();
    return project;
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
    // Also remove related data
    this.data.tests = this.data.tests.filter(t => t.project_id !== id);
    this.data.jenkins_jobs = this.data.jenkins_jobs.filter(j => j.project_id !== id);
    this.data.project_ports = this.data.project_ports.filter(p => p.project_id !== id);
    this.data.test_results = this.data.test_results.filter(r => r.project_id !== id);
    this.write();
  }

  // Test operations
  addTest(projectId: number, filePath: string, framework: string | null = null): Test {
    const tests = this.data.tests;
    
    // Check if test already exists
    const existing = tests.find(t => t.project_id === projectId && t.file_path === filePath);
    if (existing) {
      existing.framework = framework;
      this.write();
      return existing;
    }
    
    const newId = tests.length > 0 
      ? Math.max(...tests.map(t => t.id)) + 1 
      : 1;
    
    const test: Test = {
      id: newId,
      project_id: projectId,
      file_path: filePath,
      framework,
      status: null,
      last_run: null,
      created_at: Math.floor(Date.now() / 1000),
    };
    
    tests.push(test);
    this.write();
    return test;
  }

  getTest(id: number): Test | null {
    
    return this.data.tests.find(t => t.id === id) || null;
  }

  getTestsByProject(projectId: number): Test[] {
    
    return this.data.tests
      .filter(t => t.project_id === projectId)
      .sort((a, b) => a.file_path.localeCompare(b.file_path));
  }

  removeTestsByProject(projectId: number): void {
    
    this.data.tests = this.data.tests.filter(t => t.project_id !== projectId);
    this.write();
  }

  // Test Result operations
  addTestResult(
    projectId: number,
    scriptName: string,
    passed: number,
    failed: number,
    skipped: number = 0,
    total: number = passed + failed + skipped,
    duration: number | null = null,
    coverage: number | null = null,
    framework: string | null = null,
    rawOutput: string | null = null
  ): TestResult {
    const results = this.data.test_results;
    
    const newId = results.length > 0 
      ? Math.max(...results.map(r => r.id)) + 1 
      : 1;
    
    const testResult: TestResult = {
      id: newId,
      project_id: projectId,
      script_name: scriptName,
      framework,
      passed,
      failed,
      skipped,
      total,
      duration,
      coverage,
      timestamp: Math.floor(Date.now() / 1000),
      raw_output: rawOutput,
    };
    
    results.push(testResult);
    this.write();
    return testResult;
  }

  getTestResult(id: number): TestResult | null {
    return this.data.test_results.find(r => r.id === id) || null;
  }

  getLatestTestResult(projectId: number): TestResult | null {
    const projectResults = this.data.test_results
      .filter(r => r.project_id === projectId)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    return projectResults.length > 0 ? projectResults[0] : null;
  }

  getTestResultsByProject(projectId: number, limit: number = 10): TestResult[] {
    return this.data.test_results
      .filter(r => r.project_id === projectId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  removeTestResultsByProject(projectId: number): void {
    this.data.test_results = this.data.test_results.filter(r => r.project_id !== projectId);
    this.write();
  }

  // Jenkins operations
  addJenkinsJob(projectId: number, jobName: string, jobUrl: string): JenkinsJob {
    
    const jobs = this.data.jenkins_jobs;
    
    // Check if job already exists
    const existing = jobs.find(j => j.project_id === projectId && j.job_name === jobName);
    if (existing) {
      existing.job_url = jobUrl;
      this.write();
      return existing;
    }
    
    const newId = jobs.length > 0 
      ? Math.max(...jobs.map(j => j.id)) + 1 
      : 1;
    
    const job: JenkinsJob = {
      id: newId,
      project_id: projectId,
      job_name: jobName,
      job_url: jobUrl,
      last_build_status: null,
      last_build_number: null,
      last_updated: null,
      created_at: Math.floor(Date.now() / 1000),
    };
    
    jobs.push(job);
    this.write();
    return job;
  }

  getJenkinsJob(id: number): JenkinsJob | null {
    
    return this.data.jenkins_jobs.find(j => j.id === id) || null;
  }

  getJenkinsJobsByProject(projectId: number): JenkinsJob[] {
    
    return this.data.jenkins_jobs
      .filter(j => j.project_id === projectId)
      .sort((a, b) => a.job_name.localeCompare(b.job_name));
  }

  // Project port operations
  addProjectPort(
    projectId: number,
    port: number,
    configSource: string,
    scriptName: string | null = null
  ): ProjectPort {
    
    const ports = this.data.project_ports;
    
    // Check if port already exists for this project/script combination
    const existing = ports.find(
      p => p.project_id === projectId && 
           p.port === port && 
           ((p.script_name === scriptName) || (p.script_name === null && scriptName === null))
    );
    
    if (existing) {
      existing.config_source = configSource;
      existing.last_detected = Math.floor(Date.now() / 1000);
      this.write();
      return existing;
    }
    
    const newId = ports.length > 0 
      ? Math.max(...ports.map(p => p.id)) + 1 
      : 1;
    
    const projectPort: ProjectPort = {
      id: newId,
      project_id: projectId,
      port,
      script_name: scriptName,
      config_source: configSource,
      last_detected: Math.floor(Date.now() / 1000),
      created_at: Math.floor(Date.now() / 1000),
    };
    
    ports.push(projectPort);
    this.write();
    return projectPort;
  }

  getProjectPort(id: number): ProjectPort | null {
    
    return this.data.project_ports.find(p => p.id === id) || null;
  }

  getProjectPorts(projectId: number): ProjectPort[] {
    
    return this.data.project_ports
      .filter(p => p.project_id === projectId)
      .sort((a, b) => a.port - b.port);
  }

  getProjectPortsByScript(projectId: number, scriptName: string): ProjectPort[] {
    
    return this.data.project_ports
      .filter(p => p.project_id === projectId && p.script_name === scriptName)
      .sort((a, b) => a.port - b.port);
  }

  removeProjectPorts(projectId: number): void {
    
    this.data.project_ports = this.data.project_ports.filter(p => p.project_id !== projectId);
    this.write();
  }

  updateProjectPortLastDetected(projectId: number, port: number, scriptName: string | null): void {
    
    const projectPort = this.data.project_ports.find(
      p => p.project_id === projectId && 
           p.port === port && 
           ((p.script_name === scriptName) || (p.script_name === null && scriptName === null))
    );
    if (projectPort) {
      projectPort.last_detected = Math.floor(Date.now() / 1000);
      this.write();
    }
  }

  // Settings operations
  getSetting(key: string): string | null {
    
    const setting = this.data.settings.find(s => s.key === key);
    return setting ? setting.value : null;
  }

  setSetting(key: string, value: string): void {
    
    const existing = this.data.settings.find(s => s.key === key);
    if (existing) {
      existing.value = value;
      existing.updated_at = Math.floor(Date.now() / 1000);
    } else {
      this.data.settings.push({
        key,
        value,
        updated_at: Math.floor(Date.now() / 1000),
      });
    }
    this.write();
  }

  getAllSettings(): Record<string, string> {
    
    const settings: Record<string, string> = {};
    for (const setting of this.data.settings) {
      settings[setting.key] = setting.value;
    }
    return settings;
  }
}

// Singleton instance
let dbInstance: JSONDatabase | null = null;

export function getDatabase(): JSONDatabase {
  if (!dbInstance) {
    dbInstance = new JSONDatabase();
  }
  return dbInstance;
}

export function resetDatabase(): void {
  dbInstance = null;
}

export { JSONDatabase };

