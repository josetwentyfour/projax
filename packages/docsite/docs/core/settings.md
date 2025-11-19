# Settings Management

The core package provides settings management for storing user preferences and configuration.

## Settings Storage

Settings are stored in the database:

```typescript
interface Setting {
  key: string;
  value: string;
  updated_at: number;
}
```

## Usage

### Get All Settings

```typescript
import { getDatabaseManager } from '@projax/core';

const db = getDatabaseManager();
const settings = db.getAllSettings();
// Returns: Record<string, string>
```

### Get a Setting

```typescript
const value = db.getSetting('theme');
// Returns: string | null
```

### Set a Setting

```typescript
db.setSetting('theme', 'dark');
// Automatically saved to database
```

## Common Settings

While you can store any key-value pair, common settings include:

- `theme`: UI theme preference
- `default_port`: Default port for new projects
- `auto_scan`: Whether to auto-scan on add

## API Access

Settings can be accessed via the API:

```bash
# Get all settings
curl http://localhost:3001/api/settings

# Get a specific setting
curl http://localhost:3001/api/settings/theme

# Update a setting
curl -X PUT http://localhost:3001/api/settings/theme \
  -H "Content-Type: application/json" \
  -d '{"value": "dark"}'
```

## Related Documentation

- [API Reference](/docs/core/api-reference) - Settings functions
- [API Settings](/docs/api/endpoints#settings) - Settings endpoints

