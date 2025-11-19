# Introduction

**projax** is a cross-platform project management dashboard for tracking local development projects. It provides a powerful CLI tool, interactive Terminal UI (TUI), Desktop app (Electron-based), REST API, and built-in tools for test detection, port management, and script execution.

## What is projax?

projax helps developers manage multiple local development projects efficiently. Instead of manually navigating between project directories, remembering script names, or dealing with port conflicts, projax provides a unified interface to:

- Track and organize multiple projects from different directories
- Automatically detect test files and frameworks
- Manage port conflicts intelligently
- Run scripts with intelligent selection
- Execute scripts in the background
- Access projects via CLI, TUI, or Desktop interface

## Key Features

### Project Management
- Track multiple local projects from different directories with custom names
- Organize projects with a lightweight JSON-based database
- Quick navigation between projects

### Test Detection
- Automatically detects test files (Jest, Vitest, Mocha)
- Identifies test frameworks from configuration files
- Scans projects on demand or automatically

### Port Conflict Detection & Remediation
- Automatically detects port conflicts when running scripts
- Identifies processes using ports
- Provides interactive or automatic resolution

### Background Script Execution
- Run scripts in the background with minimal logging
- Track running processes
- View logs for background processes

### Intelligent Script Selection
- Automatically selects the right script (dev/start) when running projects
- Supports multiple project types (Node.js, Python, Rust, Go, Makefile)
- Interactive script selection when needed

### Port Scanning & Indexing
- Automatically extracts and indexes ports from project config files
- Supports Vite, Next.js, Webpack, Angular, Nuxt, and more
- Displays port information in project listings

### Multiple Interfaces
- **CLI**: Full-featured command-line tool for project management
- **TUI**: Interactive terminal UI (prxi) with keyboard navigation
- **Desktop**: Beautiful Electron-based web interface
- **API**: REST API for programmatic access

### Cross-Platform Support
- Works on macOS, Linux, and Windows
- Consistent experience across platforms

### Multi-Project Type Support
- Node.js (npm, yarn, pnpm)
- Python (Poetry, pyproject.toml)
- Rust (Cargo)
- Go (go commands, Makefile)
- Makefile projects

## Architecture

projax is built as a monorepo with the following packages:

- **@projax/core**: Shared database and utilities
- **@projax/cli**: Command-line interface
- **@projax/api**: REST API server
- **@projax/desktop**: Electron-based desktop application
- **@projax/prxi**: Interactive terminal UI

All packages share the same JSON database located at `~/.projax/data.json` (or `%USERPROFILE%\.projax\data.json` on Windows).

## Next Steps

- [Installation Guide](/docs/getting-started/installation) - Get projax installed and running
- [Quick Start](/docs/getting-started/quick-start) - Learn the basics in minutes
- [Architecture Overview](/docs/getting-started/architecture) - Understand how projax works

