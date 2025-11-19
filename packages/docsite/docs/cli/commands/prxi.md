# prx prxi / prx i

Launch the interactive terminal UI - a full-screen terminal interface for managing projects.

## Syntax

```bash
prx prxi
prx i
```

## Description

Launches the interactive Terminal UI (TUI) built with Ink. This provides a full-screen terminal interface for managing projects with keyboard navigation.

## Features

- Navigate projects with arrow keys or vim bindings (j/k)
- View project details, tests, ports, and running scripts
- Scan projects for tests and ports
- Stop running scripts
- Full-height columns with independent scrolling

## Keyboard Shortcuts

### Navigation
- `↑` / `k` - Move up in project list
- `↓` / `j` - Move down in project list
- `Tab` / `←` / `→` - Switch between project list and details

### Actions
- `s` - Scan selected project for tests
- `p` - Scan ports for selected project
- `r` - Show available scripts
- `x` - Stop all scripts for selected project

### General
- `?` - Show help screen
- `q` / `Esc` - Quit

## Examples

### Launch TUI

```bash
prx i         # Short alias
prx prxi      # Full command
```

## UI Layout

The TUI displays:
- **Left Panel**: List of all projects
- **Right Panel**: Details for selected project
  - Project information
  - Available scripts
  - Detected ports
  - Test files
  - Running processes

## Related Commands

- [`prx web`](/docs/cli/commands/web) - Launch Desktop web interface
- [`prx list`](/docs/cli/commands/list) - List projects in terminal
- [Prxi Documentation](/docs/prxi/overview) - Detailed Prxi package documentation

