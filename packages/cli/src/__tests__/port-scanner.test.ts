import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { shouldRescanPorts } from '../port-scanner';

// We need to mock the core-bridge module since it depends on the core package
jest.mock('../core-bridge', () => {
  const mockDb = {
    projects: [] as any[],
    ports: [] as any[],
    
    getProject: function(id: number) {
      return this.projects.find((p: any) => p.id === id) || null;
    },
    
    getAllProjects: function() {
      return [...this.projects];
    },
    
    getProjectPorts: function(projectId: number) {
      return this.ports.filter((p: any) => p.project_id === projectId);
    },
    
    removeProjectPorts: function(projectId: number) {
      this.ports = this.ports.filter((p: any) => p.project_id !== projectId);
    },
    
    addProjectPort: function(projectId: number, port: number, source: string, script: string | null) {
      const newPort = {
        id: this.ports.length + 1,
        project_id: projectId,
        port,
        script_name: script,
        config_source: source,
        last_detected: Math.floor(Date.now() / 1000),
        created_at: Math.floor(Date.now() / 1000),
      };
      this.ports.push(newPort);
      return newPort;
    },
    
    // Helper for tests
    _reset: function() {
      this.projects = [];
      this.ports = [];
    },
    
    _addProject: function(id: number, name: string, projectPath: string) {
      this.projects.push({
        id,
        name,
        path: projectPath,
        created_at: Math.floor(Date.now() / 1000),
      });
    },
  };

  return {
    getDatabaseManager: () => mockDb,
  };
});

import { getDatabaseManager } from '../core-bridge';

describe('Port Scanner', () => {
  let testDir: string;
  let mockDb: any;

  beforeEach(() => {
    testDir = path.join(os.tmpdir(), `projax-port-scanner-test-${Date.now()}`);
    fs.mkdirSync(testDir, { recursive: true });

    mockDb = getDatabaseManager();
    mockDb._reset();
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('shouldRescanPorts', () => {
    it('should return true when no ports exist for project', () => {
      mockDb._addProject(1, 'Test Project', testDir);

      const result = shouldRescanPorts(1);
      expect(result).toBe(true);
    });

    it('should return false when ports were recently detected', () => {
      mockDb._addProject(1, 'Test Project', testDir);
      
      // Add port with current timestamp
      mockDb.addProjectPort(1, 3000, 'package.json', 'dev');

      const result = shouldRescanPorts(1);
      expect(result).toBe(false);
    });

    it('should return true when ports are older than 24 hours', () => {
      mockDb._addProject(1, 'Test Project', testDir);

      // Add port with old timestamp (25 hours ago)
      const oldTimestamp = Math.floor(Date.now() / 1000) - (25 * 60 * 60);
      const port = mockDb.addProjectPort(1, 3000, 'package.json', 'dev');
      port.last_detected = oldTimestamp;

      const result = shouldRescanPorts(1);
      expect(result).toBe(true);
    });

    it('should return true if any port is stale (mixed timestamps)', () => {
      mockDb._addProject(1, 'Test Project', testDir);

      // Add recent port
      mockDb.addProjectPort(1, 3000, 'package.json', 'dev');

      // Add stale port (26 hours ago)
      const oldTimestamp = Math.floor(Date.now() / 1000) - (26 * 60 * 60);
      const stalePort = mockDb.addProjectPort(1, 8080, 'package.json', 'api');
      stalePort.last_detected = oldTimestamp;

      const result = shouldRescanPorts(1);
      expect(result).toBe(true);
    });

    it('should return false when all ports are recent', () => {
      mockDb._addProject(1, 'Test Project', testDir);

      // Add multiple recent ports
      mockDb.addProjectPort(1, 3000, 'package.json', 'dev');
      mockDb.addProjectPort(1, 8080, 'package.json', 'api');
      mockDb.addProjectPort(1, 5432, 'docker-compose.yml', null);

      const result = shouldRescanPorts(1);
      expect(result).toBe(false);
    });

    it('should handle project with no database entry', () => {
      // Project doesn't exist in database
      const result = shouldRescanPorts(999);
      
      // Should return true since no ports found
      expect(result).toBe(true);
    });

    it('should consider 23 hours as recent (not stale)', () => {
      mockDb._addProject(1, 'Test Project', testDir);

      // Add port detected 23 hours ago
      const timestamp = Math.floor(Date.now() / 1000) - (23 * 60 * 60);
      const port = mockDb.addProjectPort(1, 3000, 'package.json', 'dev');
      port.last_detected = timestamp;

      const result = shouldRescanPorts(1);
      expect(result).toBe(false);
    });

    it('should consider exactly 24 hours as stale', () => {
      mockDb._addProject(1, 'Test Project', testDir);

      // Add port detected exactly 24 hours ago
      const timestamp = Math.floor(Date.now() / 1000) - (24 * 60 * 60);
      const port = mockDb.addProjectPort(1, 3000, 'package.json', 'dev');
      port.last_detected = timestamp;

      const result = shouldRescanPorts(1);
      expect(result).toBe(true);
    });
  });
});

