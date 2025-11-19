# Installation

## Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Comes with Node.js

## Global Installation

Install PROJAX globally using npm:

```bash
npm install -g projax
```

After installation, the `prx` command will be available globally in your terminal.

## Verify Installation

Check that PROJAX is installed correctly:

```bash
prx --help
```

You should see the PROJAX welcome screen with available commands.

## Database Setup

The database is automatically created on first use. No manual setup required.

**Database Location:**
- **macOS/Linux**: `~/.projax/data.json`
- **Windows**: `%USERPROFILE%\.projax\data.json`

The directory structure is created automatically when you first run any `prx` command.

### Migration from SQLite (v1.2)

If you're upgrading from version 1.2 or earlier, your SQLite database will be automatically migrated to JSON format on first run. The original SQLite file will be backed up to `~/.projax/dashboard.db.backup`.

## API Server

The API server is automatically started when you launch the Desktop web interface (`prx web`). It can also be started manually:

```bash
# Start API server
prx api --start

# Check API status
prx api
```

**API Port:**
The API server automatically finds an available port in the range 3001-3010. The selected port is displayed in:
- CLI welcome screen
- Desktop app status bar
- `prx api` command output

## Development Installation

If you want to contribute to projax or run it from source:

```bash
# Clone the repository
git clone https://github.com/josetwentyfour/projax.git
cd projax

# Install dependencies
npm install

# Build all packages
npm run build

# Link CLI globally (optional)
cd packages/cli
npm link
```

## Next Steps

- [Quick Start Guide](/docs/getting-started/quick-start) - Get started with your first project
- [CLI Overview](/docs/cli/overview) - Learn about the command-line interface

