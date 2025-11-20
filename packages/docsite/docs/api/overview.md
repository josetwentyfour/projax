# API Overview

The PROJAX API is a RESTful API server built with Express that provides programmatic access to all PROJAX operations. It uses a JSON database (lowdb) for storage and automatically handles port discovery and CORS.

## Features

- RESTful API with Express
- JSON database using lowdb
- Automatic migration from SQLite to JSON
- Port availability checking (tries ports 38124-38133)
- CORS enabled for cross-origin requests
- Automatic port discovery and file-based port sharing

## Architecture

The API server:
- Runs as a standalone Express server
- Shares the same JSON database as the CLI (`~/.projax/data.json`)
- Automatically finds an available port (38124-38133)
- Writes the selected port to `~/.projax/api-port.txt` for discovery
- Provides REST endpoints for all operations

## Base URL

The API server runs on an automatically selected port. The port is:
- Displayed in CLI welcome screen
- Shown in Desktop app status bar
- Available via `prx api` command
- Written to `~/.projax/api-port.txt`

Default port range: `38124-38133`

## Authentication

Currently, the API does not require authentication as it's designed for local development use. All endpoints are accessible without authentication.

## Response Format

### Success Responses

- `200 OK` - Successful request
- `201 Created` - Resource created
- `204 No Content` - Successful deletion

### Error Responses

All errors return JSON with an `error` field:

```json
{
  "error": "Error message here"
}
```

Common status codes:
- `400 Bad Request` - Invalid request
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate project)
- `500 Internal Server Error` - Server error

## CORS

CORS is enabled for all origins, allowing the Desktop app and other clients to access the API from different origins.

## Next Steps

- [Installation](/docs/api/installation) - Set up the API server
- [Endpoints](/docs/api/endpoints) - Complete endpoint documentation
- [Data Models](/docs/api/data-models) - Understand the data structures

