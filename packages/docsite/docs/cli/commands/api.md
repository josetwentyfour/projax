# prx api

Show API server information and manage the API server.

## Syntax

```bash
prx api [options]
```

## Options

- `-s, --start`: Start the API server
- `-k, --kill`: Stop the API server (not yet implemented)

## Description

Shows API server status and allows manual management of the API server. The API server is typically started automatically when you launch the Desktop web interface.

## Examples

### Show API status

```bash
prx api
```

Shows:
- Whether the API server is running
- The port it's running on
- Health check URL

### Start API server manually

```bash
prx api --start
```

Manually starts the API server if it's not running.

## API Server Details

The API server:
- Automatically finds an available port in the range 38124-38133
- Writes the port to `~/.projax/api-port.txt` for discovery
- Provides REST endpoints for all operations
- Enables CORS for cross-origin requests

## API Status Display

The API server status is also shown in:
- CLI welcome screen (when running any command)
- Desktop app status bar (bottom of window)

## Health Check

Check if the API is running:

```bash
curl http://localhost:38124/health
```

Returns: `{ "status": "ok", "timestamp": "..." }`

## Related Commands

- [`prx web`](/docs/cli/commands/web) - Start Desktop app (auto-starts API)
- [API Documentation](/docs/api/overview) - Complete API documentation

