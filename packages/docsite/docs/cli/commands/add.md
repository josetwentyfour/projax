# prx add

Add a project to the dashboard.

## Syntax

```bash
prx add [path] [options]
```

## Options

- `-n, --name <name>`: Set a custom name for the project (defaults to directory name)

## Description

Adds a project to the projax dashboard. If no path is provided, you'll be prompted to enter one interactively.

When adding a project, you'll be prompted to:
1. Enter a custom name (if not provided via `--name`)
2. Optionally scan for test files
3. Automatically scan for ports in configuration files

## Examples

### Add with custom name

```bash
prx add /path/to/project --name "My Awesome Project"
```

### Add with short flag

```bash
prx add /path/to/project -n "Frontend App"
```

### Interactive mode

```bash
prx add
```

You'll be prompted to:
- Enter the project path
- Enter a custom name (with directory name as default)

### Add with path only

```bash
prx add /path/to/project
```

Will prompt for name with directory name as default.

## What Happens

1. Project is added to the database with a unique ID
2. Project path is validated
3. Ports are automatically scanned from configuration files
4. Optionally scans for test files if you choose to

## Supported Project Types

The CLI automatically detects project types:
- Node.js (package.json)
- Python (pyproject.toml)
- Rust (Cargo.toml)
- Go (go.mod)
- Makefile projects

## Port Scanning

Ports are automatically extracted from:
- `vite.config.js/ts`
- `next.config.js/ts`
- `webpack.config.js`
- `angular.json`
- `nuxt.config.js/ts`
- `package.json` scripts
- `.env` files

## Related Commands

- [`prx list`](/docs/cli/commands/list) - View all projects
- [`prx scan`](/docs/cli/commands/scan) - Scan for tests and ports
- [`prx remove`](/docs/cli/commands/remove) - Remove a project

