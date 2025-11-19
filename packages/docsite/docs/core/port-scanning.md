# Port Scanning

The core package includes utilities for extracting ports from project configuration files.

## Supported Config Files

Ports are extracted from:

- **Vite**: `vite.config.js/ts` - `server.port`
- **Next.js**: `next.config.js/ts` - dev server port
- **Webpack**: `webpack.config.js` - `devServer.port`
- **Angular**: `angular.json` - `serve.options.port`
- **Nuxt**: `nuxt.config.js/ts` - `server.port`
- **Package.json**: Scripts with `--port`, `-p`, or `PORT=` patterns
- **Environment Files**: `.env`, `.env.local`, `.env.development` - `PORT`, `VITE_PORT`, `NEXT_PORT`, etc.

## Port Extraction

### From Vite Config

```typescript
// vite.config.ts
export default {
  server: {
    port: 3000
  }
}
```

### From Next.js Config

```typescript
// next.config.js
module.exports = {
  // Port is typically in package.json scripts
}
```

### From Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite --port 3000",
    "start": "next start -p 3001"
  }
}
```

### From Environment Files

```bash
# .env
PORT=3000
VITE_PORT=5173
NEXT_PORT=3000
```

## Port Storage

Extracted ports are stored in the database as `ProjectPort` records:

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

## Usage

Port scanning is typically done through the CLI or API:

```bash
# Scan ports for a project
prx scan-ports 1

# Scan ports for all projects
prx scan-ports
```

## Automatic Scanning

Ports are automatically scanned when:
- Adding a project (`prx add`)
- Scanning for tests (`prx scan`)
- Listing projects (if ports are stale >24 hours)

## Related Documentation

- [CLI Scan Ports](/docs/cli/commands/scan-ports) - Using port scanning from CLI
- [API Reference](/docs/core/api-reference) - Port-related functions

