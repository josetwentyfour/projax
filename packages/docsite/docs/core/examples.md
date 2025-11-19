# Core Examples

Examples of using the core package directly in your code.

## Basic Usage

### Get All Projects

```typescript
import { getAllProjects } from '@projax/core';

const projects = getAllProjects();
console.log(`Found ${projects.length} projects`);
```

### Add a Project

```typescript
import { addProject } from '@projax/core';

const project = addProject('My Project', '/path/to/project');
console.log(`Added project with ID: ${project.id}`);
```

### Get Project Tests

```typescript
import { getTestsByProject } from '@projax/core';

const tests = getTestsByProject(1);
console.log(`Found ${tests.length} test files`);
```

## Database Manager Usage

### Direct Database Access

```typescript
import { getDatabaseManager } from '@projax/core';

const db = getDatabaseManager();

// Get a specific project
const project = db.getProject(1);
if (project) {
  console.log(`Project: ${project.name}`);
  
  // Get ports for the project
  const ports = db.getProjectPorts(project.id);
  console.log(`Ports: ${ports.map(p => p.port).join(', ')}`);
}
```

### Update Project

```typescript
const db = getDatabaseManager();

const updated = db.updateProject(1, {
  name: 'Updated Name',
  description: 'New description',
  tags: ['frontend', 'react']
});
```

### Manage Settings

```typescript
const db = getDatabaseManager();

// Set a setting
db.setSetting('theme', 'dark');

// Get a setting
const theme = db.getSetting('theme');
console.log(`Current theme: ${theme}`);
```

## Scanning Projects

### Scan a Project

```typescript
import { scanProject } from '@projax/core';

const result = scanProject(1);
console.log(`Found ${result.testsFound} tests`);
console.log(`Tests:`, result.tests);
```

## Error Handling

```typescript
import { addProject } from '@projax/core';

try {
  const project = addProject('My Project', '/path/to/project');
  console.log('Project added:', project);
} catch (error) {
  console.error('Failed to add project:', error);
}
```

## Related Documentation

- [API Reference](/docs/core/api-reference) - Complete API documentation
- [Database](/docs/core/database) - Database management

