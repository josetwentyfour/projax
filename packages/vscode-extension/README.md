# PROJAX for Editors

PROJAX project management dashboard extension for VS Code, Cursor, and Windsurf.

## Features

- **Project List View**: Browse and search all your PROJAX projects in a collapsible sidebar panel
- **Project Details View**: View detailed information about the current project including:
  - Project metadata (name, description, path)
  - Tags management
  - Available npm/yarn scripts with run/stop controls
  - Test files and frameworks
  - Detected ports and URLs
  - Running processes monitoring
- **Auto-detection**: Automatically highlights the current workspace project if it exists in PROJAX
- **Dual Connection Mode**: 
  - Connects to PROJAX API server (if running)
  - Falls back to direct database access
- **Project Opening**: Flexible project opening options:
  - New window
  - Current window
  - Add to workspace

## Requirements

- PROJAX must be installed and configured
- PROJAX API server should be running (optional - extension will use direct database access as fallback)

## Extension Settings

- `projax.apiPort`: Manual API port override (leave empty to auto-detect)
- `projax.autoDetect`: Enable/disable automatic workspace project detection (default: true)
- `projax.refreshInterval`: Process polling interval in milliseconds (default: 5000)
- `projax.preferredOpenMode`: Default project open behavior (newWindow, currentWindow, addToWorkspace, or ask)

## Commands

- `projax.openProject`: Open a project selector
- `projax.addProject`: Add a folder to PROJAX
- `projax.refreshProjects`: Refresh the project list
- `projax.scanProject`: Scan a project for test files
- `projax.scanAllProjects`: Scan all projects
- `projax.openSettings`: Open PROJAX extension settings

## Usage

1. Open the PROJAX sidebar by clicking the PROJAX icon in the activity bar
2. Use the "PROJAX Projects" panel to browse and search projects
3. Click on a project to open it in your editor
4. The "PROJAX Project Details" panel will show information about the current project
5. If your current workspace is a PROJAX project, it will be automatically highlighted

## Development

```bash
# Build the extension
npm run build

# Watch mode
npm run watch

# Package for distribution
npm run package
```

## License

See main PROJAX repository for license information.

