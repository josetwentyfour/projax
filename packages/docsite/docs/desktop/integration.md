# Desktop Integration

How the Desktop app integrates with the projax API and core packages.

## API Server Integration

The Desktop app automatically manages the API server:

### Automatic Start

When you launch the Desktop app:
1. Checks if API server is running
2. Starts API server if not running
3. Discovers the API port
4. Connects to the API

### API Discovery

The Desktop app discovers the API port by:
1. Reading `~/.projax/api-port.txt`
2. Trying common ports (3001-3005)
3. Checking health endpoint

### API Communication

All operations go through the REST API:
- `GET /api/projects` - Fetch projects
- `POST /api/projects` - Add project
- `POST /api/projects/:id/scan` - Scan project
- And more...

## Core Package Integration

The Desktop app uses the core package indirectly through the API:
- Database operations via API
- Test detection via API
- Port scanning via API

## Electron Architecture

### Main Process

The Electron main process:
- Manages the application window
- Starts/stops the API server
- Handles file system operations
- Manages application lifecycle

### Renderer Process

The React renderer:
- Provides the user interface
- Communicates with API server
- Handles user interactions
- Updates UI based on API responses

### Preload Script

The preload script:
- Bridges main and renderer processes
- Provides secure IPC communication
- Exposes safe APIs to renderer

## Data Flow

```
User Action (Renderer)
    ↓
API Request (Renderer)
    ↓
API Server (Express)
    ↓
Core Package (Database)
    ↓
JSON Database
    ↓
Response (API)
    ↓
UI Update (Renderer)
```

## Error Handling

The Desktop app handles errors:
- API connection errors
- Network timeouts
- Invalid responses
- Server errors

Errors are displayed:
- In the status bar
- As toast notifications (if available)
- In the console (development mode)

## State Management

The Desktop app manages state:
- Project list
- Selected project
- API connection status
- Loading states

## Next Steps

- [Development](/docs/desktop/development) - Development setup
- [API Documentation](/docs/api/overview) - Complete API reference

