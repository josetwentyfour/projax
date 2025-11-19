# Test Detection

The core package includes test framework detection and file scanning capabilities.

## Supported Frameworks

- **Jest**: `*.test.js`, `*.test.ts`, `*.spec.js`, `*.spec.ts`, `__tests__/` directories
- **Vitest**: Same patterns as Jest
- **Mocha**: `*.test.js`, `*.spec.js`, `test/` directories

## Detection Methods

### 1. Configuration Files

The detector looks for framework configuration files:
- `jest.config.js`, `jest.config.ts`, `jest.config.json`
- `vitest.config.ts`, `vitest.config.js`
- `.mocharc.js`, `.mocharc.json`, `mocha.opts`

### 2. Package.json Dependencies

Checks `package.json` for framework dependencies:
- `jest` in dependencies or devDependencies
- `vitest` in dependencies or devDependencies
- `mocha` in dependencies or devDependencies

### 3. Test Scripts

Analyzes test scripts in `package.json`:
- Scripts containing "jest", "vitest", or "mocha"
- Test command patterns

### 4. File Patterns

Scans for test files matching patterns:
- `*.test.js`, `*.test.ts`
- `*.spec.js`, `*.spec.ts`
- Files in `__tests__/` directories
- Files in `test/` directories

## Usage

Test detection is typically used through the scanner service:

```typescript
import { scanProject } from '@projax/core';

const result = scanProject(projectId);
// Returns: { project, testsFound, tests }
```

## Scanner Service

The scanner service provides:

- `scanProject(projectId: number)`: Scan a single project
- `scanAllProjects()`: Scan all projects

Both functions:
- Detect test frameworks
- Find test files
- Update database with findings
- Return scan results

## Framework Detection

The detector identifies frameworks in this order:
1. Configuration files
2. Package.json dependencies
3. Test script patterns
4. File patterns (fallback)

## Related Documentation

- [API Reference](/docs/core/api-reference) - Scanner functions
- [CLI Scan Command](/docs/cli/commands/scan) - Using scan from CLI

