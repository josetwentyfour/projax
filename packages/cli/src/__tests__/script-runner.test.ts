import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Configuration object for test data directory
const testConfig = { processDataDir: '' };

// Mock os module to support homedir mocking in Node 18
jest.mock('os', () => ({
  ...jest.requireActual('os'),
  homedir: jest.fn(() => testConfig.processDataDir || os.tmpdir()),
}));

// Mock the core-bridge module before importing script-runner
jest.mock('../core-bridge', () => ({
  loadCore: () => ({
    scanner: {
      scanProject: jest.fn(),
    },
    database: {
      JSONDatabase: jest.fn(),
    },
  }),
}));

import {
  detectProjectType,
  getProjectScripts,
  ProjectType,
  loadProcesses,
  removeProcess,
  getProjectProcesses,
  BackgroundProcess,
} from '../script-runner';

describe('Script Runner', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = path.join(os.tmpdir(), `projax-script-test-${Date.now()}`);
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('detectProjectType', () => {
    it('should detect Node.js project', () => {
      fs.writeFileSync(
        path.join(testDir, 'package.json'),
        JSON.stringify({ name: 'test' })
      );

      expect(detectProjectType(testDir)).toBe('node');
    });

    it('should detect Python project with pyproject.toml', () => {
      fs.writeFileSync(path.join(testDir, 'pyproject.toml'), '[project]\nname = "test"');

      expect(detectProjectType(testDir)).toBe('python');
    });

    it('should detect Rust project', () => {
      fs.writeFileSync(path.join(testDir, 'Cargo.toml'), '[package]\nname = "test"');

      expect(detectProjectType(testDir)).toBe('rust');
    });

    it('should detect Go project', () => {
      fs.writeFileSync(path.join(testDir, 'go.mod'), 'module test');

      expect(detectProjectType(testDir)).toBe('go');
    });

    it('should detect Makefile project', () => {
      fs.writeFileSync(path.join(testDir, 'Makefile'), 'all:\n\techo "test"');

      expect(detectProjectType(testDir)).toBe('makefile');
    });

    it('should detect makefile (lowercase)', () => {
      fs.writeFileSync(path.join(testDir, 'makefile'), 'all:\n\techo "test"');

      expect(detectProjectType(testDir)).toBe('makefile');
    });

    it('should return unknown for unrecognized project', () => {
      expect(detectProjectType(testDir)).toBe('unknown');
    });

    it('should prioritize package.json over other markers', () => {
      fs.writeFileSync(path.join(testDir, 'package.json'), '{}');
      fs.writeFileSync(path.join(testDir, 'Makefile'), 'all:');

      expect(detectProjectType(testDir)).toBe('node');
    });
  });

  describe('getProjectScripts - Node.js', () => {
    it('should parse scripts from package.json', () => {
      const packageJson = {
        name: 'test-project',
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          test: 'jest',
        },
      };
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify(packageJson));

      const result = getProjectScripts(testDir);

      expect(result.type).toBe('node');
      expect(result.scripts.size).toBe(4);
      expect(result.scripts.get('dev')).toMatchObject({
        name: 'dev',
        command: 'next dev',
        runner: 'npm',
        projectType: 'node',
      });
    });

    it('should handle empty scripts object', () => {
      const packageJson = {
        name: 'test-project',
        scripts: {},
      };
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify(packageJson));

      const result = getProjectScripts(testDir);

      expect(result.type).toBe('node');
      expect(result.scripts.size).toBe(0);
    });

    it('should handle missing scripts field', () => {
      const packageJson = {
        name: 'test-project',
      };
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify(packageJson));

      const result = getProjectScripts(testDir);

      expect(result.type).toBe('node');
      expect(result.scripts.size).toBe(0);
    });

    it('should skip non-string script values', () => {
      const packageJson = {
        scripts: {
          valid: 'echo "test"',
          invalid: { nested: 'object' },
        },
      };
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify(packageJson));

      const result = getProjectScripts(testDir);

      expect(result.scripts.size).toBe(1);
      expect(result.scripts.has('valid')).toBe(true);
      expect(result.scripts.has('invalid')).toBe(false);
    });

    it('should handle malformed package.json', () => {
      fs.writeFileSync(path.join(testDir, 'package.json'), 'invalid json {{{');

      const result = getProjectScripts(testDir);

      expect(result.scripts.size).toBe(0);
    });
  });

  describe('getProjectScripts - Python', () => {
    it('should parse scripts from pyproject.toml [project.scripts]', () => {
      const pyproject = `
[project.scripts]
serve = "myapp:main"
cli = "myapp.cli:run"
      `;
      fs.writeFileSync(path.join(testDir, 'pyproject.toml'), pyproject);

      const result = getProjectScripts(testDir);

      expect(result.type).toBe('python');
      expect(result.scripts.size).toBe(2);
      expect(result.scripts.get('serve')).toMatchObject({
        name: 'serve',
        command: 'myapp:main',
        runner: 'python',
        projectType: 'python',
      });
    });

    it('should parse scripts from pyproject.toml [tool.poetry.scripts]', () => {
      const pyproject = `
[tool.poetry.scripts]
myapp = "myapp:main"
cli = "myapp.cli:run"
      `;
      fs.writeFileSync(path.join(testDir, 'pyproject.toml'), pyproject);

      const result = getProjectScripts(testDir);

      expect(result.type).toBe('python');
      expect(result.scripts.size).toBe(2);
      expect(result.scripts.get('myapp')).toMatchObject({
        name: 'myapp',
        command: 'myapp:main',
        runner: 'poetry',
        projectType: 'python',
      });
    });

    it('should handle both project and poetry scripts', () => {
      const pyproject = `
[project.scripts]
app = "app:main"

[tool.poetry.scripts]
cli = "app.cli:run"
      `;
      fs.writeFileSync(path.join(testDir, 'pyproject.toml'), pyproject);

      const result = getProjectScripts(testDir);

      expect(result.scripts.size).toBe(2);
    });

    it('should handle empty pyproject.toml', () => {
      fs.writeFileSync(path.join(testDir, 'pyproject.toml'), '');

      const result = getProjectScripts(testDir);

      expect(result.scripts.size).toBe(0);
    });
  });

  describe('getProjectScripts - Rust', () => {
    it('should provide common cargo commands', () => {
      fs.writeFileSync(path.join(testDir, 'Cargo.toml'), '[package]\nname = "test"');

      const result = getProjectScripts(testDir);

      expect(result.type).toBe('rust');
      expect(result.scripts.size).toBeGreaterThan(0);
      expect(result.scripts.get('build')).toMatchObject({
        name: 'build',
        command: 'cargo build',
        runner: 'cargo',
        projectType: 'rust',
      });
      expect(result.scripts.get('run')).toBeDefined();
      expect(result.scripts.get('test')).toBeDefined();
      expect(result.scripts.get('check')).toBeDefined();
      expect(result.scripts.get('clippy')).toBeDefined();
      expect(result.scripts.get('fmt')).toBeDefined();
    });
  });

  describe('getProjectScripts - Go', () => {
    it('should provide common go commands when no Makefile', () => {
      fs.writeFileSync(path.join(testDir, 'go.mod'), 'module test');

      const result = getProjectScripts(testDir);

      expect(result.type).toBe('go');
      expect(result.scripts.get('run')).toMatchObject({
        command: 'go run .',
        runner: 'go',
        projectType: 'go',
      });
      expect(result.scripts.get('build')).toBeDefined();
      expect(result.scripts.get('test')).toBeDefined();
    });

    it('should use Makefile commands if available', () => {
      fs.writeFileSync(path.join(testDir, 'go.mod'), 'module test');
      fs.writeFileSync(
        path.join(testDir, 'Makefile'),
        'build:\n\tgo build\n\ntest:\n\tgo test'
      );

      const result = getProjectScripts(testDir);

      expect(result.type).toBe('go');
      expect(result.scripts.get('build')).toMatchObject({
        command: 'make build',
        runner: 'make',
      });
    });
  });

  describe('getProjectScripts - Makefile', () => {
    it('should parse Makefile targets', () => {
      const makefile = `
build:
\tgcc -o app main.c

test:
\t./app test

clean:
\trm -f app
      `;
      fs.writeFileSync(path.join(testDir, 'Makefile'), makefile);

      const result = getProjectScripts(testDir);

      expect(result.type).toBe('makefile');
      expect(result.scripts.size).toBe(3);
      expect(result.scripts.get('build')).toMatchObject({
        name: 'build',
        command: 'make build',
        runner: 'make',
        projectType: 'makefile',
      });
      expect(result.scripts.has('test')).toBe(true);
      expect(result.scripts.has('clean')).toBe(true);
    });

    it('should skip special targets like .PHONY', () => {
      const makefile = `
.PHONY: all clean

all:
\techo "all"

clean:
\trm -rf build
      `;
      fs.writeFileSync(path.join(testDir, 'Makefile'), makefile);

      const result = getProjectScripts(testDir);

      expect(result.scripts.has('.PHONY')).toBe(false);
      expect(result.scripts.has('all')).toBe(true);
      expect(result.scripts.has('clean')).toBe(true);
    });

    it('should skip targets starting with dot', () => {
      const makefile = `
.internal:
\techo "internal"

public:
\techo "public"
      `;
      fs.writeFileSync(path.join(testDir, 'Makefile'), makefile);

      const result = getProjectScripts(testDir);

      expect(result.scripts.has('.internal')).toBe(false);
      expect(result.scripts.has('public')).toBe(true);
    });

    it('should handle targets with dependencies', () => {
      const makefile = `
all: build test

build:
\techo "build"

test: build
\techo "test"
      `;
      fs.writeFileSync(path.join(testDir, 'Makefile'), makefile);

      const result = getProjectScripts(testDir);

      expect(result.scripts.size).toBe(3);
      expect(result.scripts.has('all')).toBe(true);
      expect(result.scripts.has('build')).toBe(true);
      expect(result.scripts.has('test')).toBe(true);
    });
  });

  describe('getProjectScripts - Unknown', () => {
    it('should check for Makefile as fallback', () => {
      fs.writeFileSync(path.join(testDir, 'Makefile'), 'test:\n\techo "test"');

      const result = getProjectScripts(testDir);

      // When Makefile exists, type is 'makefile', not 'unknown'
      expect(result.type).toBe('makefile');
      expect(result.scripts.size).toBe(1);
      expect(result.scripts.get('test')).toBeDefined();
    });

    it('should return empty scripts for truly unknown projects', () => {
      const result = getProjectScripts(testDir);

      expect(result.type).toBe('unknown');
      expect(result.scripts.size).toBe(0);
    });
  });

  describe('Process Tracking', () => {
    let testDataDir: string;

    beforeEach(() => {
      const uniqueId = `${Date.now()}-${process.hrtime.bigint()}-${Math.random().toString(36).substring(7)}`;
      testDataDir = path.join(os.tmpdir(), `projax-process-test-${uniqueId}`);
      testConfig.processDataDir = testDataDir;
      
      if (fs.existsSync(testDataDir)) {
        fs.rmSync(testDataDir, { recursive: true, force: true });
      }
      fs.mkdirSync(testDataDir, { recursive: true });
    });

    afterEach(() => {
      if (fs.existsSync(testDataDir)) {
        fs.rmSync(testDataDir, { recursive: true, force: true });
      }
    });

    describe('loadProcesses', () => {
      it('should return empty array when no processes file exists', () => {
        const processes = loadProcesses();
        expect(processes).toEqual([]);
      });

      it('should load processes from file', () => {
        const processesDir = path.join(testDataDir, '.projax');
        fs.mkdirSync(processesDir, { recursive: true });

        const mockProcesses: BackgroundProcess[] = [
          {
            pid: 1234,
            projectPath: '/test/path',
            projectName: 'Test Project',
            scriptName: 'dev',
            command: 'npm run dev',
            startedAt: Date.now(),
            logFile: '/tmp/log.txt',
          },
        ];

        fs.writeFileSync(
          path.join(processesDir, 'processes.json'),
          JSON.stringify(mockProcesses)
        );

        const processes = loadProcesses();
        expect(processes).toHaveLength(1);
        expect(processes[0].pid).toBe(1234);
      });

      it('should return empty array for corrupted file', () => {
        const processesDir = path.join(testDataDir, '.projax');
        fs.mkdirSync(processesDir, { recursive: true });
        fs.writeFileSync(path.join(processesDir, 'processes.json'), 'invalid json');

        const processes = loadProcesses();
        expect(processes).toEqual([]);
      });
    });

    describe('removeProcess', () => {
      it('should remove a process by PID', () => {
        const processesDir = path.join(testDataDir, '.projax');
        fs.mkdirSync(processesDir, { recursive: true });

        const mockProcesses: BackgroundProcess[] = [
          {
            pid: 1234,
            projectPath: '/test/1',
            projectName: 'Project 1',
            scriptName: 'dev',
            command: 'npm run dev',
            startedAt: Date.now(),
            logFile: '/tmp/log1.txt',
          },
          {
            pid: 5678,
            projectPath: '/test/2',
            projectName: 'Project 2',
            scriptName: 'start',
            command: 'npm start',
            startedAt: Date.now(),
            logFile: '/tmp/log2.txt',
          },
        ];

        fs.writeFileSync(
          path.join(processesDir, 'processes.json'),
          JSON.stringify(mockProcesses)
        );

        removeProcess(1234);

        const remaining = loadProcesses();
        expect(remaining).toHaveLength(1);
        expect(remaining[0].pid).toBe(5678);
      });

      it('should handle removing non-existent PID gracefully', () => {
        const processesDir = path.join(testDataDir, '.projax');
        fs.mkdirSync(processesDir, { recursive: true });

        const mockProcesses: BackgroundProcess[] = [
          {
            pid: 1234,
            projectPath: '/test',
            projectName: 'Project',
            scriptName: 'dev',
            command: 'npm run dev',
            startedAt: Date.now(),
            logFile: '/tmp/log.txt',
          },
        ];

        fs.writeFileSync(
          path.join(processesDir, 'processes.json'),
          JSON.stringify(mockProcesses)
        );

        removeProcess(9999);

        const remaining = loadProcesses();
        expect(remaining).toHaveLength(1);
      });
    });

    describe('getProjectProcesses', () => {
      it('should return processes for a specific project', () => {
        const processesDir = path.join(testDataDir, '.projax');
        fs.mkdirSync(processesDir, { recursive: true });

        const mockProcesses: BackgroundProcess[] = [
          {
            pid: 1234,
            projectPath: '/test/project1',
            projectName: 'Project 1',
            scriptName: 'dev',
            command: 'npm run dev',
            startedAt: Date.now(),
            logFile: '/tmp/log1.txt',
          },
          {
            pid: 5678,
            projectPath: '/test/project2',
            projectName: 'Project 2',
            scriptName: 'start',
            command: 'npm start',
            startedAt: Date.now(),
            logFile: '/tmp/log2.txt',
          },
          {
            pid: 9012,
            projectPath: '/test/project1',
            projectName: 'Project 1',
            scriptName: 'test',
            command: 'npm test',
            startedAt: Date.now(),
            logFile: '/tmp/log3.txt',
          },
        ];

        fs.writeFileSync(
          path.join(processesDir, 'processes.json'),
          JSON.stringify(mockProcesses)
        );

        const project1Processes = getProjectProcesses('/test/project1');
        expect(project1Processes).toHaveLength(2);
        expect(project1Processes.map(p => p.pid)).toEqual([1234, 9012]);

        const project2Processes = getProjectProcesses('/test/project2');
        expect(project2Processes).toHaveLength(1);
        expect(project2Processes[0].pid).toBe(5678);
      });

      it('should return empty array when no processes for project', () => {
        const processes = getProjectProcesses('/non/existent');
        expect(processes).toEqual([]);
      });
    });
  });
});

