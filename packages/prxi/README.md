# PROJAX Terminal UI (prxi)

Interactive terminal UI for the PROJAX project dashboard, built with Ink.

## Features

- **Project List View**: Browse all tracked projects with descriptions
- **Project Details**: View project information, scripts, and ports
- **Keyboard Navigation**: Vim-style keybindings (hjkl) and arrow keys
- **Scan Projects**: Scan for tests and ports without leaving the terminal
- **Color Scheme**: Matches the desktop app design

## Usage

### Launch

```bash
# From the projax CLI
prx prxi

# Or using the short alias
prx i
```

### Keyboard Controls

#### Navigation
- `↑` / `k` - Move up in project list
- `↓` / `j` - Move down in project list  
- `Enter` - Select project (updates details panel)

#### Actions
- `s` - Scan selected project for tests
- `p` - Scan ports for selected project

#### General
- `?` - Show help screen
- `q` / `Esc` - Quit

## Development

### Run in Development Mode

```bash
# From the prxi package
npm run dev

# Or from project root
npm run dev:prxi
```

### Build

```bash
# From the prxi package
npm run build

# Or from project root
npm run build:prxi
```

## Architecture

The terminal UI is built with:
- **Ink**: React-like library for building terminal UIs
- **React**: Component-based architecture
- **projax-core**: Shared database and types

The UI runs using `tsx` which allows running TypeScript + JSX directly without complex bundling.

