# 🎉 New Feature: MCP Server for AI Context Integration

## What's New?

Projax now includes a **Model Context Protocol (MCP) server** that provides your AI assistants in Cursor and VS Code with intelligent project context!

## 🚀 What Does This Mean?

When you're coding in Cursor or VS Code, your AI assistant will automatically know:

- **Which project you're working on** - Name, path, framework, and tags
- **Related projects in your workspace** - Other projects you're working with
- **Project metadata** - Descriptions, git branches, and more

No more explaining your project structure to the AI - it just knows! 🧠

## 💡 Example Use Cases

### Monorepo Development
```
You: "How should I share types between the frontend and backend?"

AI: "Since you're working in the frontend project and I can see the backend 
     project is also in your workspace at ../backend, you can create a shared 
     types package..."
```

### Framework-Aware Suggestions
```
You: "Add a new component"

AI: "Since this is a React project (I can see framework: react), 
     here's the best way to add a component..."
```

### Workspace-Aware Architecture
```
You: "What's the overall architecture of this project?"

AI: "Based on your workspace, you have:
     - Frontend (React) at ./frontend
     - Backend (Node.js) at ./backend  
     - Mobile (React Native) at ./mobile
     Let me explain how they connect..."
```

## 🔧 How to Use It

### Quick Setup (2 minutes)

1. **Get the configuration:**
   ```bash
   prx mcp-config --cursor  # or --vscode
   ```

2. **Copy the JSON output**

3. **Add to your editor:**
   - **Cursor:** Paste into `~/.cursor/mcp.json`
   - **VS Code:** Paste into `settings.json`

4. **Restart your editor**

5. **Start coding!** The AI now has context about your projects

### Visual Setup (Even Easier!)

1. Open Projax Desktop: `prx ui`
2. Go to Settings → MCP Server
3. Copy the configuration with one click
4. Follow the step-by-step instructions shown

## 📖 Full Documentation

- **Quick Start:** `prx mcp-config --help`
- **Detailed Guide:** See `packages/mcp-server/README.md`
- **Testing Guide:** See `packages/mcp-server/TESTING.md`
- **Main README:** See updated section in `README.md`

## 🎯 Benefits

### For Individual Developers
- 🧠 **Smarter AI suggestions** based on your actual project structure
- ⚡ **Faster development** - no need to explain context
- 🎯 **More relevant answers** that consider your full workspace

### For Teams
- 🤝 **Consistent AI understanding** across all team members
- 📊 **Better onboarding** - AI helps new devs understand project relationships
- 🔄 **Monorepo-aware** - AI understands how packages relate

## 🛡️ Privacy & Security

- **100% Local** - No data sent to external servers
- **Read-Only** - MCP server only reads project metadata
- **No Authentication** - Uses local stdio communication
- **Your Code Stays Private** - Only metadata shared, never code

## 🔍 What Information is Shared?

The MCP server only shares non-sensitive metadata:
- Project names and paths
- Framework type (e.g., "react", "node")
- Tags you've added to projects
- Workspace relationships
- Git branch names

**Never shared:**
- Source code
- File contents
- Credentials or secrets
- Personal data

## 📋 Requirements

- Projax version 3.3.38 or higher
- Cursor or VS Code with MCP support
- Projects registered with Projax: `prx add /path/to/project`

## 🐛 Troubleshooting

### AI doesn't seem to have context?

1. Check MCP server status in Projax Settings → MCP Server
2. Verify configuration with `prx mcp-config`
3. Ensure you're in a registered project: `prx list`
4. Restart your editor after configuration changes

### "MCP server not found" error?

```bash
# Rebuild the MCP server
npm run build:mcp-server

# Or reinstall Projax globally
npm install -g projax
```

### Need Help?

- See the comprehensive troubleshooting guide in `packages/mcp-server/README.md`
- Check `packages/mcp-server/TESTING.md` for detailed testing steps
- Run `prx mcp-config` to verify your setup

## 🎓 Learn More

### CLI Commands

```bash
# Start MCP server (used by editors automatically)
prx mcp

# Display configuration for Cursor
prx mcp-config --cursor

# Display configuration for VS Code
prx mcp-config --vscode

# Show all configurations
prx mcp-config
```

### Available Resources

The MCP server exposes these resources to AI assistants:

1. **Current Workspace** (`projax://current-workspace`)
   - Auto-detects your current project
   - Includes linked projects in the workspace

2. **Specific Project** (`projax://project/{path}`)
   - Get context for any registered project

3. **Workspace Details** (`projax://workspace/{path}`)
   - All projects in a specific workspace

## 🚀 Get Started Now!

```bash
# 1. Install/update Projax
npm install -g projax

# 2. Add your projects
prx add .

# 3. Get MCP configuration
prx mcp-config --cursor

# 4. Configure your editor and restart

# 5. Ask your AI about your project!
```

## 📢 Feedback

We'd love to hear how the MCP server improves your development workflow! 

- Found a bug? Check the troubleshooting guides first
- Have a suggestion? Let us know!
- Want to contribute? See `CONTRIBUTING.md`

---

**Happy Coding with Context! 🎉**

