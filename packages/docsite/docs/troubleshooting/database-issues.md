# Troubleshooting: Database Issues

Common database issues and solutions.

## Problem: Database Errors or Corruption

**Symptom:** Errors when running commands, data missing.

### Solution 1: Backup Database

```bash
# Backup before troubleshooting
cp ~/.projax/data.json ~/.projax/data.json.backup
```

### Solution 2: Check Database File

```bash
# Verify file exists
ls -la ~/.projax/data.json

# Check file is valid JSON
cat ~/.projax/data.json | jq .
```

### Solution 3: Reset Database

⚠️ **Warning:** This deletes all data!

```bash
# Remove database
rm ~/.projax/data.json

# Will be recreated on next use
```

## Problem: Database Not Found

**Symptom:** "Database not found" errors.

### Solution: Database Auto-Creation

The database is created automatically on first use. If it's not created:

```bash
# Ensure directory exists
mkdir -p ~/.projax

# Run any command to create database
prx list
```

## Problem: Migration Issues

**Symptom:** SQLite migration fails or incomplete.

### Solution 1: Check SQLite File

```bash
# Check if SQLite file exists
ls -la ~/.projax/dashboard.db
```

### Solution 2: Manual Migration

```bash
# Backup SQLite
cp ~/.projax/dashboard.db ~/.projax/dashboard.db.backup

# Remove JSON database to trigger migration
rm ~/.projax/data.json

# Run any command to trigger migration
prx list
```

### Solution 3: Check Migration Logs

Check console output for migration errors.

## Problem: Data Not Persisting

**Symptom:** Changes not saved between sessions.

### Solution 1: Check File Permissions

```bash
# Check permissions
ls -la ~/.projax/data.json

# Fix if needed
chmod 644 ~/.projax/data.json
```

### Solution 2: Check Disk Space

```bash
# Check available space
df -h ~
```

### Solution 3: Verify Write Access

```bash
# Test write access
echo '{}' > ~/.projax/test.json
rm ~/.projax/test.json
```

## Problem: Concurrent Access Issues

**Symptom:** Data corruption with multiple processes.

### Solution: Database Uses File Locking

The database uses file-based locking. If issues persist:

1. Ensure only one process writes at a time
2. Close other projax instances
3. Restart processes

## Related Documentation

- [API Database](/docs/api/database) - Database management
- [Core Database](/docs/core/database) - Database architecture

