# Prxi Development

Development setup and guidelines for Prxi.

## Development Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Terminal emulator

### Clone and Install

```bash
git clone https://github.com/josetwentyfour/projax.git
cd projax
npm install
```

### Development Mode

Run in development mode:

```bash
# From root
npm run dev:prxi

# Or from package
cd packages/prxi
npm run dev
```

## Project Structure

```
packages/prxi/
├── src/
│   └── index.tsx    # Main Prxi component
├── package.json
└── tsconfig.json
```

## Architecture

Prxi is built with:
- **Ink**: React-like library for terminal UIs
- **React**: Component-based architecture
- **TypeScript**: Type safety
- **@projax/core**: Shared database and types

## Building

Build Prxi:

```bash
cd packages/prxi
npm run build
```

Or from root:

```bash
npm run build:prxi
```

## Development Tips

### Hot Reload

Changes to source code hot-reload automatically in development mode.

### Debugging

Use `console.log` for debugging:
- Output appears in terminal
- Useful for development
- Remove before production

### Terminal Testing

Test in different terminals:
- iTerm2 (macOS)
- Terminal.app (macOS)
- Alacritty
- Windows Terminal

### Component Development

Prxi uses React components:
- Standard React patterns
- Ink-specific components
- Terminal-aware rendering

## Testing

Run tests (if available):

```bash
cd packages/prxi
npm test
```

## Related Documentation

- [Prxi Overview](/docs/prxi/overview) - Prxi overview
- [CLI Prxi Command](/docs/cli/commands/prxi) - Using Prxi from CLI

