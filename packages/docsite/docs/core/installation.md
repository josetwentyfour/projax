# Core Installation

The core package is automatically included when you install projax. For development or direct usage, follow these steps.

## Installation

### As Part of projax

The core package is included in the global projax installation:

```bash
npm install -g projax
```

### For Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/josetwentyfour/projax.git
cd projax
npm install
```

Build the core package:

```bash
cd packages/core
npm install
npm run build
```

Or build from the root:

```bash
npm run build:core
```

## Usage in Your Project

If you want to use the core package directly in your project:

```bash
npm install @projax/core
```

Then import:

```typescript
import { getAllProjects, addProject } from '@projax/core';
```

## TypeScript Support

The package includes TypeScript definitions. No additional `@types` package needed.

## Next Steps

- [API Reference](/docs/core/api-reference) - Learn about available functions
- [Examples](/docs/core/examples) - See usage examples

