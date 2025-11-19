const esbuild = require('esbuild');
const path = require('path');

const isWatch = process.argv.includes('--watch');

// Find node_modules - check local first, then workspace root
const localNodeModules = path.join(__dirname, 'node_modules');
const rootNodeModules = path.join(__dirname, '../../node_modules');
const nodeModulesPath = require('fs').existsSync(localNodeModules) ? localNodeModules : rootNodeModules;

const buildOptions = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'dist/extension.js',
  external: ['vscode'],
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  sourcemap: true,
  minify: !isWatch,
  logLevel: 'info',
  resolveExtensions: ['.ts', '.js', '.json'],
  nodePaths: [nodeModulesPath],
};

if (isWatch) {
  esbuild
    .context(buildOptions)
    .then((ctx) => {
      ctx.watch();
      console.log('Watching extension files...');
    })
    .catch((err) => {
      console.error('Build failed:', err);
      process.exit(1);
    });
} else {
  esbuild
    .build(buildOptions)
    .then(() => {
      console.log('Extension build complete');
    })
    .catch((err) => {
      console.error('Build failed:', err);
      process.exit(1);
    });
}

