# Core Overview

The `@projax/core` package provides shared functionality used by all other PROJAX packages. It includes database management, test detection, port scanning, and settings management.

## Purpose

The core package serves as the foundation for all PROJAX functionality:
- Shared database operations
- Test framework detection
- Port extraction from config files
- Settings management
- Common utilities

## Installation

The core package is included when you install projax. For development:

```bash
cd packages/core
npm install
npm run build
```

## Architecture

The core package provides:
- **Database Manager**: JSON-based storage using lowdb
- **Test Detector**: Framework detection and file scanning
- **Port Scanner**: Extraction from configuration files
- **Settings Manager**: User preferences storage

## Usage

All other packages import from `@projax/core`:

```typescript
import {
  getDatabaseManager,
  getAllProjects,
  addProject,
  scanProject,
} from '@projax/core';
```

## Database

The core package manages a shared JSON database at:
- **macOS/Linux**: `~/.projax/data.json`
- **Windows**: `%USERPROFILE%\.projax\data.json`

## Next Steps

- [API Reference](/docs/core/api-reference) - Complete API documentation
- [Database](/docs/core/database) - Database management
- [Test Detection](/docs/core/test-detection) - Test framework detection

