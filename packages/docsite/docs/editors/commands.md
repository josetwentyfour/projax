# Command Palette Reference

All PROJAX features are accessible via the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`). Type "PROJAX" to filter commands.

## Project Management

### PROJAX: Open Project

**Description:** Browse and open a project from PROJAX.

**Usage:**
1. Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "PROJAX: Open Project"
3. Choose a project from the list
4. Select open mode (New Window, Current Window, or Add to Workspace)

---

### PROJAX: Add Project

**Description:** Add a new project to PROJAX.

**Usage:**
1. Press `Cmd+Shift+P`
2. Type "PROJAX: Add Project"
3. Select a folder using the file picker
4. Enter a project name

---

### PROJAX: Add Current Workspace to PROJAX

**Description:** Add the currently open workspace folder to PROJAX.

**Usage:**
1. Open a project folder in your editor
2. Press `Cmd+Shift+P`
3. Type "PROJAX: Add Current Workspace"
4. Enter a project name

**Shortcut:** Useful when you've already opened a project and want to add it to PROJAX.

---

### PROJAX: Remove Current Project from PROJAX

**Description:** Remove the current workspace project from PROJAX.

**Usage:**
1. Open a PROJAX project in your editor
2. Press `Cmd+Shift+P`
3. Type "PROJAX: Remove Current Project"
4. Confirm the deletion

**Note:** This only removes the project from PROJAX tracking. Files remain on disk.

---

### PROJAX: Refresh Projects

**Description:** Refresh the project list and current project details.

**Usage:**
- Press `Cmd+Shift+P` → "PROJAX: Refresh Projects"

**When to use:**
- After adding/removing projects via CLI
- After updating project details externally
- To sync changes from other tools

---

## Script Management

### PROJAX: Run Script

**Description:** Run an npm/yarn script from the current project.

**Usage:**
1. Open a PROJAX project
2. Press `Cmd+Shift+P`
3. Type "PROJAX: Run Script"
4. Select a script from the list

**Requirements:**
- Current workspace must be a PROJAX project
- Project must have scripts in `package.json`

---

### PROJAX: Stop All Running Scripts

**Description:** Stop all running scripts for the current project.

**Usage:**
1. Open a PROJAX project with running scripts
2. Press `Cmd+Shift+P`
3. Type "PROJAX: Stop All Running Scripts"

**Effect:** Terminates all running processes for the current project.

---

### PROJAX: Show Running Processes

**Description:** View and manage running processes for the current project.

**Usage:**
1. Press `Cmd+Shift+P`
2. Type "PROJAX: Show Running Processes"
3. Select a process to stop (or press Escape to cancel)

**Info shown:** Script name, PID, project name

---

## Testing

### PROJAX: Scan Current Project for Tests

**Description:** Scan the current project for test files.

**Usage:**
1. Open a PROJAX project
2. Press `Cmd+Shift+P`
3. Type "PROJAX: Scan Current Project for Tests"

**Detects:** Jest, Vitest, Mocha, and other test files based on naming patterns.

---

### PROJAX: Scan All Projects

**Description:** Scan all PROJAX projects for test files.

**Usage:**
- Press `Cmd+Shift+P` → "PROJAX: Scan All Projects"

**Note:** This may take a while for large project lists.

---

## URL Access

### PROJAX: Open Project URL

**Description:** Open a development server URL in your browser.

**Usage:**
1. Open a PROJAX project with running scripts
2. Press `Cmd+Shift+P`
3. Type "PROJAX: Open Project URL"
4. Select a URL from the list

**Auto-detection:** URLs are automatically detected from running processes.

---

## Desktop Integration

### PROJAX: Open Current Project in Desktop App

**Description:** Open the current project in the PROJAX Desktop app.

**Usage:**
1. Open a PROJAX project
2. Press `Cmd+Shift+P`
3. Type "PROJAX: Open Current Project in Desktop App"

**Requirements:**
- PROJAX API server must be running (`prx api --start` or `prx web`)
- Current workspace must be a PROJAX project

---

## Settings

### PROJAX: Open Settings

**Description:** Open PROJAX extension settings.

**Usage:**
- Press `Cmd+Shift+P` → "PROJAX: Open Settings"

**Configurable Settings:**
- API port override
- Auto-detection behavior
- Refresh interval
- Preferred open mode

---

## Command Summary Table

| Command | Category | Requires Current Project |
|---------|----------|-------------------------|
| Open Project | Project Management | No |
| Add Project | Project Management | No |
| Add Current Workspace | Project Management | No |
| Remove Current Project | Project Management | Yes |
| Refresh Projects | Project Management | No |
| Run Script | Scripts | Yes |
| Stop All Running Scripts | Scripts | Yes |
| Show Running Processes | Scripts | Yes |
| Scan Current Project | Testing | Yes |
| Scan All Projects | Testing | No |
| Open Project URL | URLs | Yes |
| Open in Desktop App | Desktop | Yes |
| Open Settings | Settings | No |

## Tips

### Keyboard Shortcuts

While VS Code doesn't allow extensions to define custom keyboard shortcuts by default, you can create your own:

1. Open Keyboard Shortcuts: `Cmd+K Cmd+S` (macOS) or `Ctrl+K Ctrl+S` (Windows/Linux)
2. Search for "PROJAX"
3. Click the + icon to add a shortcut
4. Press your desired key combination

**Suggested Shortcuts:**
- `Cmd+Shift+O` → "PROJAX: Open Project"
- `Cmd+Shift+R` → "PROJAX: Run Script"
- `Cmd+Shift+.` → "PROJAX: Open Project URL"

### Command Palette History

VS Code remembers recently used commands. After using a PROJAX command once:
1. Press `Cmd+Shift+P`
2. Start typing the command
3. It appears in the "recently used" section

### Quick Access

For frequently used commands, consider:
1. Adding them to keyboard shortcuts
2. Using the sidebar panels for visual access
3. Bookmarking the command names

