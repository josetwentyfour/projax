# Troubleshooting: Background Processes

Common issues with background processes.

## Problem: Background Process Not Starting

**Symptom:** Process doesn't start or immediately exits.

### Solution 1: Check Port Availability

```bash
# Check if port is available
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

### Solution 2: Check Log Files

```bash
# View recent logs
tail -f ~/.projax/logs/process-*.log
```

### Solution 3: Run in Foreground First

```bash
# Remove -M flag to see errors
prx 1 dev
```

## Problem: Background Process Not Stopping

**Symptom:** `prx stop` doesn't stop the process.

### Solution 1: Force Kill

```bash
# Get PID
prx ps

# Force kill
kill -9 <pid>  # macOS/Linux
taskkill /F /PID <pid>  # Windows
```

### Solution 2: Check Process File

```bash
# Check processes file
cat ~/.projax/processes.json
```

### Solution 3: Clean Process File

```bash
# Remove processes file (will be recreated)
rm ~/.projax/processes.json
```

## Problem: Logs Not Appearing

**Symptom:** No log files created.

### Solution 1: Check Log Directory

```bash
# Ensure directory exists
ls -la ~/.projax/logs/
```

### Solution 2: Check Permissions

```bash
# Check permissions
ls -la ~/.projax/

# Fix if needed
chmod 755 ~/.projax/logs/
```

### Solution 3: Verify Process is Running

```bash
# Check if process actually started
prx ps

# Check system processes
ps aux | grep <project-name>
```

## Problem: Too Many Background Processes

**Symptom:** Many processes running, system slow.

### Solution: Stop All Processes

```bash
# Get all PIDs
prx ps

# Stop each
prx stop <pid1>
prx stop <pid2>
# ... etc
```

### Solution: Clean Old Logs

```bash
# Remove logs older than 7 days
find ~/.projax/logs/ -name "*.log" -mtime +7 -delete
```

## Problem: Process Shows as Running But Isn't

**Symptom:** `prx ps` shows process, but it's not actually running.

### Solution: Clean Process File

```bash
# Remove and recreate
rm ~/.projax/processes.json

# Processes file will be recreated on next use
```

## Related Documentation

- [Background Process Examples](/docs/examples/background-processes) - Usage examples
- [CLI Commands](/docs/cli/commands/ps) - Process management commands

