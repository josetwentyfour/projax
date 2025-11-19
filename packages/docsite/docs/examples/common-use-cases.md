# Common Use Cases

Real-world use cases for projax.

## Daily Development Workflow

### Morning Setup

```bash
# Start all projects
prx 1 dev -M
prx 2 dev -M
prx 3 start -M

# Check status
prx ps
```

### During Development

```bash
# Navigate to project
prxcd 1

# Make changes, test locally
# Projects running in background

# Check logs if needed
tail -f ~/.projax/logs/process-*.log
```

### End of Day

```bash
# Stop all processes
prx ps | grep -o 'PID [0-9]*' | awk '{print $2}' | xargs -I {} prx stop {}

# Or use Desktop app
prx web
# Stop from UI
```

## Multi-Project Development

### Working on Related Projects

```bash
# Add related projects
prx add ~/projects/api --name "API"
prx add ~/projects/web --name "Web"
prx add ~/projects/mobile --name "Mobile"

# Start all
prx 1 dev -M  # API on 3001
prx 2 dev -M  # Web on 3000
prx 3 dev -M  # Mobile on 3002

# All running, can work on any
```

## Testing Workflow

### Scan Before Testing

```bash
# Scan all projects for tests
prx scan

# View test information
prx list
```

### Run Tests

```bash
# Run tests for specific project
prx 1 test

# Or in background
prx 1 test -M
```

## Port Management

### Avoid Conflicts

```bash
# Check ports before starting
prx list --ports

# Start projects with known ports
prx 1 dev  # Uses 3000
prx 2 dev  # Uses 3001 (different)
```

### Resolve Conflicts

```bash
# Auto-resolve
prx 1 dev --force

# Or interactive
prx 1 dev
# Follow prompts
```

## Project Organization

### Organize by Type

```bash
# Frontend projects
prx add ~/projects/react-app --name "React App"
prx add ~/projects/vue-app --name "Vue App"

# Backend projects
prx add ~/projects/api-server --name "API Server"
prx add ~/projects/microservice --name "Microservice"
```

### Quick Access

```bash
# Use aliases
alias prxfe='prxcd 1'  # Frontend
alias prxbe='prxcd 2'  # Backend
```

## Remote Development

### SSH into Server

```bash
# On remote server
prx list

# Start projects
prx 1 dev -M

# Check status
prx ps
```

## CI/CD Integration

### Pre-deployment Checks

```bash
# Scan all projects
prx scan

# Check for issues
prx list
```

## Team Collaboration

### Share Project List

```bash
# Export project list
prx list > projects.txt

# Share with team
# Team members can add same projects
```

## Monitoring

### Check All Projects

```bash
# List all with details
prx list --ports

# Check what's running
prx ps

# View logs
tail -f ~/.projax/logs/process-*.log
```

## Quick Tasks

### Find Project

```bash
# List all
prx list

# Or use TUI
prx i
# Navigate and find
```

### Quick Script Run

```bash
# Run without navigating
prx 1 build
prx 2 test
```

## Related Documentation

- [Basic Workflow](/docs/examples/basic-workflow) - Step-by-step guide
- [Multi-Project Management](/docs/examples/multi-project-management) - Managing multiple projects

