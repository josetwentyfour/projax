# Desktop Overview

The projax Desktop app is an Electron-based application that provides a visual interface for managing your development projects.

## Features

- **Visual Project Management**: See all your projects in a beautiful UI
- **File System Picker**: Easy project addition with native file picker
- **Project Details**: View project information, tests, and ports
- **Scan Projects**: Trigger test scans directly from the UI
- **Real-time Updates**: See changes as they happen
- **Cross-platform**: Works on macOS, Linux, and Windows

## Architecture

The Desktop app consists of:
- **Electron Main Process**: Manages the application window and API server
- **React Renderer**: Provides the user interface
- **API Integration**: Communicates with the projax API server

## Installation

The Desktop app is included when you install projax:

```bash
npm install -g projax
```

## Launching

Start the Desktop app:

```bash
prx web
```

The API server is automatically started when you launch the Desktop app.

## Development Mode

Run in development mode with hot reload:

```bash
prx web --dev
```

Or from the package:

```bash
cd packages/desktop
npm run dev
```

## Next Steps

- [Installation](/docs/desktop/installation) - Detailed installation guide
- [Features](/docs/desktop/features) - Complete feature list
- [Usage](/docs/desktop/usage) - How to use the Desktop app

