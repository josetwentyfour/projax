import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Use an object to hold testDataDir so it can be accessed before initialization
const testConfig = { dataDir: '' };

// Mock os module
jest.mock('os', () => ({
  ...jest.requireActual('os'),
  homedir: jest.fn(() => testConfig.dataDir || os.tmpdir()),
}));

// Import after mocking
import { JSONDatabase, getDatabase, resetDatabase } from '../database';
import { Project, Test, JenkinsJob, ProjectPort } from '../types';

describe('JSONDatabase', () => {
  beforeEach(() => {
    // Create a temporary test directory with truly unique name
    const uniqueId = `${Date.now()}-${process.hrtime.bigint()}-${Math.random().toString(36).substring(7)}`;
    testConfig.dataDir = path.join(os.tmpdir(), `projax-test-${uniqueId}`);
    
    // Ensure clean slate
    if (fs.existsSync(testConfig.dataDir)) {
      fs.rmSync(testConfig.dataDir, { recursive: true, force: true });
    }
    
    fs.mkdirSync(testConfig.dataDir, { recursive: true });
  });

  afterEach(() => {
    // Reset singleton before cleanup
    resetDatabase();
    
    // Clean up test directory
    if (fs.existsSync(testConfig.dataDir)) {
      fs.rmSync(testConfig.dataDir, { recursive: true, force: true });
    }
  });

  describe('Database Initialization', () => {
    it('should create a new database file if none exists', () => {
      const db = new JSONDatabase();
      const dbPath = path.join(testConfig.dataDir, '.projax', 'data.json');
      expect(fs.existsSync(dbPath)).toBe(true);
    });

    it('should load existing database file', () => {
      // Create initial database
      const db1 = new JSONDatabase();
      db1.addProject('Test Project', '/test/path');

      // Create new instance to load from file
      const db2 = new JSONDatabase();
      const projects = db2.getAllProjects();

      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe('Test Project');
    });

    it('should initialize with default data structure', () => {
      const db = new JSONDatabase();
      expect(db.getAllProjects()).toEqual([]);
      expect(db.getAllSettings()).toEqual({});
    });

    it('should handle corrupted database file gracefully', () => {
      const dataDir = path.join(testConfig.dataDir, '.projax');
      fs.mkdirSync(dataDir, { recursive: true });
      const dbPath = path.join(dataDir, 'data.json');
      
      // Write invalid JSON
      fs.writeFileSync(dbPath, 'invalid json {{{');

      const db = new JSONDatabase();
      expect(db.getAllProjects()).toEqual([]);
    });
  });

  describe('Project Operations', () => {
    let db: JSONDatabase;

    beforeEach(() => {
      db = new JSONDatabase();
    });

    it('should add a new project', () => {
      const project = db.addProject('My Project', '/path/to/project');

      expect(project).toMatchObject({
        id: 1,
        name: 'My Project',
        path: '/path/to/project',
        description: null,
        framework: null,
        last_scanned: null,
        tags: [],
      });
      expect(project.created_at).toBeGreaterThan(0);
    });

    it('should throw error when adding project with duplicate path', () => {
      db.addProject('Project 1', '/same/path');

      expect(() => {
        db.addProject('Project 2', '/same/path');
      }).toThrow('Project with this path already exists');
    });

    it('should generate sequential IDs for projects', () => {
      const project1 = db.addProject('Project 1', '/path/1');
      const project2 = db.addProject('Project 2', '/path/2');
      const project3 = db.addProject('Project 3', '/path/3');

      expect(project1.id).toBe(1);
      expect(project2.id).toBe(2);
      expect(project3.id).toBe(3);
    });

    it('should get a project by ID', () => {
      const added = db.addProject('Test', '/test');
      const found = db.getProject(added.id);

      expect(found).toEqual(added);
    });

    it('should return null for non-existent project ID', () => {
      const found = db.getProject(999);
      expect(found).toBeNull();
    });

    it('should get a project by path', () => {
      const added = db.addProject('Test', '/test/path');
      const found = db.getProjectByPath('/test/path');

      expect(found).toEqual(added);
    });

    it('should return null for non-existent project path', () => {
      const found = db.getProjectByPath('/non/existent');
      expect(found).toBeNull();
    });

    it('should get all projects', () => {
      db.addProject('Project 1', '/path/1');
      db.addProject('Project 2', '/path/2');
      db.addProject('Project 3', '/path/3');

      const projects = db.getAllProjects();
      expect(projects).toHaveLength(3);
      expect(projects.map(p => p.name)).toEqual(['Project 1', 'Project 2', 'Project 3']);
    });

    it('should update project name', () => {
      const project = db.addProject('Old Name', '/path');
      const updated = db.updateProjectName(project.id, 'New Name');

      expect(updated.name).toBe('New Name');
      expect(updated.id).toBe(project.id);
    });

    it('should throw error when updating non-existent project name', () => {
      expect(() => {
        db.updateProjectName(999, 'New Name');
      }).toThrow('Project not found');
    });

    it('should update project with partial updates', () => {
      const project = db.addProject('Test', '/path');
      
      const updated = db.updateProject(project.id, {
        description: 'A test project',
        framework: 'Node.js',
        tags: ['web', 'api'],
      });

      expect(updated).toMatchObject({
        id: project.id,
        name: 'Test',
        description: 'A test project',
        framework: 'Node.js',
        tags: ['web', 'api'],
      });
    });

    it('should update project last scanned timestamp', () => {
      const project = db.addProject('Test', '/path');
      expect(project.last_scanned).toBeNull();

      db.updateProjectLastScanned(project.id);
      const updated = db.getProject(project.id);

      expect(updated?.last_scanned).toBeGreaterThan(0);
    });

    it('should remove a project', () => {
      const project = db.addProject('Test', '/path');
      db.removeProject(project.id);

      expect(db.getProject(project.id)).toBeNull();
      expect(db.getAllProjects()).toHaveLength(0);
    });

    it('should remove related data when removing project', () => {
      const project = db.addProject('Test', '/path');
      db.addTest(project.id, 'test.js', 'jest');
      db.addJenkinsJob(project.id, 'build', 'http://jenkins');
      db.addProjectPort(project.id, 3000, 'package.json', 'dev');

      db.removeProject(project.id);

      expect(db.getTestsByProject(project.id)).toHaveLength(0);
      expect(db.getJenkinsJobsByProject(project.id)).toHaveLength(0);
      expect(db.getProjectPorts(project.id)).toHaveLength(0);
    });

    it('should get all unique tags', () => {
      db.addProject('Project 1', '/path/1');
      db.updateProject(1, { tags: ['web', 'api'] });
      
      db.addProject('Project 2', '/path/2');
      db.updateProject(2, { tags: ['api', 'mobile'] });

      const tags = db.getAllTags();
      expect(tags).toEqual(['api', 'mobile', 'web']);
    });
  });

  describe('Test Operations', () => {
    let db: JSONDatabase;
    let projectId: number;

    beforeEach(() => {
      db = new JSONDatabase();
      const project = db.addProject('Test Project', '/test/path');
      projectId = project.id;
    });

    it('should add a new test', () => {
      const test = db.addTest(projectId, 'src/test.spec.ts', 'jest');

      expect(test).toMatchObject({
        id: 1,
        project_id: projectId,
        file_path: 'src/test.spec.ts',
        framework: 'jest',
        status: null,
        last_run: null,
      });
      expect(test.created_at).toBeGreaterThan(0);
    });

    it('should update existing test when adding duplicate', () => {
      const test1 = db.addTest(projectId, 'test.js', 'jest');
      const test2 = db.addTest(projectId, 'test.js', 'mocha');

      expect(test2.id).toBe(test1.id);
      expect(test2.framework).toBe('mocha');
    });

    it('should get a test by ID', () => {
      const added = db.addTest(projectId, 'test.js', 'jest');
      const found = db.getTest(added.id);

      expect(found).toEqual(added);
    });

    it('should get tests by project ID', () => {
      db.addTest(projectId, 'test1.js', 'jest');
      db.addTest(projectId, 'test2.js', 'jest');
      db.addTest(projectId, 'test3.js', 'mocha');

      const tests = db.getTestsByProject(projectId);
      expect(tests).toHaveLength(3);
    });

    it('should sort tests by file path', () => {
      db.addTest(projectId, 'c.js', 'jest');
      db.addTest(projectId, 'a.js', 'jest');
      db.addTest(projectId, 'b.js', 'jest');

      const tests = db.getTestsByProject(projectId);
      expect(tests.map(t => t.file_path)).toEqual(['a.js', 'b.js', 'c.js']);
    });

    it('should remove tests by project', () => {
      db.addTest(projectId, 'test1.js', 'jest');
      db.addTest(projectId, 'test2.js', 'jest');

      db.removeTestsByProject(projectId);
      expect(db.getTestsByProject(projectId)).toHaveLength(0);
    });
  });

  describe('Jenkins Job Operations', () => {
    let db: JSONDatabase;
    let projectId: number;

    beforeEach(() => {
      db = new JSONDatabase();
      const project = db.addProject('Test Project', '/test/path');
      projectId = project.id;
    });

    it('should add a new Jenkins job', () => {
      const job = db.addJenkinsJob(projectId, 'build-job', 'http://jenkins/job/build');

      expect(job).toMatchObject({
        id: 1,
        project_id: projectId,
        job_name: 'build-job',
        job_url: 'http://jenkins/job/build',
        last_build_status: null,
        last_build_number: null,
        last_updated: null,
      });
      expect(job.created_at).toBeGreaterThan(0);
    });

    it('should update existing Jenkins job when adding duplicate', () => {
      const job1 = db.addJenkinsJob(projectId, 'build', 'http://old-url');
      const job2 = db.addJenkinsJob(projectId, 'build', 'http://new-url');

      expect(job2.id).toBe(job1.id);
      expect(job2.job_url).toBe('http://new-url');
    });

    it('should get a Jenkins job by ID', () => {
      const added = db.addJenkinsJob(projectId, 'build', 'http://jenkins');
      const found = db.getJenkinsJob(added.id);

      expect(found).toEqual(added);
    });

    it('should get Jenkins jobs by project ID', () => {
      db.addJenkinsJob(projectId, 'build', 'http://jenkins/build');
      db.addJenkinsJob(projectId, 'test', 'http://jenkins/test');
      db.addJenkinsJob(projectId, 'deploy', 'http://jenkins/deploy');

      const jobs = db.getJenkinsJobsByProject(projectId);
      expect(jobs).toHaveLength(3);
    });

    it('should sort Jenkins jobs by name', () => {
      db.addJenkinsJob(projectId, 'z-job', 'http://jenkins/z');
      db.addJenkinsJob(projectId, 'a-job', 'http://jenkins/a');
      db.addJenkinsJob(projectId, 'm-job', 'http://jenkins/m');

      const jobs = db.getJenkinsJobsByProject(projectId);
      expect(jobs.map(j => j.job_name)).toEqual(['a-job', 'm-job', 'z-job']);
    });
  });

  describe('Project Port Operations', () => {
    let db: JSONDatabase;
    let projectId: number;

    beforeEach(() => {
      db = new JSONDatabase();
      const project = db.addProject('Test Project', '/test/path');
      projectId = project.id;
    });

    it('should add a new project port', () => {
      const port = db.addProjectPort(projectId, 3000, 'package.json', 'dev');

      expect(port).toMatchObject({
        id: 1,
        project_id: projectId,
        port: 3000,
        script_name: 'dev',
        config_source: 'package.json',
      });
      expect(port.last_detected).toBeGreaterThan(0);
      expect(port.created_at).toBeGreaterThan(0);
    });

    it('should update existing port when adding duplicate', () => {
      const port1 = db.addProjectPort(projectId, 3000, 'old-source', 'dev');
      const port2 = db.addProjectPort(projectId, 3000, 'new-source', 'dev');

      expect(port2.id).toBe(port1.id);
      expect(port2.config_source).toBe('new-source');
    });

    it('should get a project port by ID', () => {
      const added = db.addProjectPort(projectId, 3000, 'package.json');
      const found = db.getProjectPort(added.id);

      expect(found).toEqual(added);
    });

    it('should get all ports for a project', () => {
      db.addProjectPort(projectId, 3000, 'package.json', 'dev');
      db.addProjectPort(projectId, 8080, 'package.json', 'api');
      db.addProjectPort(projectId, 5432, 'docker-compose.yml');

      const ports = db.getProjectPorts(projectId);
      expect(ports).toHaveLength(3);
    });

    it('should sort ports by port number', () => {
      db.addProjectPort(projectId, 8080, 'package.json');
      db.addProjectPort(projectId, 3000, 'package.json');
      db.addProjectPort(projectId, 5432, 'docker-compose.yml');

      const ports = db.getProjectPorts(projectId);
      expect(ports.map(p => p.port)).toEqual([3000, 5432, 8080]);
    });

    it('should get ports by script name', () => {
      db.addProjectPort(projectId, 3000, 'package.json', 'dev');
      db.addProjectPort(projectId, 3001, 'package.json', 'dev');
      db.addProjectPort(projectId, 8080, 'package.json', 'prod');

      const devPorts = db.getProjectPortsByScript(projectId, 'dev');
      expect(devPorts).toHaveLength(2);
      expect(devPorts.map(p => p.port)).toEqual([3000, 3001]);
    });

    it('should update port last detected timestamp', (done) => {
      const port = db.addProjectPort(projectId, 3000, 'package.json', 'dev');
      const initialTime = port.last_detected;

      // Wait a bit to ensure timestamp changes
      setTimeout(() => {
        db.updateProjectPortLastDetected(projectId, 3000, 'dev');
        const updated = db.getProjectPort(port.id);

        expect(updated?.last_detected).toBeGreaterThanOrEqual(initialTime);
        done();
      }, 10);
    });

    it('should remove all ports for a project', () => {
      db.addProjectPort(projectId, 3000, 'package.json');
      db.addProjectPort(projectId, 8080, 'package.json');

      db.removeProjectPorts(projectId);
      expect(db.getProjectPorts(projectId)).toHaveLength(0);
    });
  });

  describe('Settings Operations', () => {
    let db: JSONDatabase;

    beforeEach(() => {
      db = new JSONDatabase();
    });

    it('should set a new setting', () => {
      db.setSetting('theme', 'dark');
      const value = db.getSetting('theme');

      expect(value).toBe('dark');
    });

    it('should update an existing setting', () => {
      db.setSetting('theme', 'dark');
      db.setSetting('theme', 'light');

      expect(db.getSetting('theme')).toBe('light');
    });

    it('should return null for non-existent setting', () => {
      const value = db.getSetting('non-existent');
      expect(value).toBeNull();
    });

    it('should get all settings', () => {
      db.setSetting('theme', 'dark');
      db.setSetting('language', 'en');
      db.setSetting('notifications', 'true');

      const settings = db.getAllSettings();
      expect(settings).toEqual({
        theme: 'dark',
        language: 'en',
        notifications: 'true',
      });
    });
  });

  describe('Data Migration', () => {
    it('should migrate old data without tags field', () => {
      const dataDir = path.join(testConfig.dataDir, '.projax');
      fs.mkdirSync(dataDir, { recursive: true });
      const dbPath = path.join(dataDir, 'data.json');

      // Write old format without tags
      const oldData = {
        projects: [
          {
            id: 1,
            name: 'Old Project',
            path: '/old/path',
            created_at: 1234567890,
          },
        ],
        tests: [],
        jenkins_jobs: [],
        project_ports: [],
        settings: [],
      };
      fs.writeFileSync(dbPath, JSON.stringify(oldData));

      const db = new JSONDatabase();
      const project = db.getProject(1);

      expect(project?.tags).toEqual([]);
      expect(project?.framework).toBeNull();
      expect(project?.description).toBeNull();
    });

    it('should add missing arrays in migration', () => {
      const dataDir = path.join(testConfig.dataDir, '.projax');
      fs.mkdirSync(dataDir, { recursive: true });
      const dbPath = path.join(dataDir, 'data.json');

      // Write incomplete data
      const oldData = {
        projects: [],
      };
      fs.writeFileSync(dbPath, JSON.stringify(oldData));

      const db = new JSONDatabase();
      
      // Should not throw and should have all arrays
      expect(db.getAllProjects()).toEqual([]);
      expect(db.getAllSettings()).toEqual({});
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const db1 = getDatabase();
      const db2 = getDatabase();

      expect(db1).toBe(db2);
    });
  });

  describe('Persistence', () => {
    it('should persist data to disk', () => {
      const db = new JSONDatabase();
      db.addProject('Test', '/test');

      const dbPath = path.join(testConfig.dataDir, '.projax', 'data.json');
      const content = fs.readFileSync(dbPath, 'utf-8');
      const data = JSON.parse(content);

      expect(data.projects).toHaveLength(1);
      expect(data.projects[0].name).toBe('Test');
    });

    it('should format JSON with indentation', () => {
      const db = new JSONDatabase();
      db.addProject('Test', '/test');

      const dbPath = path.join(testConfig.dataDir, '.projax', 'data.json');
      const content = fs.readFileSync(dbPath, 'utf-8');

      // Check that it's formatted (has newlines and indentation)
      expect(content).toContain('\n');
      expect(content).toContain('  ');
    });
  });
});

