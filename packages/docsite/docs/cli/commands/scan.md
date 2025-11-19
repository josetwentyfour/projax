# prx scan

Scan projects for test files and ports.

## Syntax

```bash
prx scan [project]
```

## Description

Scans projects for test files and ports. If no project is specified, all projects are scanned.

This command:
- Scans for test files (Jest, Vitest, Mocha)
- Scans for ports in configuration files
- Updates the database with findings

## Examples

### Scan all projects

```bash
prx scan
```

Scans all tracked projects for tests and ports.

### Scan specific project by ID

```bash
prx scan 1
```

### Scan specific project by name

```bash
prx scan "My Project"
```

## Test Detection

The scanner detects test files from:

- **Jest**: `*.test.js`, `*.test.ts`, `*.spec.js`, `*.spec.ts`, `__tests__/` directories
- **Vitest**: Same patterns as Jest
- **Mocha**: `*.test.js`, `*.spec.js`, `test/` directories

Detection is based on:
1. Framework configuration files (`jest.config.js`, `vitest.config.ts`, `.mocharc.js`)
2. `package.json` dependencies and test scripts
3. File naming patterns and directory structures

## Port Scanning

Ports are automatically extracted from:
- `vite.config.js/ts` - Vite server port
- `next.config.js/ts` - Next.js dev server port
- `webpack.config.js` - Webpack devServer port
- `angular.json` - Angular serve port
- `nuxt.config.js/ts` - Nuxt server port
- `package.json` - Scripts with `--port`, `-p`, or `PORT=` patterns
- `.env` files - `PORT`, `VITE_PORT`, `NEXT_PORT`, etc.

## Output

The scan command shows:
- Number of test files found
- Test framework detected
- Ports detected per script
- Any errors encountered

## Related Commands

- [`prx scan-ports`](/docs/cli/commands/scan-ports) - Scan only for ports
- [`prx list`](/docs/cli/commands/list) - View scan results
- [`prx add`](/docs/cli/commands/add) - Add a project (includes initial scan)

