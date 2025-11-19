# Prxi Usage

How to use Prxi, the interactive Terminal UI.

## Launching Prxi

Start Prxi:

```bash
prx i        # Short alias
prx prxi     # Full command
```

## Basic Navigation

### Navigate Projects

1. Use arrow keys (`↑`/`↓`) or vim bindings (`j`/`k`)
2. Current project is highlighted
3. Details panel updates automatically

### View Project Details

1. Select a project (navigate to it)
2. Details appear in the right panel
3. Use `Tab` to switch focus between panels

## Scanning Projects

### Scan for Tests

1. Select a project
2. Press `s`
3. Wait for scan to complete
4. View updated test information

### Scan for Ports

1. Select a project
2. Press `p`
3. Wait for scan to complete
4. View updated port information

## Viewing Information

### Available Scripts

1. Select a project
2. Press `r`
3. View list of available scripts
4. See commands and runner types

### Test Files

1. Select a project
2. View test files in details panel
3. See test frameworks and status

### Port Information

1. Select a project
2. View ports in details panel
3. See port numbers and config sources

## Stopping Scripts

1. Select a project
2. Press `x`
3. Confirm stopping scripts
4. Background processes are stopped

## Getting Help

Press `?` to show help:
- List of all keyboard shortcuts
- Command descriptions
- Navigation tips

Press `?` again or `q` to hide help.

## Quitting

Press `q` or `Esc` to quit Prxi.

## Common Workflows

### Quick Project Check

1. Launch: `prx i`
2. Navigate to project: `j`/`k`
3. View details: Check details panel
4. Quit: `q`

### Scan and Review

1. Launch: `prx i`
2. Navigate to project: `j`/`k`
3. Scan: `s`
4. View results: Check details panel
5. Quit: `q`

### Multi-Project Review

1. Launch: `prx i`
2. Navigate through projects: `j`/`k`
3. Scan each: `s`
4. Review all: Navigate and view
5. Quit: `q`

## Tips

### Efficient Navigation

- Use `j`/`k` for quick navigation (vim-style)
- Use arrow keys if more comfortable
- `Tab` to switch between panels quickly

### Quick Actions

- `s` for scanning (most common)
- `r` to see what scripts are available
- `?` for help when needed

### Terminal Size

Prxi works best with:
- Terminal width: 80+ columns
- Terminal height: 24+ rows
- Full-screen mode recommended

## Troubleshooting

### Can't See Projects

1. Check if projects exist: `prx list`
2. Add projects: `prx add`
3. Restart Prxi

### Keyboard Not Working

1. Try arrow keys instead of vim bindings
2. Check terminal keyboard settings
3. Try a different terminal emulator

### Display Issues

1. Resize terminal window
2. Check terminal supports ANSI colors
3. Try full-screen mode

## Related Documentation

- [Keyboard Shortcuts](/docs/prxi/keyboard-shortcuts) - Complete keyboard reference
- [Features](/docs/prxi/features) - All Prxi features

