# API Endpoints

Complete reference for all API endpoints.

## Base URL

All endpoints are prefixed with the base URL. The API runs on an automatically selected port (default: 38124-38133).

Example: `http://localhost:38124/api`

## Health Check

### GET /health

Check API server status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Projects

### GET /api/projects

List all projects.

**Response:** `Project[]`

**Example:**
```bash
curl http://localhost:38124/api/projects
```

### GET /api/projects/tags

Get all unique tags across all projects.

**Response:** `string[]`

**Example:**
```bash
curl http://localhost:38124/api/projects/tags
```

### GET /api/projects/:id

Get project details by ID.

**Parameters:**
- `id` (path): Project ID (numeric)

**Response:** `Project`

**Example:**
```bash
curl http://localhost:38124/api/projects/1
```

### POST /api/projects

Add a new project.

**Request Body:**
```json
{
  "name": "My Project",
  "path": "/path/to/project"
}
```

**Response:** `Project` (201 Created)

**Example:**
```bash
curl -X POST http://localhost:38124/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "My Project", "path": "/path/to/project"}'
```

**Error Responses:**
- `400` - Missing name or path, path doesn't exist, or path is not a directory
- `409` - Project with this path already exists

### PUT /api/projects/:id

Update project.

**Parameters:**
- `id` (path): Project ID (numeric)

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Project description",
  "framework": "react",
  "tags": ["frontend", "react"]
}
```

All fields are optional. Only provided fields will be updated.

**Response:** `Project`

**Example:**
```bash
curl -X PUT http://localhost:38124/api/projects/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'
```

### DELETE /api/projects/:id

Remove project.

**Parameters:**
- `id` (path): Project ID (numeric)

**Response:** `204 No Content`

**Example:**
```bash
curl -X DELETE http://localhost:38124/api/projects/1
```

### GET /api/projects/:id/tests

Get tests for a project.

**Parameters:**
- `id` (path): Project ID (numeric)

**Response:** `Test[]`

**Example:**
```bash
curl http://localhost:38124/api/projects/1/tests
```

### GET /api/projects/:id/ports

Get project ports.

**Parameters:**
- `id` (path): Project ID (numeric)

**Response:** `ProjectPort[]`

**Example:**
```bash
curl http://localhost:38124/api/projects/1/ports
```

### POST /api/projects/:id/scan

Scan project for tests.

**Parameters:**
- `id` (path): Project ID (numeric)

**Response:**
```json
{
  "project": Project,
  "testsFound": number,
  "tests": Test[]
}
```

**Example:**
```bash
curl -X POST http://localhost:38124/api/projects/1/scan
```

### POST /api/projects/scan/all

Scan all projects for tests.

**Response:**
```json
Array<{
  "project": Project,
  "testsFound": number,
  "tests": Test[]
}>
```

**Example:**
```bash
curl -X POST http://localhost:38124/api/projects/scan/all
```

## Settings

### GET /api/settings

Get all settings.

**Response:** `Record<string, string>`

**Example:**
```bash
curl http://localhost:38124/api/settings
```

### PUT /api/settings/:key

Update a setting.

**Parameters:**
- `key` (path): Setting key

**Request Body:**
```json
{
  "value": "setting value"
}
```

**Response:**
```json
{
  "key": "setting_key",
  "value": "setting value"
}
```

**Example:**
```bash
curl -X PUT http://localhost:38124/api/settings/my_setting \
  -H "Content-Type: application/json" \
  -d '{"value": "my value"}'
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

Error responses include an `error` field:

```json
{
  "error": "Error message here"
}
```

## Next Steps

- [Data Models](/docs/api/data-models) - Understand the data structures
- [Integration](/docs/api/integration) - Learn how to integrate the API

