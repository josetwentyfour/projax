# PROJAX for Editors

PROJAX for Editors is a native extension for VS Code-based editors (VS Code, Cursor, Windsurf) that brings the power of PROJAX project management directly into your editor's sidebar.

![PROJAX Command Palette](/img/vscode-command-palette.png)

*PROJAX command palette showing all available commands*

## Overview

The extension provides two main panels in your editor's sidebar:

### 1. PROJAX Projects Panel

- **Search and Browse**: Search through all your PROJAX projects
- **Quick Open**: Click any project to open it in a new window, current window, or add to workspace
- **Current Project Highlighting**: Automatically detects and highlights the current workspace if it's a PROJAX project
- **Auto-Scroll**: Automatically scrolls to the current project for easy identification
- **Sort Options**: Sort projects by name, recently scanned, tests, or running status

### 2. PROJAX Project Details Panel

- **Project Information**: View name, description, path, and tags
- **Statistics**: See test counts and port usage at a glance
- **Script Management**: Run and stop npm/yarn scripts directly from the editor
- **URL Access**: Quick links to running development servers
- **Port Information**: View all detected ports and their associated scripts
- **Test Detection**: Browse all detected test files

## Features

- ✅ **Native Integration**: Fully integrated sidebar with collapsible panels
- ✅ **Auto-Detection**: Automatically detects when you open a PROJAX project
- ✅ **Script Execution**: Run and stop scripts without leaving your editor
- ✅ **Command Palette**: All features accessible via `Cmd+Shift+P` / `Ctrl+Shift+P`
- ✅ **Real-Time Updates**: Live updates of running processes and port status
- ✅ **Cross-Editor Support**: Works in VS Code, Cursor, and Windsurf
- ✅ **API + Direct Database**: Connects to PROJAX API server or direct database access

## Installation

See the [Installation Guide](./installation.md) for detailed installation instructions.

## Usage

See the [Usage Guide](./usage.md) for detailed usage instructions.

## Command Palette

All PROJAX features are available through the command palette. Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux) and type "PROJAX" to see all available commands.

See [Commands Reference](./commands.md) for a complete list of commands.

