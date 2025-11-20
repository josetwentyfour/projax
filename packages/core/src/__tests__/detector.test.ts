import * as fs from 'fs';
import * as path from 'path';
import {
  detectTestFramework,
  isTestFile,
  detectProjectFramework,
  FRAMEWORKS,
} from '../detector';

// Mock fs module
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('detector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('detectTestFramework', () => {
    const projectPath = '/fake/project';
    const packageJsonPath = path.join(projectPath, 'package.json');

    it('should detect jest from dependencies', () => {
      const packageJson = {
        devDependencies: {
          jest: '^29.0.0',
        },
      };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(packageJson));

      const result = detectTestFramework(projectPath);
      expect(result).toBe('jest');
    });

    it('should detect vitest from dependencies', () => {
      const packageJson = {
        devDependencies: {
          vitest: '^1.0.0',
        },
      };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(packageJson));

      const result = detectTestFramework(projectPath);
      expect(result).toBe('vitest');
    });

    it('should detect mocha from dependencies', () => {
      const packageJson = {
        devDependencies: {
          mocha: '^10.0.0',
        },
      };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(packageJson));

      const result = detectTestFramework(projectPath);
      expect(result).toBe('mocha');
    });

    it('should detect jest from jest config in package.json', () => {
      const packageJson = {
        jest: {
          preset: 'ts-jest',
        },
      };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(packageJson));

      const result = detectTestFramework(projectPath);
      expect(result).toBe('jest');
    });

    it('should detect jest from test script', () => {
      const packageJson = {
        scripts: {
          test: 'jest',
        },
      };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(packageJson));

      const result = detectTestFramework(projectPath);
      expect(result).toBe('jest');
    });

    it('should detect framework from config files', () => {
      const packageJson = {};

      mockedFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        const pathStr = filePath.toString();
        if (pathStr === packageJsonPath) return true;
        if (pathStr === path.join(projectPath, 'jest.config.js')) return true;
        return false;
      });
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(packageJson));

      const result = detectTestFramework(projectPath);
      expect(result).toBe('jest');
    });

    it('should return null if no framework is detected', () => {
      mockedFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        const pathStr = filePath.toString();
        return pathStr === packageJsonPath;
      });
      mockedFs.readFileSync.mockReturnValue(JSON.stringify({}));

      const result = detectTestFramework(projectPath);
      expect(result).toBeNull();
    });

    it('should handle missing package.json', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const result = detectTestFramework(projectPath);
      expect(result).toBeNull();
    });

    it('should handle invalid JSON in package.json', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue('invalid json');

      const result = detectTestFramework(projectPath);
      expect(result).toBeNull();
    });
  });

  describe('isTestFile', () => {
    it('should detect test files with .test.ts extension', () => {
      expect(isTestFile('/path/to/file.test.ts')).toBe(true);
    });

    it('should detect test files with .spec.ts extension', () => {
      expect(isTestFile('/path/to/file.spec.ts')).toBe(true);
    });

    it('should detect test files with .test.js extension', () => {
      expect(isTestFile('/path/to/file.test.js')).toBe(true);
    });

    it('should detect test files with .spec.jsx extension', () => {
      expect(isTestFile('/path/to/file.spec.jsx')).toBe(true);
    });

    it('should detect files in __tests__ directory', () => {
      expect(isTestFile('/path/to/__tests__/mytest.ts')).toBe(true);
    });

    it('should detect files in test directory (mocha pattern)', () => {
      expect(isTestFile('/path/to/test/mytest.ts')).toBe(true);
    });

    it('should not detect regular files', () => {
      expect(isTestFile('/path/to/regular.ts')).toBe(false);
    });

    it('should not detect files in non-test directories', () => {
      expect(isTestFile('/path/to/src/component.tsx')).toBe(false);
    });

    it('should detect test files when framework is specified', () => {
      expect(isTestFile('/path/to/file.test.ts', 'jest')).toBe(true);
    });

    it('should detect files in framework-specific test directories', () => {
      expect(isTestFile('/path/to/__tests__/file.ts', 'jest')).toBe(true);
    });

    it('should handle files with uppercase extensions', () => {
      expect(isTestFile('/path/to/FILE.TEST.TS')).toBe(true);
    });
  });

  describe('detectProjectFramework', () => {
    const projectPath = '/fake/project';
    const packageJsonPath = path.join(projectPath, 'package.json');

    it('should detect Next.js projects', () => {
      const packageJson = {
        dependencies: {
          next: '^14.0.0',
        },
      };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(packageJson));

      const result = detectProjectFramework(projectPath);
      expect(result).toBe('next.js');
    });

    it('should detect React projects', () => {
      const packageJson = {
        dependencies: {
          react: '^18.0.0',
          'react-dom': '^18.0.0',
        },
      };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(packageJson));

      const result = detectProjectFramework(projectPath);
      expect(result).toBe('react');
    });

    it('should detect Vue projects', () => {
      const packageJson = {
        dependencies: {
          vue: '^3.0.0',
        },
      };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(packageJson));

      const result = detectProjectFramework(projectPath);
      expect(result).toBe('vue 3');
    });

    it('should detect Angular projects', () => {
      const packageJson = {
        dependencies: {
          '@angular/core': '^17.0.0',
        },
      };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(packageJson));

      const result = detectProjectFramework(projectPath);
      expect(result).toBe('angular');
    });

    it('should detect Express projects', () => {
      const packageJson = {
        dependencies: {
          express: '^4.18.0',
        },
      };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(packageJson));

      const result = detectProjectFramework(projectPath);
      expect(result).toBe('express');
    });

    it('should detect NestJS projects', () => {
      const packageJson = {
        dependencies: {
          '@nestjs/core': '^10.0.0',
        },
      };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(packageJson));

      const result = detectProjectFramework(projectPath);
      expect(result).toBe('nest.js');
    });

    it('should detect Electron projects', () => {
      const packageJson = {
        devDependencies: {
          electron: '^28.0.0',
        },
      };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(packageJson));

      const result = detectProjectFramework(projectPath);
      expect(result).toBe('electron');
    });

    it('should detect React Native projects before React', () => {
      const packageJson = {
        dependencies: {
          react: '^18.0.0',
          'react-native': '^0.72.0',
        },
      };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(packageJson));

      const result = detectProjectFramework(projectPath);
      expect(result).toBe('react-native');
    });

    it('should detect Rust projects without package.json', () => {
      mockedFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        const pathStr = filePath.toString();
        if (pathStr === packageJsonPath) return false;
        if (pathStr === path.join(projectPath, 'Cargo.toml')) return true;
        return false;
      });

      const result = detectProjectFramework(projectPath);
      expect(result).toBe('rust');
    });

    it('should detect Go projects without package.json', () => {
      mockedFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        const pathStr = filePath.toString();
        if (pathStr === packageJsonPath) return false;
        if (pathStr === path.join(projectPath, 'go.mod')) return true;
        return false;
      });

      const result = detectProjectFramework(projectPath);
      expect(result).toBe('go');
    });

    it('should detect Python projects without package.json', () => {
      mockedFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        const pathStr = filePath.toString();
        if (pathStr === packageJsonPath) return false;
        if (pathStr === path.join(projectPath, 'requirements.txt')) return true;
        return false;
      });

      const result = detectProjectFramework(projectPath);
      expect(result).toBe('python');
    });

    it('should return node.js as fallback for projects with package.json', () => {
      const packageJson = {
        dependencies: {},
      };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(packageJson));

      const result = detectProjectFramework(projectPath);
      expect(result).toBe('node.js');
    });

    it('should return null if no indicators are found', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const result = detectProjectFramework(projectPath);
      expect(result).toBeNull();
    });

    it('should handle invalid JSON in package.json', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue('invalid json');

      const result = detectProjectFramework(projectPath);
      expect(result).toBeNull();
    });

    it('should prioritize Next.js over React', () => {
      const packageJson = {
        dependencies: {
          next: '^14.0.0',
          react: '^18.0.0',
        },
      };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(packageJson));

      const result = detectProjectFramework(projectPath);
      expect(result).toBe('next.js');
    });

    it('should detect Vite projects', () => {
      const packageJson = {
        devDependencies: {
          vite: '^5.0.0',
        },
      };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(packageJson));

      const result = detectProjectFramework(projectPath);
      expect(result).toBe('vite');
    });
  });

  describe('FRAMEWORKS constant', () => {
    it('should contain jest framework definition', () => {
      const jest = FRAMEWORKS.find(f => f.name === 'jest');
      expect(jest).toBeDefined();
      expect(jest?.configFiles).toContain('jest.config.js');
      expect(jest?.testDirs).toContain('__tests__');
    });

    it('should contain vitest framework definition', () => {
      const vitest = FRAMEWORKS.find(f => f.name === 'vitest');
      expect(vitest).toBeDefined();
      expect(vitest?.configFiles).toContain('vitest.config.ts');
    });

    it('should contain mocha framework definition', () => {
      const mocha = FRAMEWORKS.find(f => f.name === 'mocha');
      expect(mocha).toBeDefined();
      expect(mocha?.testDirs).toContain('test');
    });

    it('should have test patterns for all frameworks', () => {
      FRAMEWORKS.forEach(framework => {
        expect(framework.testPatterns.length).toBeGreaterThan(0);
      });
    });
  });
});

