#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

// Check if @electron/rebuild is available
let rebuild;
try {
  // Try to require @electron/rebuild - it should be in node_modules
  const rebuildModule = require.resolve('@electron/rebuild');
  rebuild = require(rebuildModule).rebuild;
} catch (error) {
  // If not found, try to find it in parent node_modules (workspace scenario)
  try {
    const parentRebuild = require.resolve('@electron/rebuild', { paths: [path.join(__dirname, '..', '..', 'node_modules')] });
    rebuild = require(parentRebuild).rebuild;
  } catch (err) {
    console.log('⚠️  @electron/rebuild not found, skipping better-sqlite3 rebuild for Electron');
    console.log('   To rebuild manually, run: npm rebuild better-sqlite3');
    console.log('   Or install @electron/rebuild: npm install -g @electron/rebuild');
    process.exit(0);
  }
}

// Check if electron is installed (it should be as a dependency)
let electronPkg;
try {
  electronPkg = require('electron/package.json');
} catch (error) {
  console.log('Electron not found, skipping better-sqlite3 rebuild for Electron');
  process.exit(0);
}

console.log('Rebuilding better-sqlite3 for Electron', electronPkg.version);

// Find better-sqlite3 - could be in this package's node_modules or hoisted to parent
let sqlitePath = null;
const possiblePaths = [
  path.join(__dirname, 'node_modules', 'better-sqlite3'),
  path.join(__dirname, '..', '..', 'node_modules', 'better-sqlite3'),
];

for (const possiblePath of possiblePaths) {
  if (fs.existsSync(possiblePath)) {
    sqlitePath = possiblePath;
    console.log('Found better-sqlite3 at:', sqlitePath);
    break;
  }
}

if (!sqlitePath) {
  console.log('⚠️  Could not find better-sqlite3 module, skipping rebuild');
  console.log('   This is normal if better-sqlite3 is not installed yet.');
  process.exit(0);
}

// Rebuild for Electron - find the package root (where package.json exists)
// Path structure: projax/node_modules/better-sqlite3/lib/index.js
// So we need to go: sqlitePath -> lib -> better-sqlite3 -> node_modules -> projax (package root)
const sqliteDir = require('path').dirname(sqlitePath); // .../better-sqlite3/lib
const betterSqlite3Dir = require('path').dirname(sqliteDir); // .../better-sqlite3
const nodeModulesDir = require('path').dirname(betterSqlite3Dir); // .../node_modules
const packageRoot = require('path').dirname(nodeModulesDir); // .../projax

console.log('Package root:', packageRoot);
console.log('Rebuilding from:', packageRoot);

rebuild({
  buildPath: packageRoot,
  electronVersion: electronPkg.version,
  onlyModules: ['better-sqlite3'],
  force: true,
})
  .then(() => {
    console.log('✓ Rebuild complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error('✗ Rebuild failed:', err);
    process.exit(1);
  });

