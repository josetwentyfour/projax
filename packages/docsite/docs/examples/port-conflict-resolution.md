# Port Conflict Resolution

How to handle port conflicts when running projects.

## Understanding Port Conflicts

Port conflicts occur when:
- A port is already in use by another process
- Multiple projects try to use the same port
- A previous process didn't shut down cleanly

## Automatic Detection

projax automatically detects port conflicts:

### Before Script Execution

```bash
prx 1 dev
# ⚠️  Port 3000 is already in use by process 12345 (node)
# Kill process 12345 (node) and continue? (y/N)
```

### From Error Messages

If a script fails with a port error, projax extracts the port:

```bash
prx 1 dev
# Error: Port 3000 is already in use
# ⚠️  Detected port conflict on port 3000
# Process 12345 (node) is using this port
# Kill process 12345 (node) and continue? (y/N)
```

## Interactive Resolution

### Step-by-Step

1. Run your script: `prx 1 dev`
2. Port conflict detected
3. Prompt appears: "Kill process and continue? (y/N)"
4. Type `y` to kill and continue
5. Type `n` to cancel

### Example

```bash
$ prx 1 dev
⚠️  Port 3000 is already in use by process 12345 (node)
Kill process 12345 (node) and continue? (y/N) y
✓ Process killed. Retrying...
✓ Started "My Project" (dev)
```

## Automatic Resolution

Use the `--force` or `-F` flag to auto-resolve:

```bash
prx 1 dev --force
```

This automatically:
1. Detects the port conflict
2. Kills the process using the port
3. Retries script execution

### Example

```bash
$ prx 1 dev --force
Port 3000 is already in use by process 12345 (node)
Killing process 12345 on port 3000...
✓ Process killed. Retrying...
✓ Started "My Project" (dev)
```

## Background Mode with Auto-Resolution

Combine background mode with auto-resolution:

```bash
prx 1 dev -M --force
```

Runs in background and auto-resolves any port conflicts.

## Manual Resolution

### Find Process Using Port

```bash
# macOS/Linux
lsof -i :3000

# Windows
netstat -ano | findstr :3000
```

### Kill Process Manually

```bash
# macOS/Linux
kill -9 $(lsof -ti:3000)

# Windows
taskkill /F /PID <pid>
```

### Then Retry

```bash
prx 1 dev
```

## Preventing Conflicts

### Use Different Ports

Configure projects to use different ports:

```javascript
// vite.config.ts
export default {
  server: {
    port: 3001  // Different from other projects
  }
}
```

### Check Ports Before Running

```bash
# List projects with ports
prx list --ports

# Check what's running
prx ps

# Plan your port usage
```

## Common Scenarios

### Scenario 1: Previous Process Still Running

```bash
# Problem: Previous dev server still running
prx 1 dev
# ⚠️  Port 3000 is already in use

# Solution: Auto-resolve
prx 1 dev --force
```

### Scenario 2: Multiple Projects Same Port

```bash
# Problem: Two projects use port 3000
prx 1 dev  # Uses 3000
prx 2 dev  # Also tries 3000

# Solution: Configure different ports
# Or run sequentially
prx 1 dev
# Stop when done
prx 2 dev
```

### Scenario 3: Background Process Conflict

```bash
# Problem: Background process using port
prx ps  # Shows process on port 3000

# Solution: Stop the process
prx stop <pid>

# Or auto-resolve
prx 1 dev --force
```

## Best Practices

1. **Use `--force` for automation**: Scripts and CI/CD
2. **Interactive for manual**: When you want control
3. **Check ports first**: Use `prx list --ports`
4. **Configure unique ports**: Avoid conflicts proactively

## Related Documentation

- [Background Processes](/docs/examples/background-processes) - Managing background tasks
- [Troubleshooting Port Conflicts](/docs/troubleshooting/port-conflicts) - Detailed troubleshooting

