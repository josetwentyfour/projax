# Background Process Management

Managing background processes with projax.

## Running in Background

### Basic Background Execution

```bash
prx 1 dev -M
```

Multiple flags supported:
- `-M` (shortest)
- `--background`
- `-b`
- `--daemon`

### With Auto-Resolution

```bash
prx 1 dev -M --force
```

Runs in background and auto-resolves port conflicts.

## Viewing Running Processes

### List All Processes

```bash
prx ps
```

Output shows:
- Process ID (PID)
- Project name
- Script name
- Running time
- Command executed
- Log file location
- URLs (if detected)

### Example Output

```
Running processes (3):

  PID 12345: projax (dev) - 5m 30s
    Command: npm run dev
    Logs: /Users/username/.projax/logs/process-1234567890-dev.log
    URLs: http://localhost:3000

  PID 12346: Frontend App (start) - 2m 15s
    Command: npm start
    Logs: /Users/username/.projax/logs/process-1234567891-start.log
    URLs: http://localhost:3001
```

## Stopping Processes

### Stop by PID

```bash
prx stop 12345
```

### Stop All Processes

```bash
# Get PIDs and stop each
prx ps | grep -o 'PID [0-9]*' | awk '{print $2}' | xargs -I {} prx stop {}
```

## Viewing Logs

### Log File Location

Logs are stored in `~/.projax/logs/`:

```
process-<timestamp>-<script>.log
```

### View Recent Log

```bash
tail -f ~/.projax/logs/process-*.log
```

### View Specific Log

```bash
# From prx ps output
tail -f /Users/username/.projax/logs/process-1234567890-dev.log
```

## Workflow Examples

### Start Multiple Projects

```bash
# Start all in background
prx 1 dev -M
prx 2 dev -M
prx 3 start -M

# Check status
prx ps
```

### Monitor Logs

```bash
# Start project
prx 1 dev -M

# Get log path from prx ps
prx ps

# View logs
tail -f ~/.projax/logs/process-*.log
```

### Stop All at Once

```bash
# Get all PIDs
prx ps

# Stop each
prx stop <pid1>
prx stop <pid2>
prx stop <pid3>
```

## Process Management

### Check if Process is Running

```bash
prx ps | grep "My Project"
```

### Find Process by Port

```bash
prx ps | grep "3000"
```

### Get Process Details

```bash
# Full details from prx ps
prx ps

# Or check process directly
ps aux | grep <pid>
```

## Log Management

### View All Logs

```bash
ls -la ~/.projax/logs/
```

### Clean Old Logs

```bash
# Remove logs older than 7 days
find ~/.projax/logs/ -name "*.log" -mtime +7 -delete
```

### Archive Logs

```bash
# Archive logs
tar -czf logs-archive.tar.gz ~/.projax/logs/
```

## Best Practices

1. **Use background for long-running tasks**: Dev servers, API servers
2. **Monitor with `prx ps`**: Check what's running
3. **View logs when needed**: Debug issues
4. **Clean up old processes**: Stop when done
5. **Use `--force` with background**: Auto-resolve conflicts

## Troubleshooting

### Process Not Starting

1. Check port availability
2. Check log files for errors
3. Try running in foreground first

### Process Not Stopping

1. Check if process exists: `ps aux | grep <pid>`
2. Force kill if needed: `kill -9 <pid>`
3. Check process file: `~/.projax/processes.json`

### Logs Not Appearing

1. Check log directory exists
2. Check file permissions
3. Verify process is actually running

## Related Documentation

- [Basic Workflow](/docs/examples/basic-workflow) - Getting started
- [Troubleshooting Background Processes](/docs/troubleshooting/background-processes) - Common issues

