# Troubleshooting: Port Conflicts

Common issues and solutions for port conflicts.

## Problem: Port Already in Use

**Error Message:**
```
⚠️  Port 3000 is already in use by process 12345 (node)
```

### Solution 1: Auto-Resolve

```bash
prx 1 dev --force
```

Automatically kills the process and retries.

### Solution 2: Interactive Resolution

```bash
prx 1 dev
# Follow the prompt: Kill process and continue? (y/N)
```

### Solution 3: Manual Resolution

```bash
# Find process
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 12345  # macOS/Linux
taskkill /F /PID 12345  # Windows

# Retry
prx 1 dev
```

## Problem: Multiple Projects Same Port

**Symptom:** Two projects try to use the same port.

### Solution: Configure Different Ports

```javascript
// vite.config.ts for project 1
export default {
  server: { port: 3000 }
}

// vite.config.ts for project 2
export default {
  server: { port: 3001 }
}
```

### Solution: Run Sequentially

```bash
# Run one at a time
prx 1 dev
# Stop when done
prx 2 dev
```

## Problem: Port Not Detected

**Symptom:** Port not shown in `prx list`.

### Solution: Manually Scan Ports

```bash
prx scan-ports 1
prx scan-ports  # All projects
```

### Solution: Check Config File

Ensure your config file is supported:
- Vite: `vite.config.js/ts`
- Next.js: `next.config.js/ts`
- Webpack: `webpack.config.js`
- Angular: `angular.json`
- Nuxt: `nuxt.config.js/ts`

## Problem: Port Conflict on Background Process

**Symptom:** Background process using port, new process can't start.

### Solution: Stop Background Process

```bash
# Find process
prx ps

# Stop it
prx stop <pid>
```

### Solution: Use Different Port

Configure the new project to use a different port.

## Related Documentation

- [Port Conflict Resolution Examples](/docs/examples/port-conflict-resolution) - Detailed examples
- [CLI Advanced Features](/docs/cli/advanced-features) - Port management features

