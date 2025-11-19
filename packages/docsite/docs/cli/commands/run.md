# prx run

Run a script from a project with explicit command syntax.

## Syntax

```bash
prx run <project> <script> [args...] [options]
```

## Options

- `-b, --background`: Run script in background mode
- `-f, --force`: Auto-resolve port conflicts

## Description

Runs a script from a project's configuration file. This is the explicit form of script execution. For intelligent script selection, use `prx <project> [script]` instead.

## Examples

### Run a script in foreground

```bash
prx run 1 dev
prx run projax build
```

### Run in background

```bash
prx run 1 dev --background
prx run projax dev -b
```

### Auto-resolve port conflicts

```bash
prx run 1 dev --force
prx run 1 dev -f
```

### Combine options

```bash
prx run 1 dev -b -f
```

Runs in background with automatic port conflict resolution.

### Run with arguments

```bash
prx run 1 dev --port 3001
prx run 2 test --watch --coverage
```

## Supported Project Types

- **Node.js**: Runs scripts from `package.json` (npm, yarn, pnpm)
- **Python**: Runs scripts from `pyproject.toml` (supports Poetry)
- **Rust**: Runs common `cargo` commands (build, run, test, etc.)
- **Go**: Runs common `go` commands or Makefile targets
- **Makefile**: Runs Makefile targets

## Background Mode

When using `--background` or `-b`:
- Script runs detached from your terminal
- Output saved to log files in `~/.projax/logs/`
- Process tracked with PID
- You can continue using terminal immediately

View logs:
```bash
tail -f ~/.projax/logs/process-*.log
```

## Port Conflict Resolution

Use `--force` or `-f` to automatically:
- Detect port conflicts
- Kill the process using the port
- Retry script execution

## Related Commands

- [`prx <project> [script]`](/docs/cli/advanced-features#intelligent-script-selection) - Intelligent script selection
- [`prx scripts`](/docs/cli/commands/scripts) - List available scripts
- [`prx ps`](/docs/cli/commands/ps) - View running background processes
- [`prx stop`](/docs/cli/commands/stop) - Stop a background process

