# Data Models

Complete reference for all data models used by the API.

## Project

Represents a tracked project.

```typescript
interface Project {
  id: number;                    // Unique project ID
  name: string;                  // Project name
  path: string;                  // Absolute path to project directory
  description: string | null;   // Optional description
  framework: string | null;      // Detected framework (e.g., "react", "vue")
  last_scanned: number | null;  // Timestamp of last scan (Unix timestamp)
  created_at: number;            // Creation timestamp (Unix timestamp)
  tags?: string[];               // Optional tags array
}
```

**Example:**
```json
{
  "id": 1,
  "name": "My Project",
  "path": "/Users/username/projects/my-project",
  "description": "A cool project",
  "framework": "react",
  "last_scanned": 1704110400000,
  "created_at": 1704024000000,
  "tags": ["frontend", "react"]
}
```

## Test

Represents a test file detected in a project.

```typescript
interface Test {
  id: number;                    // Unique test ID
  project_id: number;            // Associated project ID
  file_path: string;             // Relative path to test file
  framework: string | null;      // Test framework (e.g., "jest", "vitest")
  status: string | null;         // Test status (e.g., "passed", "failed")
  last_run: number | null;       // Timestamp of last test run
  created_at: number;            // Creation timestamp
}
```

**Example:**
```json
{
  "id": 1,
  "project_id": 1,
  "file_path": "src/components/Button.test.tsx",
  "framework": "jest",
  "status": null,
  "last_run": null,
  "created_at": 1704024000000
}
```

## ProjectPort

Represents a port detected for a project.

```typescript
interface ProjectPort {
  id: number;                    // Unique port record ID
  project_id: number;            // Associated project ID
  port: number;                  // Port number
  script_name: string | null;    // Script name that uses this port
  config_source: string;        // Source file where port was detected
  last_detected: number;         // Timestamp of last detection
  created_at: number;            // Creation timestamp
}
```

**Example:**
```json
{
  "id": 1,
  "project_id": 1,
  "port": 3000,
  "script_name": "dev",
  "config_source": "vite.config.ts",
  "last_detected": 1704110400000,
  "created_at": 1704024000000
}
```

## JenkinsJob

Represents a Jenkins job associated with a project (future feature).

```typescript
interface JenkinsJob {
  id: number;                    // Unique job record ID
  project_id: number;            // Associated project ID
  job_name: string;              // Jenkins job name
  job_url: string;               // Jenkins job URL
  last_build_status: string | null;  // Last build status
  last_build_number: number | null; // Last build number
  last_updated: number | null;  // Last update timestamp
  created_at: number;            // Creation timestamp
}
```

## Setting

Represents a user setting.

```typescript
interface Setting {
  key: string;                   // Setting key
  value: string;                 // Setting value
  updated_at: number;            // Last update timestamp
}
```

**Example:**
```json
{
  "key": "theme",
  "value": "dark",
  "updated_at": 1704110400000
}
```

## Database Schema

The complete database structure:

```typescript
interface DatabaseSchema {
  projects: Project[];
  tests: Test[];
  jenkins_jobs: JenkinsJob[];
  project_ports: ProjectPort[];
  settings: Setting[];
}
```

## Timestamps

All timestamps are Unix timestamps in milliseconds (number of milliseconds since January 1, 1970 UTC).

Convert to JavaScript Date:
```javascript
const date = new Date(timestamp);
```

Convert from JavaScript Date:
```javascript
const timestamp = date.getTime();
```

## Related Documentation

- [Endpoints](/docs/api/endpoints) - API endpoint reference
- [Database](/docs/api/database) - Database management and migration

