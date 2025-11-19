# Multi-Project Management

Managing multiple projects efficiently with projax.

## Adding Multiple Projects

Add all your projects at once:

```bash
prx add ~/projects/project1 --name "Project 1"
prx add ~/projects/project2 --name "Project 2"
prx add ~/projects/project3 --name "Project 3"
prx add ~/projects/project4 --name "Project 4"
```

## Scanning All Projects

Scan all projects for tests and ports:

```bash
prx scan
```

This scans every project and updates:
- Test files
- Port information
- Framework detection

## Running Multiple Projects

### Start All Projects

```bash
# Run all projects in background
prx 1 dev -M
prx 2 dev -M
prx 3 start -M
prx 4 dev -M
```

### Check Running Processes

```bash
prx ps
```

Shows all running background processes with:
- Process IDs
- Project names
- Scripts running
- Running time
- Log file locations

## Organizing Projects

### View with Ports

```bash
prx list --ports
```

See detailed port information for all projects.

### Filter by Port

Use port information to avoid conflicts:

```bash
# List shows ports
prx list

# Check for conflicts before running
prx 1 dev  # Uses port 3000
prx 2 dev  # Uses port 3001 (no conflict)
```

## Managing Background Processes

### Start Multiple

```bash
prx 1 dev -M
prx 2 dev -M
prx 3 start -M
```

### Stop All

```bash
# Get PIDs
prx ps

# Stop each
prx stop 12345
prx stop 12346
prx stop 12347
```

## Using Different Interfaces

### Terminal UI

```bash
prx i
```

Navigate through all projects, scan, view details.

### Desktop App

```bash
prx web
```

Visual interface for managing all projects.

## Workflow Example

```bash
# Morning: Start all projects
prx 1 dev -M
prx 2 dev -M
prx 3 start -M

# Check status
prx ps
prx list

# Afternoon: Stop all
prx stop <pid1>
prx stop <pid2>
prx stop <pid3>

# Evening: Scan all for updates
prx scan
```

## Tips

### Use Project IDs

Project IDs are more reliable than names:

```bash
prx 1 dev    # Better
prx "Project 1" dev  # Works, but slower
```

### Batch Operations

Create shell functions for common operations:

```bash
prxstartall() {
  prx 1 dev -M
  prx 2 dev -M
  prx 3 start -M
}

prxstopall() {
  prx ps | grep -o 'PID [0-9]*' | awk '{print $2}' | xargs -I {} prx stop {}
}
```

## Next Steps

- [Port Conflict Resolution](/docs/examples/port-conflict-resolution) - Handling conflicts
- [Background Processes](/docs/examples/background-processes) - Managing background tasks

