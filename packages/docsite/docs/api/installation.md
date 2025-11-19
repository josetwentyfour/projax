# API Installation

The API server is part of the projax package and is automatically available when you install projax.

## Installation

Install projax globally:

```bash
npm install -g projax
```

The API server code is included in the installation.

## Starting the API Server

### Automatic Start

The API server is automatically started when you launch the Desktop web interface:

```bash
prx web
```

### Manual Start

Start the API server manually:

```bash
prx api --start
```

Or from the API package directory:

```bash
cd packages/api
npm start
```

### Development Mode

Run the API server in development mode with hot reload:

```bash
cd packages/api
npm run dev
```

Or from the root:

```bash
npm run dev:api
```

## Port Management

The API server automatically finds an available port in the range 3001-3010. The selected port is:

- Written to `~/.projax/api-port.txt` for discovery
- Displayed in the console when starting
- Shown in CLI welcome screen
- Visible in Desktop app status bar

## Health Check

Verify the API is running:

```bash
# Check status via CLI
prx api

# Or check health endpoint
curl http://localhost:3001/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Database

The API uses the same JSON database as the CLI:
- **Location**: `~/.projax/data.json` (macOS/Linux) or `%USERPROFILE%\.projax\data.json` (Windows)
- **Format**: JSON
- **Migration**: Automatically migrates from SQLite if found

## Next Steps

- [Endpoints](/docs/api/endpoints) - Learn about available endpoints
- [Integration](/docs/api/integration) - Integrate the API into your applications

