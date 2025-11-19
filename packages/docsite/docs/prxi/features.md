# Prxi Features

Complete overview of Prxi (Terminal UI) features.

## Project List View

### Navigation

- **Arrow Keys**: Navigate up/down through projects
- **Vim Bindings**: Use `j` (down) and `k` (up)
- **Selection**: Current project is highlighted

### Project Information

Each project shows:
- Project ID
- Project name
- Project path (truncated if long)
- Quick status indicators

## Project Details Panel

### Information Display

View comprehensive project details:
- Project name and path
- Detected framework
- Number of test files
- Detected ports
- Last scanned timestamp

### Scripts View

See available scripts:
- Script names
- Commands that will be executed
- Runner types

### Tests View

View detected test files:
- Test file paths
- Test frameworks
- Test status (if available)

### Ports View

See detected ports:
- Port numbers
- Associated scripts
- Config sources

## Interactive Actions

### Scan Project

Press `s` to scan the selected project:
- Scans for test files
- Updates port information
- Shows progress and results

### Scan Ports

Press `p` to scan ports for the selected project:
- Extracts ports from config files
- Updates port information
- Shows detected ports

### Show Scripts

Press `r` to view available scripts:
- Lists all scripts
- Shows commands
- Displays runner types

### Stop Scripts

Press `x` to stop all scripts for the selected project:
- Stops running background processes
- Shows confirmation
- Updates process list

## Keyboard Navigation

### Panel Switching

- **Tab**: Switch between panels
- **Left Arrow**: Move to project list
- **Right Arrow**: Move to details panel

### Scrolling

- **Up/Down**: Scroll through lists
- **Page Up/Down**: Fast scrolling (if supported)
- **Home/End**: Jump to top/bottom (if supported)

## Help Screen

Press `?` to show help:
- List of all keyboard shortcuts
- Command descriptions
- Navigation tips

## Color Scheme

Prxi uses a color scheme that:
- Matches the desktop app design
- Provides good contrast
- Works in light and dark terminals
- Supports terminal themes

## Real-time Updates

Prxi updates in real-time:
- New projects appear automatically
- Scan results update immediately
- Port information refreshes

## Full-screen Mode

Prxi runs in full-screen mode:
- Uses entire terminal window
- Optimized layout
- Responsive to terminal size

## Next Steps

- [Keyboard Shortcuts](/docs/prxi/keyboard-shortcuts) - Complete keyboard reference
- [Usage Guide](/docs/prxi/usage) - How to use Prxi

