# Database

The API uses a JSON-based database stored locally on your machine.

## Database Location

- **macOS/Linux**: `~/.projax/data.json`
- **Windows**: `%USERPROFILE%\.projax\data.json`

The directory structure is created automatically when you first use projax.

## Database Format

The database is a single JSON file with the following structure:

```json
{
  "projects": [],
  "tests": [],
  "jenkins_jobs": [],
  "project_ports": [],
  "settings": []
}
```

## Database Management

The database is managed by the `@projax/core` package using lowdb. All operations are atomic and the database is automatically saved after each operation.

## Migration from SQLite

If you're upgrading from version 1.2 or earlier, the API will automatically migrate your SQLite database to JSON format on first start.

### Migration Process

1. Checks for SQLite database at `~/.projax/dashboard.db`
2. If found and JSON database doesn't exist:
   - Reads all data from SQLite
   - Converts to JSON format
   - Writes to `~/.projax/data.json`
   - Backs up SQLite file to `~/.projax/dashboard.db.backup`

### Migration Notes

- All data is preserved
- Original SQLite file is backed up
- Migration is automatic and one-time
- No manual intervention required

## Database Operations

All database operations are handled through the API or CLI. Direct file manipulation is not recommended.

### Backup

To backup your database:

```bash
# macOS/Linux
cp ~/.projax/data.json ~/.projax/data.json.backup

# Windows
copy %USERPROFILE%\.projax\data.json %USERPROFILE%\.projax\data.json.backup
```

### Restore

To restore from backup:

```bash
# macOS/Linux
cp ~/.projax/data.json.backup ~/.projax/data.json

# Windows
copy %USERPROFILE%\.projax\data.json.backup %USERPROFILE%\.projax\data.json
```

### Reset

To start fresh (⚠️ deletes all data):

```bash
# macOS/Linux
rm ~/.projax/data.json

# Windows
del %USERPROFILE%\.projax\data.json
```

The database will be recreated on next use.

## Database Schema

See [Data Models](/docs/api/data-models) for complete schema documentation.

## Performance

The JSON database is optimized for:
- Fast reads and writes
- Small to medium datasets (hundreds of projects)
- Local development use cases

For very large datasets, consider:
- Regular cleanup of old test records
- Removing unused projects
- Archiving old data

## Related Documentation

- [Data Models](/docs/api/data-models) - Complete data structure reference
- [API Overview](/docs/api/overview) - API architecture

