# Desktop Development

Development setup and guidelines for the Desktop app.

## Development Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Git

### Clone and Install

```bash
git clone https://github.com/josetwentyfour/projax.git
cd projax
npm install
```

### Development Mode

Run in development mode with hot reload:

```bash
# From root
npm run dev:desktop

# Or from package
cd packages/desktop
npm run dev
```

## Project Structure

```
packages/desktop/
├── src/
│   ├── main/          # Electron main process
│   │   ├── main.ts    # Main entry point
│   │   ├── core.ts    # Core integration
│   │   └── preload.ts # Preload script
│   └── renderer/      # React UI
│       ├── App.tsx    # Main app component
│       └── components/ # UI components
├── package.json
└── vite.config.ts    # Vite configuration
```

## Building

### Development Build

```bash
cd packages/desktop
npm run build
```

### Production Build

```bash
cd packages/desktop
npm run build:prod
```

## Architecture

### Main Process

The main process (`src/main/main.ts`):
- Creates application window
- Manages API server lifecycle
- Handles window events
- Provides IPC handlers

### Renderer Process

The renderer (`src/renderer/`):
- React-based UI
- API client
- State management
- User interactions

### Preload Script

The preload script (`src/main/preload.ts`):
- Secure IPC bridge
- Exposes safe APIs
- Context isolation

## API Integration

The Desktop app communicates with the API:

```typescript
// Example API call
const response = await fetch(`http://localhost:${port}/api/projects`);
const projects = await response.json();
```

## Development Tips

### Hot Reload

Changes to renderer code hot-reload automatically. Main process changes require restart.

### Debugging

- **Renderer**: Use Chrome DevTools (View > Toggle Developer Tools)
- **Main Process**: Use VS Code debugger or `console.log`

### API Server

The API server starts automatically. To debug:
1. Start API manually: `npm run dev:api`
2. Check API logs
3. Test endpoints with curl

## Testing

Run tests (if available):

```bash
cd packages/desktop
npm test
```

## Related Documentation

- [Desktop Overview](/docs/desktop/overview) - Desktop app overview
- [API Documentation](/docs/api/overview) - API reference

