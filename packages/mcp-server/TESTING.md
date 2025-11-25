# MCP Server Testing Guide

This guide covers manual testing of the Projax MCP server with Cursor and VS Code.

## Prerequisites

1. **Build the MCP server:**
   ```bash
   cd /path/to/projax
   npm run build:mcp-server
   ```

2. **Ensure Projax is installed globally:**
   ```bash
   npm install -g projax
   # Or if developing locally:
   sudo npm link
   ```

3. **Start the Projax API server:**
   ```bash
   prx api --start
   ```

4. **Add some projects to Projax:**
   ```bash
   prx add /path/to/project1
   prx add /path/to/project2
   ```

5. **Create a workspace with linked projects (optional):**
   ```bash
   prx workspace add "My Workspace"
   prx workspace add-project "My Workspace" /path/to/project1
   prx workspace add-project "My Workspace" /path/to/project2
   ```

## Testing with Cursor

### 1. Configure Cursor

Add the MCP server configuration to Cursor:

```bash
# Display the configuration
prx mcp-config --cursor

# Copy the output and add to ~/.cursor/mcp.json
```

Alternatively, use Cursor's built-in MCP configuration UI:
1. Open Cursor Settings (Cmd/Ctrl + ,)
2. Search for "MCP"
3. Click "Edit Config"
4. Add the Projax MCP server configuration

### 2. Restart Cursor

After adding the configuration, restart Cursor for the changes to take effect.

### 3. Verify MCP Server is Running

1. Open the Cursor AI chat
2. The MCP server should automatically start when Cursor connects
3. Check your terminal for MCP server logs (if you're running it manually)

### 4. Test Context Retrieval

#### Test 1: Current Workspace Context

1. Navigate to one of your registered Projax projects in Cursor:
   ```bash
   cd /path/to/project1
   code .
   ```

2. Open Cursor AI chat and ask:
   ```
   "What Projax project am I currently in?"
   ```

3. The AI should be able to see:
   - Your current project name and path
   - Linked projects in the same workspace (if any)
   - Project metadata (framework, tags, description)

#### Test 2: Related Projects

1. If you have a workspace with multiple projects, ask:
   ```
   "What other projects are linked to this one in my workspace?"
   ```

2. The AI should list all related projects with their details.

#### Test 3: Project-Specific Questions

1. Ask questions that require project context:
   ```
   "Based on my current project's framework, what's the best way to add a new component?"
   ```

2. The AI should consider your project's framework in its response.

### 5. Verify MCP Resources

You can verify available MCP resources by checking Cursor's MCP panel or by asking the AI:

```
"What Projax resources are available through MCP?"
```

Expected resources:
- `projax://current-workspace`
- `projax://project/{projectPath}`
- `projax://workspace/{workspaceFilePath}`

## Testing with VS Code

### 1. Configure VS Code

Add the MCP server configuration to VS Code:

```bash
# Display the configuration
prx mcp-config --vscode

# Copy the output and add to settings.json
```

Or use the VS Code MCP extension UI if available.

### 2. Restart VS Code

Reload VS Code for the configuration to take effect.

### 3. Follow Same Tests as Cursor

Repeat tests 3-5 from the Cursor section above, adapted for VS Code's AI assistant interface.

## Testing the Settings UI

### Desktop App

1. **Launch the Desktop app:**
   ```bash
   prx ui
   ```

2. **Open Settings:**
   - Click the Settings icon in the sidebar
   - Navigate to "MCP Server" category

3. **Verify Status Display:**
   - Check that the status shows "Available" (green checkmark)
   - Verify the prx command path is displayed correctly
   - Verify "MCP Server Built" shows as "Yes"

4. **Test Configuration Copy:**
   - Click the "Copy" button next to the Cursor configuration
   - Verify the configuration is copied to clipboard
   - Repeat for VS Code configuration

5. **Verify Resources List:**
   - Check that all three MCP resources are listed
   - Verify descriptions are correct

### VS Code Extension

1. **Open the Projax extension in VS Code**

2. **Navigate to Settings:**
   - Click the settings icon in the Projax sidebar
   - Look for MCP Server section

3. **Verify the same elements as Desktop app**

## Troubleshooting Tests

### Test 1: MCP Server Not Found

1. Remove the prx command from PATH temporarily
2. Check that Cursor/VS Code shows an appropriate error
3. Restore prx to PATH
4. Verify it works again

### Test 2: API Server Not Running

1. Stop the Projax API server:
   ```bash
   prx api --stop
   ```

2. Try to use MCP in Cursor/VS Code
3. Verify you get a helpful error message about starting the API
4. Start the API and verify it works again

### Test 3: No Projects Registered

1. Remove all projects from Projax (backup first!)
2. Try to get project context in Cursor/VS Code
3. Verify you get a helpful message about registering projects
4. Re-add projects and verify it works

## Success Criteria

✅ **Configuration**
- [ ] Cursor configuration displays correctly
- [ ] VS Code configuration displays correctly
- [ ] Copy to clipboard works for both configurations

✅ **MCP Server**
- [ ] MCP server starts automatically when Cursor/VS Code connects
- [ ] Server logs show successful initialization
- [ ] Server responds to resource requests

✅ **Context Retrieval**
- [ ] Current project context is correctly identified
- [ ] Linked projects in workspace are shown
- [ ] Project metadata (framework, tags, etc.) is included
- [ ] AI assistant uses context in responses

✅ **Settings UI**
- [ ] MCP status shows correctly (green when available)
- [ ] Configuration strings are correct
- [ ] Copy buttons work
- [ ] Resources list is displayed
- [ ] Instructions are clear and helpful

✅ **Error Handling**
- [ ] Helpful error when prx not found
- [ ] Helpful error when API not running
- [ ] Helpful error when no projects registered
- [ ] Graceful degradation when MCP unavailable

## Reporting Issues

When reporting issues, please include:

1. **Environment:**
   - OS (macOS, Linux, Windows)
   - Editor (Cursor, VS Code) and version
   - Projax version: `prx --version`

2. **MCP Server Status:**
   ```bash
   # Check if MCP server is built
   ls -la ~/.projax/
   
   # Check prx command
   which prx
   
   # Check API status
   prx api
   ```

3. **Configuration:**
   ```bash
   # Show current MCP config
   prx mcp-config
   ```

4. **Logs:**
   - Terminal output when running `prx mcp`
   - Cursor/VS Code console logs (if available)
   - Any error messages

5. **Steps to Reproduce:**
   - Exact steps that trigger the issue
   - Expected behavior
   - Actual behavior

