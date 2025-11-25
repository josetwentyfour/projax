# Projax MCP Server

Model Context Protocol (MCP) server for Projax that exposes project and workspace context to AI tools like Cursor and VS Code.

## What is MCP?

The Model Context Protocol (MCP) is an open protocol that standardizes how applications provide context to Large Language Models (LLMs). By running a Projax MCP server, AI assistants in your code editor can understand:

- Which project you're currently working on
- What other projects are linked in the same workspace
- Project metadata (framework, tags, descriptions)
- Workspace relationships

## Installation

The MCP server is included with Projax. If you have Projax installed globally, you're ready to go:

```bash
npm install -g projax
```

## Configuration

### Cursor

1. Open Cursor Settings (Cmd/Ctrl + ,)
2. Search for "MCP" or navigate to Features > Model Context Protocol
3. Click "Edit Config" or open `~/.cursor/mcp.json`
4. Add the following configuration:

```json
{
  "mcpServers": {
    "projax": {
      "command": "prx",
      "args": ["mcp"]
    }
  }
}
```

5. Restart Cursor

### VS Code

1. Install the MCP extension for VS Code (if not already installed)
2. Open VS Code Settings (Cmd/Ctrl + ,)
3. Search for "MCP" or edit `settings.json`
4. Add the following configuration:

```json
{
  "mcp.servers": {
    "projax": {
      "command": "prx",
      "args": ["mcp"]
    }
  }
}
```

5. Reload VS Code

## Usage

Once configured, the MCP server will automatically provide context to your AI assistant when:

- You're working in a directory that's registered as a Projax project
- The project is part of a workspace with other linked projects

### Available Resources

The MCP server exposes the following resources:

- `projax://current-workspace` - Context about your current project and linked projects
- `projax://project/{path}` - Context about a specific project
- `projax://workspace/{path}` - All projects in a specific workspace

### How It Works

1. When you chat with your AI assistant (e.g., Cursor's AI chat), it automatically queries the MCP server
2. The server detects which Projax project you're currently in (based on your working directory)
3. It returns information about:
   - The current project
   - Other projects in the same workspace
   - Tags, descriptions, and frameworks
4. The AI assistant uses this context to provide more informed responses

### Example

If you're working on a frontend project that's part of a larger workspace with backend and mobile projects, the AI assistant will know:

- "This is a React frontend project"
- "There's a related Node.js backend at ../backend"
- "There's a React Native mobile app at ../mobile"
- All projects share the same workspace

This allows the AI to:
- Suggest consistent patterns across projects
- Reference related code in other projects
- Understand the full architecture

## Requirements

- Projax must be installed and on your PATH
- The Projax API server should be running (automatically started when needed)
- Your project must be registered with Projax (`prx add`)

## Troubleshooting

### MCP Server Not Found

If Cursor/VS Code can't find the MCP server:

1. Verify Projax is installed: `prx --version`
2. Verify the `prx` command is in your PATH: `which prx`
3. Try using the full path in your MCP config:
   ```json
   {
     "command": "/usr/local/bin/prx",
     "args": ["mcp"]
   }
   ```

### No Context Available

If the AI assistant doesn't have project context:

1. Make sure you're in a registered Projax project: `prx list`
2. Register your project if needed: `prx add`
3. Check the API server is running: `prx api` (it should start automatically)
4. Restart your editor after configuration changes

### View Configuration

To see the MCP configuration you should add to your editor:

```bash
# Show configuration for all editors
prx mcp config

# Show Cursor-specific configuration
prx mcp config --cursor

# Show VS Code-specific configuration
prx mcp config --vscode
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Debugging

The MCP server logs to stderr. To debug:

```bash
# Run the server directly and see logs
prx mcp

# The server expects JSON-RPC messages on stdin
# In normal usage, this is handled by the editor
```

## Resources

- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [Cursor MCP Documentation](https://docs.cursor.com/context/model-context-protocol)
- [Projax Documentation](https://projax.dev)

## License

MIT
