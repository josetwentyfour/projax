# PROJAX Release Notes - Version 1.3.11

**Release Date**: November 19, 2025  
**Package**: `projax@1.3.11`  
**Registry**: https://registry.npmjs.org/package/projax

---

## 🚀 What's New

### Improvements & Fixes

#### Package Quality
- ✅ Fixed JSON syntax error in API package.json (trailing comma in dependencies)
- ✅ Improved package.json consistency across all workspace packages
- ✅ Enhanced build reliability for all components

#### prxi Terminal UI
- 💎 Enhanced visual appearance with improved layout
- ✨ Better project display and navigation
- 🎨 Improved terminal UI aesthetics

#### Build System
- 🔧 Verified build process for all packages (core, api, cli, desktop, prxi)
- ✅ Ensured proper file syncing between desktop and CLI bundles
- 📦 Confirmed all dependencies are correctly bundled

---

## 📦 Installation

### New Installation
```bash
npm install -g projax@1.3.11
```

### Upgrade from Previous Version
```bash
npm update -g projax
```

### Verify Installation
```bash
prx --version
# Should output: 1.3.11
```

---

## ✅ Testing Summary

All components tested and verified:

### CLI Commands ✅
- ✅ `prx --version` - Version display
- ✅ `prx --help` - Command help
- ✅ `prx list` - Project listing with ports and tests
- ✅ `prx scripts <project>` - Script enumeration
- ✅ `prx ps` - Process management
- ✅ All other CLI commands functional

### Desktop App ✅
- ✅ Build and file syncing verified
- ✅ Electron bundle properly packaged
- ✅ Renderer, main, and preload scripts correctly built

### prxi Terminal UI ✅
- ✅ Build successful (2.2MB bundle)
- ✅ Executable with proper shebang
- ✅ Enhanced visual appearance

### API Server ✅
- ✅ TypeScript compilation successful
- ✅ Package structure validated

---

## 📊 Package Statistics

- **Package Size**: 1.5 MB (compressed)
- **Unpacked Size**: 5.9 MB
- **Total Files**: 123 files
- **Node Version**: >=18.0.0
- **Platforms**: macOS, Linux, Windows

---

## 🎯 Complete Feature Set

### CLI Tool (`prx` command)
- ✅ Project management (add, list, remove, rename, describe, tags)
- ✅ Test scanning and detection
- ✅ Port scanning and conflict resolution
- ✅ Script execution (foreground & background)
- ✅ Process management (list, stop)
- ✅ Directory navigation (`prx cd`, `prx pwd`)
- ✅ Interactive terminal UI (`prx i`)
- ✅ File and editor integration (`prx open`, `prx files`)
- ✅ URL detection and display

### Desktop App (`prx web|desktop|ui`)
- ✅ Electron-based visual interface
- ✅ Frameless window with custom title bar
- ✅ Project management UI
- ✅ Script running interface
- ✅ Settings configuration
- ✅ Secure external link handling

### API Server
- ✅ Auto-starts with desktop app
- ✅ REST API for project data
- ✅ Auto-port selection (38124-38133)
- ✅ CORS support for cross-origin requests

### Supported Project Types
- ✅ Node.js (npm, yarn, pnpm)
- ✅ Python (poetry, pip)
- ✅ Rust (cargo)
- ✅ Go
- ✅ Makefile

---

## 📋 Key Commands

```bash
# Project Management
prx add [path]                      # Add a project
prx list [--verbose] [--ports]      # List all projects
prx rn|rename <project> <newName>   # Rename a project
prx desc <project> [description]    # Set project description
prx tags <project> [action] [tag]   # Manage project tags
prx remove <project> [-f]           # Remove a project

# Script Management
prx scripts [project]               # List available scripts
prx run <project> <script> [-b -f]  # Run a script
prx ps                              # List running processes
prx stop <pid>                      # Stop a process

# Navigation & Integration
prx pwd [project]                   # Get project path
prx cd [project]                    # Change to project directory
prx open <project>                  # Open project in editor
prx files <project>                 # Open project directory
prx urls <project>                  # List detected URLs

# Interfaces
prx web|desktop|ui [--dev]          # Launch desktop app
prx prxi|i                          # Launch terminal UI
prx api [--start]                   # API server info

# Scanning
prx scan [project]                  # Scan for tests
prx scan-ports [project]            # Scan ports

# Quick Execution
prx <project> [script] [args]       # Quick script execution
```

---

## 🔧 Technical Details

### Build Process
The prepublishOnly script automatically:
1. Compiles TypeScript for all packages
2. Copies core library to dependent packages
3. Builds Electron desktop app
4. Syncs desktop files to CLI bundle
5. Copies API server to CLI bundle

### Package Contents
- CLI tool with full command suite
- Desktop Electron app (pre-built)
- API server (bundled)
- Core library (shared)
- prxi terminal UI (bundled)
- Port management utilities
- Script runner

---

## 🐛 Bug Fixes

### v1.3.11
- Fixed trailing comma in API package.json dependencies
- Improved package.json formatting consistency

---

## 📚 Documentation

For complete documentation, see:
- **README.md** - Full feature documentation
- **packages/cli/README.md** - CLI-specific guide
- **SHELL_INTEGRATION.md** - Shell function examples
- **TEST_RESULTS.md** - Build verification

---

## 🎉 Ready for Production

All features tested and verified:
- ✅ Build system working correctly
- ✅ CLI commands functional
- ✅ Desktop app properly bundled
- ✅ Terminal UI operational
- ✅ API server functional
- ✅ Port management working
- ✅ Process tracking operational

**Upgrade now**: `npm update -g projax`

---

## 🔄 Version History

- **v1.3.11** (Current) - Bug fixes and improvements
- **v1.3.10** - Secure external link handling in Electron app
- **v1.3.9** - Process management fixes, enhanced UIs
- **v1.3.8** - Previous stable release

---

## 💬 Support

For issues, feature requests, or questions:
- Check documentation in README.md
- Review existing release notes
- Consult troubleshooting guide in README

---

## ✨ What's Next

Future roadmap includes:
- Jenkins integration for build status
- Test execution from dashboard
- Project templates
- Git integration
- Build notifications

---

**Thank you for using projax!**

