#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get version from command line args
const args = process.argv.slice(2);
const versionArg = args[0];

if (!versionArg) {
  console.error('Usage: node scripts/bump-version.js <version>');
  console.error('Example: node scripts/bump-version.js 1.0.2');
  console.error('Or use npm run version:patch, version:minor, version:major');
  process.exit(1);
}

// Packages to update
const packages = [
  'package.json',
  'packages/core/package.json',
  'packages/cli/package.json',
  'packages/desktop/package.json',
];

function bumpVersion(currentVersion, bumpType) {
  const parts = currentVersion.split('.').map(Number);
  if (bumpType === 'patch') {
    parts[2] = (parts[2] || 0) + 1;
  } else if (bumpType === 'minor') {
    parts[1] = (parts[1] || 0) + 1;
    parts[2] = 0;
  } else if (bumpType === 'major') {
    parts[0] = (parts[0] || 0) + 1;
    parts[1] = 0;
    parts[2] = 0;
  }
  return parts.join('.');
}

// Determine new version
let newVersion;
if (versionArg === 'patch' || versionArg === 'minor' || versionArg === 'major') {
  // Read current version from root package.json
  const rootPackagePath = path.join(__dirname, '..', 'package.json');
  const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
  newVersion = bumpVersion(rootPackage.version, versionArg);
} else {
  // Use provided version directly
  newVersion = versionArg;
}

// Validate version format
if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error(`Invalid version format: ${newVersion}`);
  console.error('Version must be in format: x.y.z (e.g., 1.0.2)');
  process.exit(1);
}

console.log(`Bumping all packages to version: ${newVersion}\n`);

// Update all package.json files
packages.forEach((packagePath) => {
  const fullPath = path.join(__dirname, '..', packagePath);
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`Warning: ${packagePath} not found, skipping...`);
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  const oldVersion = packageJson.version;
  packageJson.version = newVersion;
  
  fs.writeFileSync(fullPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✓ ${packagePath}: ${oldVersion} → ${newVersion}`);
});

console.log(`\n✓ All packages bumped to ${newVersion}`);

