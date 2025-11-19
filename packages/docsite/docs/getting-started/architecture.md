# Architecture Overview

projax is built as a monorepo with a modular architecture. All packages share a common core and use a unified JSON database.

## Package Structure

### @projax/core

The core package provides shared functionality used by all other packages:

- **Database Management**: JSON-based storage using lowdb
- **Test Detection**: Framework detection and file scanning
- **Port Scanning**: Extraction from configuration files
- **Settings Management**: User preferences and configuration

**Location**: `packages/core`

### @projax/cli

The command-line interface provides a full-featured CLI for project management:

- Command parsing and execution
- Script runner with port conflict detection
- Background process management
- Integration with core package

**Location**: `packages/cli`

### @projax/api

REST API server built with Express:

- RESTful endpoints for all operations
- Automatic port discovery (3001-3010)
- CORS enabled for cross-origin requests
- SQLite to JSON migration support

**Location**: `packages/api`

### @projax/desktop

Electron-based desktop application:

- React-based UI
- Integration with API server
- File system picker for adding projects
- Visual project management

**Location**: `packages/desktop`

### @projax/prxi

Interactive Terminal UI built with Ink:

- Full-screen terminal interface
- Keyboard navigation (vim bindings)
- Real-time project information
- Built with React and TypeScript

**Location**: `packages/prxi`

## Data Flow

```
┌─────────────┐
│   CLI/TUI   │
│   Desktop   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  @projax/   │
│    core     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   JSON DB   │
│ ~/.projax/  │
│  data.json  │
└─────────────┘

┌─────────────┐
│   Desktop   │
│     App     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ @projax/api │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  @projax/   │
│    core     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   JSON DB   │
└─────────────┘
```

## Database Schema

The JSON database (`~/.projax/data.json`) contains:

```typescript
{
  projects: Project[],
  tests: Test[],
  project_ports: ProjectPort[],
  settings: Setting[],
  jenkins_jobs: JenkinsJob[]  // Future feature
}
```

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

## Port Management

Ports are detected from multiple sources:

1. **Configuration Files**: Vite, Next.js, Webpack, Angular, Nuxt configs
2. **Package.json Scripts**: Scripts with `--port`, `-p`, or `PORT=` patterns
3. **Environment Files**: `.env` files with port variables
4. **Error Messages**: Extracted from port conflict errors

Ports are automatically scanned when:
- Adding a project
- Running `prx scan`
- Running `prx scan-ports`
- Listing projects (if ports are stale >24 hours)

## Script Execution

The CLI supports multiple project types:

- **Node.js**: Reads `package.json`, uses npm/yarn/pnpm
- **Python**: Reads `pyproject.toml`, supports Poetry
- **Rust**: Uses `cargo` commands
- **Go**: Uses `go` commands or Makefile
- **Makefile**: Runs Makefile targets

Scripts can run in:
- **Foreground**: Standard execution with full output
- **Background**: Detached with logs saved to `~/.projax/logs/`

## Port Conflict Resolution

When a port conflict is detected:

1. **Detection**: Port is checked before script execution or extracted from error
2. **Process Identification**: Finds the process using the port (cross-platform)
3. **Resolution**:
   - **Interactive**: Prompts user to kill process
   - **Automatic**: Use `--force` flag to auto-kill and retry

## API Server

The API server:
- Automatically finds available port (3001-3010)
- Writes port to `~/.projax/api-port.txt` for discovery
- Provides REST endpoints for all operations
- Handles CORS for desktop app integration

## Future Architecture

Planned features:
- **Jenkins Integration**: Connect to local Jenkins instances
- **Git Integration**: Show git status and branch information
- **Notifications**: Alert on test failures or build status changes
- **Project Templates**: Quick project setup from templates

## Next Steps

- [CLI Documentation](/docs/cli/overview) - Learn about the CLI package
- [API Documentation](/docs/api/overview) - Understand the API structure
- [Core Documentation](/docs/core/overview) - Explore the core package

