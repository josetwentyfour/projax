# Core API Reference

Complete reference for all exported functions and types from `@projax/core`.

## Database Functions

### `getDatabaseManager()`

Get the database manager instance.

```typescript
import { getDatabaseManager } from '@projax/core';

const db = getDatabaseManager();
```

### `getAllProjects(): Project[]`

Get all projects from the database.

```typescript
import { getAllProjects } from '@projax/core';

const projects = getAllProjects();
```

### `addProject(name: string, projectPath: string): Project`

Add a new project to the database.

```typescript
import { addProject } from '@projax/core';

const project = addProject('My Project', '/path/to/project');
```

### `removeProject(id: number): void`

Remove a project from the database.

```typescript
import { removeProject } from '@projax/core';

removeProject(1);
```

### `getTestsByProject(projectId: number): Test[]`

Get all tests for a project.

```typescript
import { getTestsByProject } from '@projax/core';

const tests = getTestsByProject(1);
```

## Convenience Functions

These are re-exported from the main index for convenience:

```typescript
import {
  getAllProjects,
  addProject,
  removeProject,
  getTestsByProject,
} from '@projax/core';
```

## Database Manager Methods

When using `getDatabaseManager()`, you have access to:

- `getAllProjects(): Project[]`
- `getProject(id: number): Project | null`
- `getProjectByPath(path: string): Project | null`
- `addProject(name: string, path: string): Project`
- `updateProject(id: number, updates: Partial<Project>): Project`
- `removeProject(id: number): void`
- `getAllTests(): Test[]`
- `getTestsByProject(projectId: number): Test[]`
- `addTest(projectId: number, filePath: string, framework: string | null): Test`
- `removeTest(id: number): void`
- `getAllSettings(): Record<string, string>`
- `getSetting(key: string): string | null`
- `setSetting(key: string, value: string): void`
- `getProjectPorts(projectId: number): ProjectPort[]`
- `addProjectPort(projectId: number, port: number, scriptName: string | null, configSource: string): ProjectPort`

## Types

### Project

```typescript
interface Project {
  id: number;
  name: string;
  path: string;
  description: string | null;
  framework: string | null;
  last_scanned: number | null;
  created_at: number;
  tags?: string[];
}
```

### Test

```typescript
interface Test {
  id: number;
  project_id: number;
  file_path: string;
  framework: string | null;
  status: string | null;
  last_run: number | null;
  created_at: number;
}
```

### ProjectPort

```typescript
interface ProjectPort {
  id: number;
  project_id: number;
  port: number;
  script_name: string | null;
  config_source: string;
  last_detected: number;
  created_at: number;
}
```

## Example Usage

```typescript
import {
  getAllProjects,
  addProject,
  getTestsByProject,
  getDatabaseManager,
} from '@projax/core';

// Get all projects
const projects = getAllProjects();

// Add a new project
const newProject = addProject('My Project', '/path/to/project');

// Get tests for a project
const tests = getTestsByProject(newProject.id);

// Use database manager directly
const db = getDatabaseManager();
const project = db.getProject(1);
if (project) {
  const ports = db.getProjectPorts(project.id);
}
```

## Related Documentation

- [Database](/docs/core/database) - Database management details
- [Test Detection](/docs/core/test-detection) - Test framework detection
- [Port Scanning](/docs/core/port-scanning) - Port extraction utilities

