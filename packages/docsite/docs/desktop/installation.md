# Desktop Installation

The Desktop app is included in the projax installation.

## Installation

Install projax globally:

```bash
npm install -g projax
```

The Desktop app is included in the installation.

## Launching

Start the Desktop app:

```bash
prx web
```

The first launch may take a moment as the app initializes.

## Development Setup

For development or building from source:

```bash
# Clone repository
git clone https://github.com/josetwentyfour/projax.git
cd projax

# Install dependencies
npm install

# Build Desktop app
npm run build:desktop

# Or build all packages
npm run build
```

## Development Mode

Run in development mode with hot reload:

```bash
# From root
npm run dev:desktop

# Or from package
cd packages/desktop
npm run dev
```

## Building

Build the Desktop app for production:

```bash
cd packages/desktop
npm run build
```

## System Requirements

- **Node.js**: Version 18.0.0 or higher
- **Operating System**: macOS, Linux, or Windows
- **Memory**: 100MB+ available RAM
- **Disk Space**: 50MB+ for installation

## Troubleshooting

### App Won't Start

1. Check Node.js version: `node --version` (should be >= 18.0.0)
2. Rebuild: `npm run build:desktop`
3. Check API server: `prx api`

### API Server Not Starting

The Desktop app automatically starts the API server. If it fails:
1. Check port availability (3001-3010)
2. Manually start API: `prx api --start`
3. Check logs for errors

## Next Steps

- [Features](/docs/desktop/features) - Learn about Desktop features
- [Usage](/docs/desktop/usage) - How to use the Desktop app

