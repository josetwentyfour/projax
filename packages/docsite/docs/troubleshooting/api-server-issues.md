# Troubleshooting: API Server Issues

Common API server issues and solutions.

## Problem: API Server Not Running

**Symptom:** API endpoints not responding.

### Solution 1: Check API Status

```bash
prx api
```

### Solution 2: Start API Manually

```bash
prx api --start
```

### Solution 3: Check Port Availability

```bash
# Check if ports 3001-3010 are available
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows
```

## Problem: API Server Won't Start

**Symptom:** `prx api --start` fails.

### Solution 1: Check Port Range

All ports 3001-3010 may be in use:

```bash
# Check each port
for port in {3001..3010}; do
  lsof -i :$port  # macOS/Linux
done
```

### Solution 2: Kill Conflicting Processes

```bash
# Find and kill processes on ports
lsof -ti:3001 | xargs kill -9  # macOS/Linux
```

### Solution 3: Check Logs

Check console output for error messages.

## Problem: API Connection Errors

**Symptom:** Desktop app or CLI can't connect to API.

### Solution 1: Check API Port

```bash
# Read port from file
cat ~/.projax/api-port.txt

# Or check status
prx api
```

### Solution 2: Test Health Endpoint

```bash
# Get port
PORT=$(cat ~/.projax/api-port.txt)

# Test health
curl http://localhost:$PORT/health
```

### Solution 3: Restart API Server

```bash
# Stop (if running)
# Then start
prx api --start
```

## Problem: CORS Errors

**Symptom:** Browser console shows CORS errors.

### Solution: CORS is Enabled

CORS is enabled by default. If issues persist:

1. Check API is running
2. Verify correct port
3. Check browser console for details

## Problem: API Port File Missing

**Symptom:** `~/.projax/api-port.txt` doesn't exist.

### Solution: Port File Auto-Creation

The port file is created when API starts. If missing:

```bash
# Start API
prx api --start

# File will be created automatically
```

## Problem: Multiple API Instances

**Symptom:** Multiple API servers running.

### Solution: Stop All Instances

```bash
# Find all node processes
ps aux | grep "api"

# Kill API processes
kill <pid>
```

## Related Documentation

- [API Installation](/docs/api/installation) - API setup
- [API Port Management](/docs/api/port-management) - Port configuration

