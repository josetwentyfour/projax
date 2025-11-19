# projax CLI

Command-line interface for projax - a project management dashboard for tracking local development projects.

## Installation

```bash
npm install -g projax
```

## Commands

### `prx add [path]`

Add a project to the dashboard. If no path is provided, you'll be prompted to enter one.

```bash
prx add /path/to/project
prx add  # Interactive mode
```

### `prx list`

List all tracked projects.

```bash
prx list
prx list --verbose  # Show detailed information
```

### `prx scan [project]`

Scan projects for test files. If no project is specified, all projects are scanned.

```bash
prx scan              # Scan all projects
prx scan 1            # Scan project with ID 1
prx scan my-project   # Scan project named "my-project"
```

### `prx remove <project>`

Remove a project from the dashboard.

```bash
prx remove 1
prx remove my-project
prx remove my-project --force  # Skip confirmation
```

### `prx pwd [project]`

Get the path to a project directory (outputs just the path).

```bash
cd $(prx pwd 1)              # Change to project with ID 1
cd $(prx pwd my-project)     # Change to project named "my-project"
prx pwd                      # Interactive selection
```

### `prx cd [project]`

Change to a project directory. Outputs a shell command to change directory.

```bash
eval "$(prx cd 1)"              # Change to project with ID 1
eval "$(prx cd my-project)"     # Change to project named "my-project"
prx cd                          # Interactive selection
```

**Tip:** For even easier navigation, add this to your shell config (`~/.zshrc` or `~/.bashrc`):

```bash
prxcd() {
  eval "$(prx cd $@)"
}
```

Then you can simply use: `prxcd 1` or `prxcd my-project`

### `prx run <project> <script>`

Run a script from a project.

**Options:**
- `-b, --background`: Run script in background mode
- `-f, --force`: Auto-resolve port conflicts

```bash
# Run in foreground
prx run 1 dev
prx run projax build

# Run in background
prx run 1 dev --background
prx run projax dev -b

# With force flag
prx run 1 dev -f -b
```

### `prx ps`

List all running background processes.

```bash
prx ps
```

### `prx stop <pid>`

Stop a running background process by PID.

```bash
prx stop 12345
```

### `prx prxi` / `prx i`

Launch the interactive terminal UI.

```bash
prx i        # Short alias
prx prxi     # Full command
```

**Keyboard shortcuts:**
- `↑/k` - Navigate up
- `↓/j` - Navigate down
- `Tab/←/→` - Switch panels
- `s` - Scan project
- `p` - Scan ports
- `r` - Show scripts
- `x` - Stop all project scripts
- `?` - Help
- `q/Esc` - Quit

### `prx <project> <script> [args...]`

Run a script from a project's configuration file. Supports multiple project types:

- **Node.js**: Runs scripts from `package.json` using `npm run`
- **Python**: Runs scripts from `pyproject.toml` (supports Poetry)
- **Rust**: Runs common `cargo` commands (build, run, test, etc.)
- **Go**: Runs common `go` commands or Makefile targets
- **Makefile**: Runs Makefile targets

```bash
prx 1 dev                    # Run "dev" script from project ID 1
prx my-project build          # Run "build" script from "my-project"
prx 2 test --watch           # Run "test" script with --watch flag
prx api-server start --port 3000  # Run "start" script with arguments
```

### `prx scripts [project]`

List all available scripts for a project.

```bash
prx scripts                  # Interactive project selection
prx scripts 1                # List scripts for project ID 1
prx scripts my-project       # List scripts for "my-project"
```

### `prx web`

Start the Electron web interface.

```bash
prx web
```

## Examples

```bash
# Add multiple projects
prx add ~/projects/api-server
prx add ~/projects/frontend-app
prx add ~/projects/mobile-app

# List all projects
prx list

# Scan all projects for tests
prx scan

# View detailed project information
prx list --verbose

# Remove a project
prx remove api-server

# Quickly navigate to a project
cd $(prx cd api-server)

# Run scripts from projects
prx api-server dev
prx 1 build
prx frontend-app test --watch

# List available scripts
prx scripts api-server
```

## Database

The CLI uses a shared SQLite database located at `~/.projax/dashboard.db`. This database is shared with the Electron web interface.

