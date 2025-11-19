# Core Database

The core package manages a shared JSON database for all projax data.

## Database Location

- **macOS/Linux**: `~/.projax/data.json`
- **Windows**: `%USERPROFILE%\.projax\data.json`

## Database Format

The database is a single JSON file managed by lowdb:

```json
{
  "projects": [],
  "tests": [],
  "jenkins_jobs": [],
  "project_ports": [],
  "settings": []
}
```

## Database Manager

The `DatabaseManager` class handles all database operations:

```typescript
import { getDatabaseManager } from '@projax/core';

const db = getDatabaseManager();
```

### Initialization

The database is automatically initialized on first use:
- Creates the `.projax` directory if it doesn't exist
- Creates `data.json` with default schema if it doesn't exist
- Loads existing data if the file exists

### Operations

All operations are atomic and automatically saved:

```typescript
// Add project (automatically saved)
const project = db.addProject('My Project', '/path/to/project');

// Update project (automatically saved)
const updated = db.updateProject(1, { name: 'Updated Name' });

// Remove project (automatically saved)
db.removeProject(1);
```

## Schema

See [API Data Models](/docs/api/data-models) for complete schema documentation.

## Thread Safety

The database uses file-based locking to ensure thread safety:
- Multiple processes can read simultaneously
- Writes are serialized
- No data corruption from concurrent access

## Migration

The database supports automatic migration from SQLite (v1.2):
- Detects SQLite database on first use
- Migrates all data to JSON format
- Backs up original SQLite file

## Performance

Optimized for:
- Fast reads and writes
- Small to medium datasets
- Local development use cases

## Related Documentation

- [API Reference](/docs/core/api-reference) - Database functions
- [API Database](/docs/api/database) - Database management guide

