# prx scripts

List all available scripts for a project.

## Syntax

```bash
prx scripts [project]
```

## Description

Lists all available scripts for a project. If no project is specified, you'll be prompted to select one interactively.

## Examples

### Interactive selection

```bash
prx scripts
```

You'll be prompted to select a project from a list.

### List scripts for specific project by ID

```bash
prx scripts 1
```

### List scripts for specific project by name

```bash
prx scripts "My Project"
```

## Output

Shows:
- Script name
- Command that will be executed
- Runner type (npm, yarn, pnpm, python, poetry, cargo, go, make)

## Example Output

```
Available scripts for "Frontend App":

  dev
    Command: npm run dev
    Runner: npm

  build
    Command: npm run build
    Runner: npm

  test
    Command: npm test
    Runner: npm

  start
    Command: npm start
    Runner: npm
```

## Supported Project Types

- **Node.js**: Scripts from `package.json`
- **Python**: Scripts from `pyproject.toml` (Poetry)
- **Rust**: Common `cargo` commands
- **Go**: Common `go` commands or Makefile targets
- **Makefile**: Makefile targets

## Related Commands

- [`prx run`](/docs/cli/commands/run) - Run a specific script
- [`prx <project> [script]`](/docs/cli/advanced-features#intelligent-script-selection) - Run with intelligent selection

