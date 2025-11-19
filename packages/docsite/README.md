# PROJAX Documentation Site

The official documentation site for the PROJAX project management suite, built with Docusaurus.

## Development

```bash
# Install dependencies (from root)
npm install

# Start development server
npm run dev:docsite

# Or from this directory
npm start
```

The site will be available at `http://localhost:3000`.

## Building

```bash
# Build for production
npm run build:docsite

# Or from this directory
npm run build
```

The built site will be in the `build/` directory.

## Structure

- `docs/` - Documentation markdown files
- `static/` - Static assets (images, examples)
- `src/` - Custom React components and CSS
- `docusaurus.config.ts` - Docusaurus configuration
- `sidebars.ts` - Navigation structure

## Documentation

This site serves as the single source of truth for all PROJAX packages:
- CLI documentation
- API reference
- Core package docs
- Desktop app guide
- Prxi (TUI) documentation
- Examples and tutorials
- Troubleshooting guides

