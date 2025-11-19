# Advanced Features

The projax CLI includes several intelligent features that make managing projects easier.

## Intelligent Script Selection

When you run `prx <project>` without specifying a script, the CLI automatically selects the appropriate script:

1. **If project has "start" but no "dev"** → automatically runs "start"
2. **If project has "dev" but no "start"** → automatically runs "dev"
3. **If both exist or neither exists** → shows interactive menu to select from all available scripts

### Examples

```bash
# Auto-selects "start" if no "dev" exists
prx 1

# Auto-selects "dev" if no "start" exists
prx 2

# Shows menu if both exist
prx 3
```

This makes it easy to quickly start projects without remembering script names.

## Background Script Execution

Run scripts in the background with minimal logging. The script output is redirected to log files, allowing you to continue using your terminal.

### Background Mode Flags

Multiple flags are supported for convenience:
- `-M` (shortest)
- `--background`
- `-b`
- `--daemon`

### Features

- Script runs detached from your terminal
- Output saved to log files in `~/.projax/logs/`
- Process tracked with PID
- You can continue using your terminal immediately

### Example

```bash
# Start dev server in background
prx 1 dev -M

# Output shows:
# ✓ Started "My Project" (dev) in background [PID: 12345]
#   Logs: /Users/username/.projax/logs/process-1234567890-dev.log
#   Command: npm run dev
```

### Viewing Logs

```bash
# Logs are stored in:
~/.projax/logs/process-<timestamp>-<script>.log

# View recent log
tail -f ~/.projax/logs/process-*.log
```

## Port Conflict Detection & Remediation

The CLI automatically detects and helps resolve port conflicts when running scripts.

### How It Works

1. **Proactive Detection**: Before running a script, checks if known ports are in use
2. **Reactive Detection**: If a script fails with a port error, extracts the port number from the error message
3. **Process Identification**: Finds the process using the port (cross-platform)
4. **Remediation Options**:
   - **Interactive**: Prompts to kill the process and retry
   - **Auto-resolve**: Use `--force` or `-F` flag to automatically kill and retry

### Port Detection Sources

- Automatically extracted from config files during scanning
- Detected from error messages when scripts fail
- Stored in database for quick reference

### Examples

#### Interactive Resolution

```bash
prx 1 dev
# ⚠️  Port 3000 is already in use by process 12345 (node)
# Kill process 12345 (node) and continue? (y/N)
```

#### Auto-resolve Port Conflicts

```bash
prx 1 dev --force
# Port 3000 is already in use by process 12345 (node)
# Killing process 12345 on port 3000...
# ✓ Process killed. Retrying...
```

### Supported Error Patterns

The CLI recognizes various port error formats:
- `EADDRINUSE: address already in use :::3000`
- `Port 3000 is already in use`
- `Error: listen EADDRINUSE: address already in use 0.0.0.0:3000`
- And many more common port error formats

## Port Scanning & Indexing

The CLI automatically scans and indexes ports from project configuration files.

### Automatic Scanning

Ports are scanned when:
- Adding a project (`prx add`)
- Scanning for tests (`prx scan`)
- Running in background when listing projects (`prx list`) if ports are stale (>24 hours)

### Supported Config Files

- **Vite**: `vite.config.js/ts` - `server.port`
- **Next.js**: `next.config.js/ts` - dev server port
- **Webpack**: `webpack.config.js` - `devServer.port`
- **Angular**: `angular.json` - `serve.options.port`
- **Nuxt**: `nuxt.config.js/ts` - `server.port`
- **Package.json**: Scripts with `--port`, `-p`, `PORT=` patterns
- **Environment Files**: `.env`, `.env.local`, `.env.development` - `PORT`, `VITE_PORT`, `NEXT_PORT`, etc.

### Port Information Display

- Shown in `prx list` table view
- Detailed view with `prx list --ports`
- Grouped by script name when applicable

## Multi-Project Type Support

The CLI supports multiple project types and automatically detects the appropriate runner:

### Node.js Projects

- Reads `package.json`
- Detects package manager (npm, yarn, pnpm)
- Runs scripts with appropriate command

### Python Projects

- Reads `pyproject.toml`
- Supports Poetry
- Runs scripts with Poetry or python commands

### Rust Projects

- Reads `Cargo.toml`
- Runs common `cargo` commands (build, run, test, etc.)

### Go Projects

- Reads `go.mod` or Makefile
- Runs `go` commands or Makefile targets

### Makefile Projects

- Detects Makefile
- Runs Makefile targets

## Project Identification

Projects can be identified by:
- **ID**: Numeric ID assigned when added
- **Name**: Custom name or directory name

Both methods work for all commands:

```bash
prx 1 dev          # By ID
prx "My Project" dev  # By name
```

## Related Documentation

- [Shell Integration](/docs/cli/shell-integration) - Integrate with your shell
- [Examples](/docs/examples/basic-workflow) - See these features in action

