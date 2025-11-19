# Troubleshooting: Script Execution

Common script execution issues.

## Problem: Script Not Found

**Error:** "Script not found" or "Script does not exist".

### Solution 1: List Available Scripts

```bash
prx scripts 1
```

### Solution 2: Check Project Type

Verify project type is supported:
- Node.js (package.json)
- Python (pyproject.toml)
- Rust (Cargo.toml)
- Go (go.mod or Makefile)
- Makefile

### Solution 3: Verify Script Exists

```bash
# Get project path
prx pwd 1

# Check config file
cd $(prx pwd 1)
cat package.json  # or appropriate config
```

## Problem: Script Fails to Run

**Error:** Script execution fails with errors.

### Solution 1: Run in Foreground

```bash
# Remove background flag to see errors
prx 1 dev  # Instead of prx 1 dev -M
```

### Solution 2: Run Script Directly

```bash
# Navigate to project
cd $(prx pwd 1)

# Run script directly
npm run dev  # or appropriate command
```

### Solution 3: Check Dependencies

```bash
# Ensure dependencies are installed
cd $(prx pwd 1)
npm install  # or appropriate command
```

## Problem: Wrong Script Runner

**Error:** Wrong package manager or runner used.

### Solution: Check Project Type

projax auto-detects project type. If wrong:

1. Check config file exists
2. Verify project structure
3. Try specifying runner manually (if supported)

## Problem: Script Runs But Fails

**Error:** Script starts but exits with error.

### Solution 1: Check Logs

```bash
# If running in background
tail -f ~/.projax/logs/process-*.log
```

### Solution 2: Check Port Conflicts

```bash
# Port conflicts can cause failures
prx 1 dev --force
```

### Solution 3: Run with Verbose Output

```bash
# Run in foreground to see all output
prx 1 dev
```

## Problem: Background Script Exits Immediately

**Symptom:** Background process starts then stops.

### Solution 1: Check Logs

```bash
# View logs for errors
tail -f ~/.projax/logs/process-*.log
```

### Solution 2: Run in Foreground

```bash
# See what's happening
prx 1 dev
```

### Solution 3: Check Script Output

The script may be exiting normally. Check if it's supposed to run continuously.

## Related Documentation

- [CLI Commands](/docs/cli/commands/run) - Script execution commands
- [Advanced Features](/docs/cli/advanced-features) - Script selection

