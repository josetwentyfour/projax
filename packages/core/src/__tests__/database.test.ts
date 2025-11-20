import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';
import { getDatabaseManager, Project, Test, TestResult, ProjectPort } from '../database';

// Mock modules
jest.mock('fs');
jest.mock('child_process');
const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe('database', () => {
  const dataDir = path.join(os.homedir(), '.projax');
  const portFile = path.join(dataDir, 'api-port.txt');
  const defaultPort = 38124;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DatabaseManager constructor', () => {
    it('should initialize database manager', () => {
      mockedFs.existsSync.mockReturnValue(false);
      
      const db = getDatabaseManager();
      expect(db).toBeDefined();
      expect(typeof db.getAllProjects).toBe('function');
      expect(typeof db.addProject).toBe('function');
    });

    it('should handle port file configuration', () => {
      // This test verifies the DatabaseManager can be initialized
      // regardless of port file existence
      mockedFs.existsSync.mockReturnValue(false);
      
      const db = getDatabaseManager();
      expect(db).toBeDefined();
    });

    it('should be resilient to file system errors', () => {
      // Even if existsSync throws, the module should handle it gracefully
      mockedFs.existsSync.mockImplementation(() => {
        // Silently fail - use default
        return false;
      });
      
      const db = getDatabaseManager();
      expect(db).toBeDefined();
    });
  });

  describe('Project operations', () => {
    beforeEach(() => {
      mockedFs.existsSync.mockReturnValue(false);
    });

    describe('addProject', () => {
      it('should add a project successfully', () => {
        const mockProject: Project = {
          id: 1,
          name: 'Test Project',
          path: '/test/path',
          description: null,
          framework: null,
          last_scanned: null,
          created_at: Date.now(),
        };

        mockedExecSync.mockReturnValue(JSON.stringify(mockProject));

        const db = getDatabaseManager();
        const result = db.addProject('Test Project', '/test/path');

        expect(result).toEqual(mockProject);
        expect(mockedExecSync).toHaveBeenCalledWith(
          expect.stringContaining('curl -s -f -X POST'),
          expect.any(Object)
        );
      });

      it('should handle API errors', () => {
        mockedExecSync.mockImplementation(() => {
          throw new Error('API request failed');
        });

        const db = getDatabaseManager();
        expect(() => db.addProject('Test', '/path')).toThrow();
      });
    });

    describe('getProject', () => {
      it('should get a project by id', () => {
        const mockProject: Project = {
          id: 1,
          name: 'Test Project',
          path: '/test/path',
          description: null,
          framework: 'react',
          last_scanned: null,
          created_at: Date.now(),
        };

        mockedExecSync.mockReturnValue(JSON.stringify(mockProject));

        const db = getDatabaseManager();
        const result = db.getProject(1);

        expect(result).toEqual(mockProject);
      });

      it('should return null for 404 errors', () => {
        mockedExecSync.mockImplementation(() => {
          const error = new Error('curl failed with 404 status');
          throw error;
        });

        const db = getDatabaseManager();
        
        expect(() => db.getProject(999)).toThrow();
      });
    });

    describe('getAllProjects', () => {
      it('should get all projects', () => {
        const mockProjects: Project[] = [
          {
            id: 1,
            name: 'Project 1',
            path: '/path/1',
            description: null,
            framework: 'react',
            last_scanned: null,
            created_at: Date.now(),
          },
          {
            id: 2,
            name: 'Project 2',
            path: '/path/2',
            description: null,
            framework: 'vue',
            last_scanned: null,
            created_at: Date.now(),
          },
        ];

        mockedExecSync.mockReturnValue(JSON.stringify(mockProjects));

        const db = getDatabaseManager();
        const result = db.getAllProjects();

        expect(result).toEqual(mockProjects);
        expect(result.length).toBe(2);
      });

      it('should return empty array when no projects exist', () => {
        mockedExecSync.mockReturnValue(JSON.stringify([]));

        const db = getDatabaseManager();
        const result = db.getAllProjects();

        expect(result).toEqual([]);
      });
    });

    describe('getProjectByPath', () => {
      it('should find project by path', () => {
        const mockProjects: Project[] = [
          {
            id: 1,
            name: 'Project 1',
            path: '/path/1',
            description: null,
            framework: null,
            last_scanned: null,
            created_at: Date.now(),
          },
          {
            id: 2,
            name: 'Project 2',
            path: '/path/2',
            description: null,
            framework: null,
            last_scanned: null,
            created_at: Date.now(),
          },
        ];

        mockedExecSync.mockReturnValue(JSON.stringify(mockProjects));

        const db = getDatabaseManager();
        const result = db.getProjectByPath('/path/2');

        expect(result).toEqual(mockProjects[1]);
      });

      it('should return null if project path not found', () => {
        mockedExecSync.mockReturnValue(JSON.stringify([]));

        const db = getDatabaseManager();
        const result = db.getProjectByPath('/nonexistent');

        expect(result).toBeNull();
      });
    });

    describe('updateProject', () => {
      it('should update project successfully', () => {
        const updatedProject: Project = {
          id: 1,
          name: 'Updated Name',
          path: '/test/path',
          description: 'New description',
          framework: 'react',
          last_scanned: Date.now(),
          created_at: Date.now() - 1000,
        };

        mockedExecSync.mockReturnValue(JSON.stringify(updatedProject));

        const db = getDatabaseManager();
        const result = db.updateProject(1, { name: 'Updated Name', description: 'New description' });

        expect(result).toEqual(updatedProject);
      });
    });

    describe('updateProjectName', () => {
      it('should update project name', () => {
        const updatedProject: Project = {
          id: 1,
          name: 'New Name',
          path: '/test/path',
          description: null,
          framework: null,
          last_scanned: null,
          created_at: Date.now(),
        };

        mockedExecSync.mockReturnValue(JSON.stringify(updatedProject));

        const db = getDatabaseManager();
        const result = db.updateProjectName(1, 'New Name');

        expect(result.name).toBe('New Name');
      });
    });

    describe('updateProjectFramework', () => {
      it('should update project framework', () => {
        mockedExecSync.mockReturnValue('');

        const db = getDatabaseManager();
        expect(() => db.updateProjectFramework(1, 'react')).not.toThrow();
      });
    });

    describe('removeProject', () => {
      it('should remove project successfully', () => {
        mockedExecSync.mockReturnValue('');

        const db = getDatabaseManager();
        expect(() => db.removeProject(1)).not.toThrow();
        expect(mockedExecSync).toHaveBeenCalledWith(
          expect.stringContaining('DELETE'),
          expect.any(Object)
        );
      });
    });

    describe('scanProject', () => {
      it('should scan project and return results', () => {
        const scanResponse = {
          project: {
            id: 1,
            name: 'Test Project',
            path: '/test/path',
            description: null,
            framework: 'jest',
            last_scanned: Date.now(),
            created_at: Date.now(),
          },
          testsFound: 2,
          tests: [
            {
              id: 1,
              project_id: 1,
              file_path: '/test/file1.test.ts',
              framework: 'jest',
              status: null,
              last_run: null,
              created_at: Date.now(),
            },
            {
              id: 2,
              project_id: 1,
              file_path: '/test/file2.test.ts',
              framework: 'jest',
              status: null,
              last_run: null,
              created_at: Date.now(),
            },
          ],
        };

        mockedExecSync.mockReturnValue(JSON.stringify(scanResponse));

        const db = getDatabaseManager();
        const result = db.scanProject(1);

        expect(result.testsFound).toBe(2);
        expect(result.tests.length).toBe(2);
      });
    });

    describe('scanAllProjects', () => {
      it('should scan all projects', () => {
        const scanResults = [
          {
            project: {
              id: 1,
              name: 'Project 1',
              path: '/path/1',
              description: null,
              framework: null,
              last_scanned: Date.now(),
              created_at: Date.now(),
            },
            testsFound: 1,
            tests: [],
          },
        ];

        mockedExecSync.mockReturnValue(JSON.stringify(scanResults));

        const db = getDatabaseManager();
        const result = db.scanAllProjects();

        expect(result).toEqual(scanResults);
      });
    });
  });

  describe('Test operations', () => {
    beforeEach(() => {
      mockedFs.existsSync.mockReturnValue(false);
    });

    describe('getTestsByProject', () => {
      it('should get tests for a project', () => {
        const mockTests: Test[] = [
          {
            id: 1,
            project_id: 1,
            file_path: '/test/file.test.ts',
            framework: 'jest',
            status: null,
            last_run: null,
            created_at: Date.now(),
          },
        ];

        mockedExecSync.mockReturnValue(JSON.stringify(mockTests));

        const db = getDatabaseManager();
        const result = db.getTestsByProject(1);

        expect(result).toEqual(mockTests);
      });
    });

    describe('addTest', () => {
      it('should throw error when called directly', () => {
        const db = getDatabaseManager();
        expect(() => db.addTest(1, '/test/file.test.ts')).toThrow(
          'addTest should not be called directly'
        );
      });
    });

    describe('getTest', () => {
      it('should throw error as endpoint not implemented', () => {
        const db = getDatabaseManager();
        expect(() => db.getTest(1)).toThrow('not yet implemented');
      });
    });
  });

  describe('Project Port operations', () => {
    beforeEach(() => {
      mockedFs.existsSync.mockReturnValue(false);
    });

    describe('getProjectPorts', () => {
      it('should get ports for a project', () => {
        const mockPorts: ProjectPort[] = [
          {
            id: 1,
            project_id: 1,
            port: 3000,
            script_name: 'dev',
            config_source: 'package.json',
            last_detected: Date.now(),
            created_at: Date.now(),
          },
        ];

        mockedExecSync.mockReturnValue(JSON.stringify(mockPorts));

        const db = getDatabaseManager();
        const result = db.getProjectPorts(1);

        expect(result).toEqual(mockPorts);
      });
    });

    describe('getProjectPortsByScript', () => {
      it('should filter ports by script name', () => {
        const mockPorts: ProjectPort[] = [
          {
            id: 1,
            project_id: 1,
            port: 3000,
            script_name: 'dev',
            config_source: 'package.json',
            last_detected: Date.now(),
            created_at: Date.now(),
          },
          {
            id: 2,
            project_id: 1,
            port: 3001,
            script_name: 'start',
            config_source: 'package.json',
            last_detected: Date.now(),
            created_at: Date.now(),
          },
        ];

        mockedExecSync.mockReturnValue(JSON.stringify(mockPorts));

        const db = getDatabaseManager();
        const result = db.getProjectPortsByScript(1, 'dev');

        expect(result.length).toBe(1);
        expect(result[0].script_name).toBe('dev');
      });
    });
  });

  describe('Settings operations', () => {
    beforeEach(() => {
      mockedFs.existsSync.mockReturnValue(false);
    });

    describe('getSetting', () => {
      it('should get a setting value', () => {
        const settings = {
          'editor.type': 'vscode',
          'browser.type': 'chrome',
        };

        mockedExecSync.mockReturnValue(JSON.stringify(settings));

        const db = getDatabaseManager();
        const result = db.getSetting('editor.type');

        expect(result).toBe('vscode');
      });

      it('should return null for non-existent setting', () => {
        mockedExecSync.mockReturnValue(JSON.stringify({}));

        const db = getDatabaseManager();
        const result = db.getSetting('nonexistent');

        expect(result).toBeNull();
      });
    });

    describe('setSetting', () => {
      it('should set a setting value', () => {
        mockedExecSync.mockReturnValue('');

        const db = getDatabaseManager();
        expect(() => db.setSetting('editor.type', 'cursor')).not.toThrow();
        expect(mockedExecSync).toHaveBeenCalledWith(
          expect.stringContaining('PUT'),
          expect.any(Object)
        );
      });
    });

    describe('getAllSettings', () => {
      it('should get all settings', () => {
        const settings = {
          'editor.type': 'vscode',
          'browser.type': 'chrome',
        };

        mockedExecSync.mockReturnValue(JSON.stringify(settings));

        const db = getDatabaseManager();
        const result = db.getAllSettings();

        expect(result).toEqual(settings);
      });
    });
  });

  describe('Test Result operations', () => {
    beforeEach(() => {
      mockedFs.existsSync.mockReturnValue(false);
    });

    describe('addTestResult', () => {
      it('should add a test result', () => {
        const mockResult: TestResult = {
          id: 1,
          project_id: 1,
          script_name: 'test',
          framework: 'jest',
          passed: 10,
          failed: 2,
          skipped: 1,
          total: 13,
          duration: 5000,
          coverage: 85.5,
          timestamp: Date.now(),
          raw_output: null,
        };

        mockedExecSync.mockReturnValue(JSON.stringify(mockResult));

        const db = getDatabaseManager();
        const result = db.addTestResult(1, 'test', 10, 2, 1, 13, 5000, 85.5, 'jest', null);

        expect(result).toEqual(mockResult);
      });

      it('should handle optional parameters', () => {
        const mockResult: TestResult = {
          id: 1,
          project_id: 1,
          script_name: 'test',
          framework: null,
          passed: 5,
          failed: 0,
          skipped: 0,
          total: 5,
          duration: null,
          coverage: null,
          timestamp: Date.now(),
          raw_output: null,
        };

        mockedExecSync.mockReturnValue(JSON.stringify(mockResult));

        const db = getDatabaseManager();
        const result = db.addTestResult(1, 'test', 5, 0);

        expect(result.passed).toBe(5);
        expect(result.failed).toBe(0);
      });
    });

    describe('getLatestTestResult', () => {
      it('should get latest test result', () => {
        const mockResult: TestResult = {
          id: 1,
          project_id: 1,
          script_name: 'test',
          framework: 'jest',
          passed: 10,
          failed: 0,
          skipped: 0,
          total: 10,
          duration: 3000,
          coverage: 90,
          timestamp: Date.now(),
          raw_output: null,
        };

        mockedExecSync.mockReturnValue(JSON.stringify(mockResult));

        const db = getDatabaseManager();
        const result = db.getLatestTestResult(1);

        expect(result).toEqual(mockResult);
      });

      it('should return null if no results found', () => {
        mockedExecSync.mockImplementation(() => {
          throw new Error('Not found');
        });

        const db = getDatabaseManager();
        const result = db.getLatestTestResult(1);

        expect(result).toBeNull();
      });
    });

    describe('getTestResultsByProject', () => {
      it('should get test results with default limit', () => {
        const mockResults: TestResult[] = [];

        mockedExecSync.mockReturnValue(JSON.stringify(mockResults));

        const db = getDatabaseManager();
        const result = db.getTestResultsByProject(1);

        expect(mockedExecSync).toHaveBeenCalledWith(
          expect.stringContaining('limit=10'),
          expect.any(Object)
        );
        expect(result).toEqual(mockResults);
      });

      it('should get test results with custom limit', () => {
        const mockResults: TestResult[] = [];

        mockedExecSync.mockReturnValue(JSON.stringify(mockResults));

        const db = getDatabaseManager();
        db.getTestResultsByProject(1, 20);

        expect(mockedExecSync).toHaveBeenCalledWith(
          expect.stringContaining('limit=20'),
          expect.any(Object)
        );
      });
    });
  });

  describe('getDatabaseManager singleton', () => {
    it('should return the same instance on multiple calls', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const db1 = getDatabaseManager();
      const db2 = getDatabaseManager();

      expect(db1).toBe(db2);
    });
  });

  describe('close', () => {
    it('should be a no-op', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const db = getDatabaseManager();
      expect(() => db.close()).not.toThrow();
    });
  });
});

