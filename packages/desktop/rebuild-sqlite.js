#!/usr/bin/env node

const { rebuild } = require('@electron/rebuild');
const path = require('path');
const fs = require('fs');
const electronPkg = require('electron/package.json');

console.log('Rebuilding better-sqlite3 for Electron', electronPkg.version);

// Find better-sqlite3 in node_modules - could be in root or core package
const rootPath = path.join(__dirname, '../..');
const corePath = path.join(__dirname, '../core');
const electronPath = path.join(__dirname);

// Check where better-sqlite3 is installed
let sqlitePath = null;
const possiblePaths = [
  path.join(rootPath, 'node_modules', 'better-sqlite3'),
  path.join(corePath, 'node_modules', 'better-sqlite3'),
  path.join(electronPath, 'node_modules', 'better-sqlite3'),
];

for (const possiblePath of possiblePaths) {
  if (fs.existsSync(possiblePath)) {
    sqlitePath = possiblePath;
    console.log('Found better-sqlite3 at:', sqlitePath);
    break;
  }
}

if (!sqlitePath) {
  console.error('✗ Could not find better-sqlite3 module');
  process.exit(1);
}

// Rebuild from the root to ensure all native modules are rebuilt
rebuild({
  buildPath: rootPath,
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

