# prx remove

Remove a project from the dashboard.

## Syntax

```bash
prx remove <project> [options]
```

## Options

- `-f, --force`: Skip confirmation prompt

## Description

Removes a project from the dashboard. The project directory and files are not deleted; only the project entry is removed from the database.

## Examples

### Remove with confirmation

```bash
prx remove 1
prx remove "My Project"
```

You'll be prompted to confirm before removal.

### Remove without confirmation

```bash
prx remove 1 --force
prx remove "My Project" -f
```

Removes the project immediately without prompting.

## What Gets Removed

- Project entry from database
- Associated test records
- Associated port records
- Project settings

## What Stays

- Project files and directory (not deleted)
- Log files (if any)
- Background processes (if running)

## Related Commands

- [`prx add`](/docs/cli/commands/add) - Add a project
- [`prx list`](/docs/cli/commands/list) - View all projects
- [`prx rename`](/docs/cli/commands/rename) - Rename a project

