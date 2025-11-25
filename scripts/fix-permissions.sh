#!/bin/bash
# Fix permissions on root-owned node_modules directories

echo "Fixing permissions on node_modules directories..."

# Find and fix root-owned directories
find . -type d -name "node_modules" -user root -exec sudo chown -R $(whoami) {} \; 2>/dev/null
find . -type f -path "*/node_modules/*" -user root -exec sudo chown -R $(whoami) {} \; 2>/dev/null

echo "Permissions fixed. You can now run: pnpm install"

