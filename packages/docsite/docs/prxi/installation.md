# Prxi Installation

Prxi is included in the projax installation.

## Installation

Install projax globally:

```bash
npm install -g projax
```

Prxi is included in the installation.

## Launching

Start Prxi:

```bash
prx i        # Short alias
prx prxi     # Full command
```

## Development Setup

For development or building from source:

```bash
# Clone repository
git clone https://github.com/projax/projax.git
cd projax

# Install dependencies
npm install

# Build Prxi
npm run build:prxi

# Or build all packages
npm run build
```

## Development Mode

Run in development mode:

```bash
# From root
npm run dev:prxi

# Or from package
cd packages/prxi
npm run dev
```

## System Requirements

- **Node.js**: Version 18.0.0 or higher
- **Terminal**: Terminal emulator that supports:
  - ANSI colors
  - Full-screen mode
  - Keyboard input
- **Operating System**: macOS, Linux, or Windows

## Terminal Compatibility

Prxi works best with:
- iTerm2 (macOS)
- Terminal.app (macOS)
- Alacritty
- Windows Terminal
- Most modern terminal emulators

## Troubleshooting

### Prxi Won't Start

1. Check Node.js version: `node --version` (should be >= 18.0.0)
2. Rebuild: `npm run build:prxi`
3. Check terminal compatibility

### Display Issues

1. Ensure terminal supports ANSI colors
2. Check terminal size (minimum 80x24)
3. Try a different terminal emulator

### Keyboard Not Working

1. Check terminal keyboard input settings
2. Try different key combinations
3. Use arrow keys instead of vim bindings

## Next Steps

- [Features](/docs/prxi/features) - Learn about Prxi features
- [Keyboard Shortcuts](/docs/prxi/keyboard-shortcuts) - All keyboard commands

