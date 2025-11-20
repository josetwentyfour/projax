# prx web

Start the Desktop web interface.

## Syntax

```bash
prx web [options]
```

## Options

- `--dev`: Start in development mode (with hot reload)

## Description

Starts the Electron-based Desktop web interface. The API server is automatically started when launching the web interface.

## Examples

### Production mode

```bash
prx web
```

Starts the Desktop app in production mode.

### Development mode

```bash
prx web --dev
```

Starts the Desktop app in development mode with hot reload enabled.

## Features

The Desktop interface provides:
- Visual project management
- File system picker for adding projects
- Project details and test information
- Scan projects directly from UI
- Integration with API server

## API Server

The API server is automatically started when you launch the Desktop app. It:
- Finds an available port (38124-38133)
- Displays the port in the status bar
- Provides REST endpoints for the Desktop app

## Related Commands

- [`prx api`](/docs/cli/commands/api) - Manage API server
- [`prx prxi`](/docs/cli/commands/prxi) - Launch Terminal UI
- [Desktop Documentation](/docs/desktop/overview) - Detailed Desktop package documentation

