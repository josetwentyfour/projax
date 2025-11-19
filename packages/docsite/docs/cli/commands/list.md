# prx list

List all tracked projects in a formatted table.

## Syntax

```bash
prx list [options]
```

## Options

- `-v, --verbose`: Show detailed information (legacy format)
- `--ports`: Show detailed port information per script

## Description

Displays all tracked projects in a formatted table. Projects are sorted by ID.

## Examples

### Default table view

```bash
prx list
```

Output shows:
- **ID**: Project ID
- **Name**: Project name (custom or directory name)
- **Path**: Project directory path (truncated if long)
- **Ports**: Detected ports (comma-separated) or "N/A"
- **Tests**: Number of test files found
- **Last Scanned**: Timestamp of last test scan

### Detailed port information

```bash
prx list --ports
```

Shows detailed port information grouped by script name.

### Legacy verbose format

```bash
prx list --verbose
```

Shows detailed information in the legacy format.

## Port Information

Ports are automatically displayed if:
- They were detected during project scanning
- They're less than 24 hours old (auto-rescanned if stale)

## Example Output

```
Projects (3):

┌────┬──────────────────┬──────────────────────────────┬──────────┬───────┬─────────────┐
│ ID │ Name             │ Path                          │ Ports    │ Tests │ Last Scanned│
├────┼──────────────────┼──────────────────────────────┼──────────┼───────┼─────────────┤
│ 1  │ API Server       │ ~/projects/api-server         │ 3001     │ 12    │ 2h ago      │
│ 2  │ Frontend App     │ ~/projects/frontend           │ 3000,5173│ 45    │ 1d ago      │
│ 3  │ Mobile App       │ ~/projects/mobile            │ N/A      │ 8     │ 3h ago      │
└────┴──────────────────┴──────────────────────────────┴──────────┴───────┴─────────────┘
```

## Related Commands

- [`prx add`](/docs/cli/commands/add) - Add a new project
- [`prx scan`](/docs/cli/commands/scan) - Scan projects for updates
- [`prx scan-ports`](/docs/cli/commands/scan-ports) - Manually scan for ports

