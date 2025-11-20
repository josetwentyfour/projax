# CLI Overview

The PROJAX CLI (`prx`) is a full-featured command-line tool for managing local development projects. It provides commands for adding, listing, scanning, and running projects, along with advanced features like background execution and port conflict resolution.

:::tip Not a Command Line Person?
Prefer a visual interface? Try our **native desktop app** with `prx web`. It provides a beautiful GUI for managing all your projects without touching the command line! [Learn more about the Desktop app →](/docs/desktop/overview)
:::

## Installation

The CLI is installed globally when you install PROJAX:

```bash
npm install -g projax
```

After installation, the `prx` command is available globally.

## Quick Reference

### Project Management
- `prx add [path]` - Add a project to the dashboard
- `prx list` - List all tracked projects
- `prx scan [project]` - Scan projects for tests and ports
- `prx remove <project>` - Remove a project
- `prx rename <project> <newName>` - Rename a project

### Navigation
- `prx pwd [project]` - Get project path
- `prx cd [project]` - Change to project directory

### Script Execution
- `prx <project> [script]` - Run a script (intelligent selection)
- `prx run <project> <script>` - Run a script explicitly
- `prx scripts [project]` - List available scripts

### Background Processes
- `prx ps` - List running background processes
- `prx stop <pid>` - Stop a background process

### Interfaces
- `prx web` - Start Desktop web interface (recommended)
- `prx api` - Manage API server
- `prx prxi` / `prx i` - Launch interactive terminal UI (beta)

### Advanced
- `prx scan-ports [project]` - Scan for port information

## Features

### Intelligent Script Selection

When you run `prx <project>` without specifying a script, the CLI automatically selects:
1. If project has "start" but no "dev" → runs "start"
2. If project has "dev" but no "start" → runs "dev"
3. Otherwise → shows interactive menu

### Background Execution

Run scripts in the background with minimal logging:
- Use flags: `-M`, `--background`, `-b`, or `--daemon`
- Output saved to `~/.projax/logs/`
- Process tracked with PID
- Continue using terminal immediately

### Port Conflict Resolution

Automatically detects and resolves port conflicts:
- Proactive detection before script execution
- Reactive detection from error messages
- Interactive or automatic resolution (`--force` flag)

### Multi-Project Type Support

Supports multiple project types:
- **Node.js**: npm, yarn, pnpm
- **Python**: Poetry, pyproject.toml
- **Rust**: Cargo commands
- **Go**: go commands or Makefile
- **Makefile**: Makefile targets

## Command Structure

Most commands support:
- Project identification by ID or name
- Interactive mode when project not specified
- Help with `--help` flag

## Next Steps

- [Commands Reference](/docs/cli/commands/add) - Detailed command documentation
- [Advanced Features](/docs/cli/advanced-features) - Learn about intelligent features
- [Shell Integration](/docs/cli/shell-integration) - Integrate with your shell

