# Quick Start

Get up and running with projax in just a few minutes.

## Step 1: Add Your First Project

Add a project to the dashboard:

```bash
prx add /path/to/your/project
```

You'll be prompted to:
1. Enter a custom name (defaults to directory name)
2. Optionally scan for test files
3. Automatically scan for ports in configuration files

Or add with a custom name directly:

```bash
prx add /path/to/your/project --name "My Awesome Project"
```

## Step 2: List Your Projects

View all tracked projects:

```bash
prx list
```

This shows a formatted table with:
- Project ID
- Name
- Path
- Detected ports
- Number of test files
- Last scanned timestamp

## Step 3: Run a Project

Run a project's script with intelligent selection:

```bash
# Auto-selects dev or start script
prx 1

# Or use the project name
prx "My Awesome Project"
```

Run a specific script:

```bash
prx 1 dev
prx "My Awesome Project" build
```

## Step 4: Run in Background

Run scripts in the background to keep your terminal free:

```bash
prx 1 dev -M
```

View running processes:

```bash
prx ps
```

Stop a background process:

```bash
prx stop <pid>
```

## Step 5: Navigate to Projects

Quickly change to a project directory:

```bash
# Using eval (recommended)
eval "$(prx cd 1)"

# Or get the path
cd $(prx pwd 1)
```

## Step 6: Use the Interactive TUI

Launch the interactive terminal UI:

```bash
prx i
# or
prx prxi
```

Navigate with arrow keys or vim bindings (j/k), press `?` for help.

## Step 7: Launch the Desktop App

Start the Electron-based desktop interface:

```bash
prx web
```

## Common Workflows

### Add Multiple Projects

```bash
prx add ~/projects/api-server --name "API Server"
prx add ~/projects/frontend --name "Frontend App"
prx add ~/projects/mobile-app --name "Mobile App"
```

### Scan for Tests and Ports

```bash
# Scan all projects
prx scan

# Scan specific project
prx scan 1
prx scan "My Project"
```

### Run Multiple Projects

```bash
# Start multiple projects in background
prx 1 dev -M
prx 2 dev -M
prx 3 start -M

# Check what's running
prx ps
```

### Handle Port Conflicts

```bash
# Auto-resolve port conflicts
prx 1 dev --force

# Or interactive resolution
prx 1 dev
# Follow the prompts
```

## Shell Integration

Add this to your `~/.zshrc` or `~/.bashrc` for easier navigation:

```bash
prxcd() {
  eval "$(prx cd $@)"
}
```

Then use:

```bash
prxcd 1
prxcd "My Project"
```

## Next Steps

- [CLI Commands](/docs/cli/overview) - Explore all available commands
- [Advanced Features](/docs/cli/advanced-features) - Learn about intelligent script selection and port management
- [Examples](/docs/examples/basic-workflow) - See more detailed examples

