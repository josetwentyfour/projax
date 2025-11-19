import * as fs from 'fs';
import * as path from 'path';

export interface TestFramework {
  name: string;
  configFiles: string[];
  testPatterns: RegExp[];
  testDirs: string[];
}

export const FRAMEWORKS: TestFramework[] = [
  {
    name: 'jest',
    configFiles: ['jest.config.js', 'jest.config.ts', 'jest.config.json', 'jest.config.mjs', 'jest.config.cjs'],
    testPatterns: [
      /\.test\.(js|ts|jsx|tsx)$/i,
      /\.spec\.(js|ts|jsx|tsx)$/i,
    ],
    testDirs: ['__tests__', '__test__'],
  },
  {
    name: 'vitest',
    configFiles: ['vitest.config.ts', 'vitest.config.js', 'vitest.config.mjs'],
    testPatterns: [
      /\.test\.(js|ts|jsx|tsx)$/i,
      /\.spec\.(js|ts|jsx|tsx)$/i,
    ],
    testDirs: ['__tests__'],
  },
  {
    name: 'mocha',
    configFiles: ['.mocharc.js', '.mocharc.json', '.mocharc.yaml', '.mocharc.yml', 'mocha.opts'],
    testPatterns: [
      /\.test\.(js|ts|jsx|tsx)$/i,
      /\.spec\.(js|ts|jsx|tsx)$/i,
    ],
    testDirs: ['test', 'tests'],
  },
];

export function detectTestFramework(projectPath: string): string | null {
  const packageJsonPath = path.join(projectPath, 'package.json');
  
  // Check package.json for test scripts and dependencies
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      // Check dependencies and devDependencies
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (deps.jest) return 'jest';
      if (deps.vitest) return 'vitest';
      if (deps.mocha) return 'mocha';
      
      // Check for jest config in package.json
      if (packageJson.jest) return 'jest';
      
      // Check test scripts
      if (packageJson.scripts) {
        const testScript = packageJson.scripts.test || '';
        if (testScript.includes('jest')) return 'jest';
        if (testScript.includes('vitest')) return 'vitest';
        if (testScript.includes('mocha')) return 'mocha';
      }
    } catch (error) {
      // Invalid JSON, continue with file-based detection
    }
  }
  
  // Check for config files
  for (const framework of FRAMEWORKS) {
    for (const configFile of framework.configFiles) {
      const configPath = path.join(projectPath, configFile);
      if (fs.existsSync(configPath)) {
        return framework.name;
      }
    }
  }
  
  return null;
}

export function isTestFile(filePath: string, detectedFramework: string | null = null): boolean {
  const fileName = path.basename(filePath);
  const dirName = path.dirname(filePath);
  const parentDirName = path.basename(dirName);
  
  // If framework is detected, use its specific patterns
  if (detectedFramework) {
    const framework = FRAMEWORKS.find(f => f.name === detectedFramework);
    if (framework) {
      // Check test patterns
      for (const pattern of framework.testPatterns) {
        if (pattern.test(fileName)) {
          return true;
        }
      }
      
      // Check test directories
      for (const testDir of framework.testDirs) {
        if (parentDirName === testDir) {
          return true;
        }
      }
    }
  }
  
  // Fallback: check all common patterns
  for (const framework of FRAMEWORKS) {
    for (const pattern of framework.testPatterns) {
      if (pattern.test(fileName)) {
        return true;
      }
    }
    
    for (const testDir of framework.testDirs) {
      if (parentDirName === testDir) {
        return true;
      }
    }
  }
  
  return false;
}

