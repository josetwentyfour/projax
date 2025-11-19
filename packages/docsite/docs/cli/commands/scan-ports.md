# prx scan-ports

Manually scan projects for port information.

## Syntax

```bash
prx scan-ports [project]
```

## Description

Manually scans projects for port information. Ports are automatically extracted from configuration files. If no project is specified, all projects are scanned.

## Examples

### Scan all projects

```bash
prx scan-ports
```

### Scan specific project by ID

```bash
prx scan-ports 1
```

### Scan specific project by name

```bash
prx scan-ports "My Project"
```

## Supported Config Files

Ports are extracted from:

- **Vite**: `vite.config.js/ts` - `server.port`
- **Next.js**: `next.config.js/ts` - dev server port
- **Webpack**: `webpack.config.js` - `devServer.port`
- **Angular**: `angular.json` - `serve.options.port`
- **Nuxt**: `nuxt.config.js/ts` - `server.port`
- **Package.json**: Scripts with `--port`, `-p`, or `PORT=` patterns
- **Environment Files**: `.env`, `.env.local`, `.env.development` - `PORT`, `VITE_PORT`, `NEXT_PORT`, etc.

## Port Information

Ports are stored with:
- Port number
- Script name (if applicable)
- Config source (file where port was found)
- Last detected timestamp

## Automatic Scanning

Ports are automatically scanned when:
- Adding a project (`prx add`)
- Scanning for tests (`prx scan`)
- Listing projects (if ports are stale >24 hours)

## View Port Information

View detected ports:

```bash
prx list --ports
```

## Related Commands

- [`prx scan`](/docs/cli/commands/scan) - Scan for tests and ports
- [`prx list`](/docs/cli/commands/list) - View port information

