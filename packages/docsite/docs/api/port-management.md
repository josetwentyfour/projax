# Port Management

The API server automatically manages port allocation and discovery.

## Port Discovery

The API server automatically finds an available port in the range 38124-38133.

### Port Selection Process

1. Starts checking from port 3001
2. Tests each port sequentially
3. Selects the first available port
4. If no port is available, throws an error

### Port File

The selected port is written to `~/.projax/api-port.txt` for discovery by other components:

```bash
# Read the port
cat ~/.projax/api-port.txt
# Output: 3001
```

## Port Range

Default port range: **38124-38133**

This range is chosen to:
- Avoid conflicts with common development ports (3000, 8080, etc.)
- Provide multiple instances if needed
- Stay within common development port ranges

## Port Discovery Methods

### CLI Discovery

The CLI discovers the API port by:
1. Reading `~/.projax/api-port.txt`
2. If not found, trying common ports (3001-3005)
3. Checking health endpoint on each port

### Desktop App Discovery

The Desktop app uses the same discovery method as the CLI.

## Health Check

Verify the API is running on a specific port:

```bash
curl http://localhost:38124/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Port Conflicts

If a port is already in use:
- The API tries the next port in sequence
- If all ports are in use, startup fails with an error

### Resolving Port Conflicts

1. **Find what's using the port:**
   ```bash
   # macOS/Linux
   lsof -i :38124
   
   # Windows
   netstat -ano | findstr :38124
   ```

2. **Kill the process** (if safe to do so)

3. **Restart the API server**

## Multiple Instances

While not recommended, you can run multiple API instances:
- Each instance will find its own available port
- Each writes to a different port file (if configured)
- CLI/Desktop connect to the first available instance

## Related Documentation

- [Installation](/docs/api/installation) - Set up the API server
- [Integration](/docs/api/integration) - Integrate with the API

