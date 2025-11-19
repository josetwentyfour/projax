# Usage Guide

## Opening the PROJAX Sidebar

Click the PROJAX icon in the Activity Bar (left sidebar) to open the PROJAX sidebar. You'll see two panels:

1. **PROJAX Projects** - Browse and manage all your projects
2. **PROJAX Project Details** - View details for the selected or current project

## PROJAX Projects Panel

### Searching Projects

Use the search bar at the top to filter projects by:
- Project name
- Project path
- Description
- Tags

The search is real-time and case-insensitive.

### Sorting Projects

Click the sort icon (≡) next to the search bar to access sort options:
- **Name (A-Z)** - Alphabetical ascending
- **Name (Z-A)** - Alphabetical descending
- **Recently Scanned** - Most recently scanned first
- **Oldest First** - Least recently scanned first
- **Most Tests** - Projects with most tests first
- **Running First** - Projects with running processes first

### Opening Projects

Click on any project tile to open it. You'll be prompted to choose:
- **New Window** - Open in a new editor window
- **Current Window** - Replace current workspace
- **Add to Workspace** - Add as a folder to current workspace

**Tip:** Set your preferred behavior in settings (`projax.preferredOpenMode`) to skip the prompt.

### Current Project Indicator

If your current workspace is a PROJAX project:
- It will be highlighted with a green border
- A green dot (●) will appear next to the project name
- The panel will auto-scroll to bring it into view

## PROJAX Project Details Panel

### Project Information

The top section displays:
- **Project Name** (editable - click to edit)
- **Description** (editable - click to edit)
- **Tags** (editable - click to manage)
- **Project Path**
- **Statistics** (test count, port count)

### Running Scripts

The **Scripts** section shows all available npm/yarn scripts:

1. **View Scripts**: All package.json scripts are listed
2. **Run a Script**: Click the ▶️ play button next to any script
3. **Stop a Script**: Click the ⏹ stop button for running scripts
4. **Multiple Scripts**: Run multiple scripts simultaneously

**Running Process Indicators:**
- Green play icon (▶️) - Script is running
- Process ID (PID) displayed
- Elapsed time shown
- Stop button available

### Accessing URLs

The **Ports** section shows all detected URLs:

1. **Development Servers**: Automatically detected from running scripts
2. **Click to Open**: Click any URL to open in your default browser
3. **Port Information**: See which script is using each port

### Viewing Tests

The **Tests** section displays:
- **Test Count**: Total number of test files
- **Test Files**: Expandable list of all detected test files
- **File Paths**: Relative paths from project root
- **Quick Access**: Click any test file to open it in the editor

### Managing Project Details

#### Edit Project Name
1. Click the project name at the top
2. Enter the new name
3. Press Enter or click outside to save

#### Edit Description
1. Click the description text
2. Enter the new description
3. Press Enter or click outside to save

#### Manage Tags
1. Click on the tags section
2. Add new tags by typing and pressing Enter
3. Remove tags by clicking the ✕ button

#### Scan for Tests
1. Click the "Scan Tests" button
2. Wait for the scan to complete
3. View updated test count and files

#### Delete Project
1. Click the "Delete Project" button
2. Confirm the deletion
3. Project is removed from PROJAX (files remain on disk)

## Keyboard Shortcuts

While shortcuts are not customizable by default, you can use the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) to access all features quickly. Type "PROJAX" to see all available commands.

## Tips and Tricks

### Quick Project Access

Use the Command Palette for fastest access:
```
Cmd+Shift+P (or Ctrl+Shift+P) → Type "PROJAX: Open Project"
```

### Add Current Workspace

To add the current workspace to PROJAX:
```
Cmd+Shift+P → Type "PROJAX: Add Current Workspace"
```

### Run Scripts Without Sidebar

Use the Command Palette:
```
Cmd+Shift+P → Type "PROJAX: Run Script"
```

### Open in Desktop App

To switch to the PROJAX Desktop app:
```
Cmd+Shift+P → Type "PROJAX: Open Current Project in Desktop App"
```

### Multiple Editors

The extension works independently in each editor window. Each instance:
- Connects to the same PROJAX database
- Shows the current project for that window
- Can run scripts independently

## Common Workflows

### Workflow 1: Open and Run a Project

1. Click PROJAX icon in sidebar
2. Search for your project
3. Click the project tile → "New Window"
4. In the new window, the Project Details panel shows the project
5. Click ▶️ next to a script (e.g., "dev")
6. Click the URL in the Ports section to open in browser

### Workflow 2: Add and Configure a Project

1. Open your project folder in the editor
2. `Cmd+Shift+P` → "PROJAX: Add Current Workspace to PROJAX"
3. Enter a project name
4. The Project Details panel appears
5. Add description and tags
6. Click "Scan Tests" to detect test files

### Workflow 3: Multi-Project Development

1. Open first project in a window
2. Click PROJAX icon
3. Find second project
4. Click project tile → "Add to Workspace"
5. Both projects now visible in File Explorer
6. Project Details shows the first (main) project
7. Run scripts for each project as needed

## Next Steps

- [Commands Reference](./commands.md) - Complete list of all commands
- [Features](./features.md) - Detailed feature documentation
- [Integration](./integration.md) - Integration with other tools

