# @projax/api

REST API server for the projax project management dashboard.

## Overview

This package provides a RESTful API server that manages project data using a JSON database (lowdb). It replaces the previous SQLite-based storage system and provides a centralized API for all projax operations.

## Features

- RESTful API with Express
- JSON database using lowdb
- Automatic migration from SQLite to JSON
- Port availability checking (tries ports 38124-38133)
- CORS enabled for cross-origin requests

## Installation

```bash
npm install
npm run build
```

## Development

```bash
npm run dev
```

This will start the API server in development mode with hot reload.

## API Endpoints

### Health Check

- **GET** `/health` - Check API server status
  - Returns: `{ status: 'ok', timestamp: string }`

### Projects

- **GET** `/api/projects` - List all projects
  - Returns: `Project[]`

- **POST** `/api/projects` - Add a new project
  - Body: `{ name: string, path: string }`
  - Returns: `Project`

- **GET** `/api/projects/:id` - Get project details
  - Returns: `Project`

- **PUT** `/api/projects/:id` - Update project
  - Body: `{ name: string }`
  - Returns: `Project`

- **DELETE** `/api/projects/:id` - Remove project
  - Returns: `204 No Content`

- **GET** `/api/projects/:id/tests` - Get tests for project
  - Returns: `Test[]`

- **GET** `/api/projects/:id/ports` - Get project ports
  - Returns: `ProjectPort[]`

- **POST** `/api/projects/:id/scan` - Scan project for tests
  - Returns: `{ project: Project, testsFound: number, tests: Test[] }`

- **POST** `/api/projects/scan/all` - Scan all projects
  - Returns: `Array<{ project: Project, testsFound: number, tests: Test[] }>`

### Settings

- **GET** `/api/settings` - Get all settings
  - Returns: `Record<string, string>`

- **PUT** `/api/settings/:key` - Update a setting
  - Body: `{ value: string }`
  - Returns: `{ key: string, value: string }`

## Data Models

### Project

```typescript
interface Project {
  id: number;
  name: string;
  path: string;
  last_scanned: number | null;
  created_at: number;
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

## Database

The API uses a JSON database stored at `~/.projax/data.json`. The database schema includes:

- `projects`: Array of Project objects
- `tests`: Array of Test objects
- `jenkins_jobs`: Array of JenkinsJob objects
- `project_ports`: Array of ProjectPort objects
- `settings`: Array of setting objects with `key`, `value`, and `updated_at`

## Migration

On first start, if a SQLite database exists at `~/.projax/dashboard.db`, the API will automatically migrate all data to the JSON format. The original SQLite file will be backed up to `~/.projax/dashboard.db.backup`.

## Port Management

The API server automatically finds an available port in the range 38124-38133. The selected port is written to `~/.projax/api-port.txt` for other components to discover.

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

Error responses include an `error` field with a descriptive message:

```json
{
  "error": "Project not found"
}
```

## Development Setup

1. Install dependencies: `npm install`
2. Build the project: `npm run build`
3. Start the server: `npm start` or `npm run dev`

## Integration

The API is automatically started by the Electron app when it launches. It can also be started manually using:

```bash
npm start
```

Or via the CLI:

```bash
prx api --start
```

