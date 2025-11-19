# Installation

## Prerequisites

- VS Code, Cursor, or Windsurf editor installed
- PROJAX CLI installed (`npm install -g projax`)
- PROJAX API server running (automatically started with `prx web` or `prx api --start`)

## Installation Methods

### Method 1: Via Command Line (Recommended)

1. **Get the extension package:**

```bash
# View installation instructions and .vsix location
prx vscode-extension
```

2. **Install in your editor:**

```bash
# VS Code
code --install-extension /path/to/projax-vscode-3.0.0.vsix

# Cursor
cursor --install-extension /path/to/projax-vscode-3.0.0.vsix

# Windsurf
windsurf --install-extension /path/to/projax-vscode-3.0.0.vsix
```

### Method 2: Via Editor UI

1. **Get the extension package:**
   - Run `prx vscode-extension` to see the location of the `.vsix` file
   - Default location: `./release/projax-vscode-3.0.0.vsix`

2. **Install via Extensions panel:**
   - Open Extensions (`Cmd+Shift+X` / `Ctrl+Shift+X`)
   - Click the "..." menu at the top
   - Select "Install from VSIX..."
   - Navigate to the `.vsix` file
   - Click "Install"

3. **Reload the editor:**
   - Click "Reload" when prompted, or
   - Run "Developer: Reload Window" from command palette

## Verification

After installation, you should see a new PROJAX icon in the Activity Bar (left sidebar). Click it to open the PROJAX sidebar with two panels:
- **PROJAX Projects** - Browse and search all projects
- **PROJAX Project Details** - View details for the current project

## Configuration

### Extension Settings

Access settings via:
- Command Palette: `PROJAX: Open Settings`
- VS Code Settings: Search for "PROJAX"

Available settings:

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `projax.apiPort` | number | `null` | Manual API port override (auto-detects if empty) |
| `projax.autoDetect` | boolean | `true` | Automatically detect current workspace project |
| `projax.refreshInterval` | number | `5000` | Process polling interval (milliseconds) |
| `projax.preferredOpenMode` | string | `"ask"` | Default behavior when opening projects (`newWindow`, `currentWindow`, `addToWorkspace`, or `ask`) |

### API Connection

The extension connects to the PROJAX API server automatically. If the API server is not running, it falls back to direct database access.

**To ensure optimal performance:**

1. Start the API server:
   ```bash
   prx api --start
   ```

2. Or start the Desktop app (which starts the API automatically):
   ```bash
   prx web
   ```

The extension will display the connection mode in the output panel:
- `Connected to PROJAX (mode: api)` - API server connection
- `Connected to PROJAX (mode: direct)` - Direct database access

## Troubleshooting

### Extension Not Showing

1. **Check installation:**
   ```bash
   code --list-extensions | grep projax
   ```

2. **Reload the editor:**
   - Command Palette → "Developer: Reload Window"

3. **Check output panel:**
   - View → Output
   - Select "PROJAX" from the dropdown

### Connection Issues

1. **Check API server status:**
   ```bash
   prx api
   ```

2. **Start API server if needed:**
   ```bash
   prx api --start
   ```

3. **Check extension logs:**
   - View → Output → PROJAX

### Current Project Not Detected

1. **Ensure the workspace is added to PROJAX:**
   ```bash
   prx add /path/to/workspace
   ```

2. **Or use the command palette:**
   - `PROJAX: Add Current Workspace to PROJAX`

3. **Manually refresh:**
   - `PROJAX: Refresh Projects`

For more troubleshooting, see the [Troubleshooting Guide](../troubleshooting/common-errors.md).

