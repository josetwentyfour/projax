#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
  getCurrentProjectContext,
  getProjectContextByPath,
  getWorkspaceContext,
  formatContextAsText,
  getAllProjects,
  getAllWorkspaces,
} from './resources';
import { isApiAvailable } from './detector';

/**
 * Create and configure the MCP server
 */
async function main() {
  const server = new Server(
    {
      name: 'projax-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  /**
   * List available resources
   */
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    // Check if API is available
    if (!isApiAvailable()) {
      return {
        resources: [
          {
            uri: 'projax://error/api-not-available',
            name: 'Projax API Not Available',
            description: 'The Projax API server is not running. Please start it with: prx api',
            mimeType: 'text/plain',
          },
        ],
      };
    }

    const resources = [
      {
        uri: 'projax://current-workspace',
        name: 'Current Project Context',
        description: 'Information about the current project and its linked projects in the workspace',
        mimeType: 'text/plain',
      },
    ];

    // Add resources for each registered project
    const projects = getAllProjects();
    for (const project of projects) {
      resources.push({
        uri: `projax://project/${encodeURIComponent(project.path)}`,
        name: `Project: ${project.name}`,
        description: `Context for project ${project.name} at ${project.path}`,
        mimeType: 'text/plain',
      });
    }

    // Add resources for each workspace
    const workspaces = getAllWorkspaces();
    for (const workspace of workspaces) {
      resources.push({
        uri: `projax://workspace/${encodeURIComponent(workspace.workspace_file_path)}`,
        name: `Workspace: ${workspace.name}`,
        description: `All projects in workspace ${workspace.name}`,
        mimeType: 'text/plain',
      });
    }

    return { resources };
  });

  /**
   * Read a specific resource
   */
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;

    // Check if API is available
    if (!isApiAvailable()) {
      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: 'Error: Projax API is not running. Please start it with: prx api',
          },
        ],
      };
    }

    // Handle current workspace context
    if (uri === 'projax://current-workspace') {
      const context = getCurrentProjectContext();

      if (!context) {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: 'No Projax project found in the current directory or its parents. Please navigate to a project registered with Projax, or register this project using: prx add',
            },
          ],
        };
      }

      const text = formatContextAsText(context);

      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text,
          },
        ],
      };
    }

    // Handle project-specific context
    if (uri.startsWith('projax://project/')) {
      const projectPath = decodeURIComponent(uri.replace('projax://project/', ''));
      const context = getProjectContextByPath(projectPath);

      if (!context) {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: `Project not found at path: ${projectPath}`,
            },
          ],
        };
      }

      const text = formatContextAsText(context);

      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text,
          },
        ],
      };
    }

    // Handle workspace context
    if (uri.startsWith('projax://workspace/')) {
      const workspaceFilePath = decodeURIComponent(uri.replace('projax://workspace/', ''));
      const workspaceContext = getWorkspaceContext(workspaceFilePath);

      if (!workspaceContext) {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: `Workspace not found at path: ${workspaceFilePath}`,
            },
          ],
        };
      }

      let text = `# Workspace: ${workspaceContext.workspace.name}\n\n`;

      if (workspaceContext.workspace.description) {
        text += `${workspaceContext.workspace.description}\n\n`;
      }

      text += `## Projects in this Workspace\n\n`;

      for (const project of workspaceContext.projects) {
        text += `### ${project.name}\n`;
        text += `- Path: ${project.path}\n`;

        if (project.description) {
          text += `- Description: ${project.description}\n`;
        }

        if (project.framework) {
          text += `- Framework: ${project.framework}\n`;
        }

        if (project.tags && project.tags.length > 0) {
          text += `- Tags: ${project.tags.join(', ')}\n`;
        }

        text += `\n`;
      }

      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text,
          },
        ],
      };
    }

    // Unknown resource
    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: `Unknown resource: ${uri}`,
        },
      ],
    };
  });

  /**
   * List available tools (optional - for future expansion)
   */
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [],
    };
  });

  /**
   * Handle tool calls (optional - for future expansion)
   */
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    throw new Error(`Unknown tool: ${request.params.name}`);
  });

  // Start the server using stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr so it doesn't interfere with stdio protocol
  console.error('Projax MCP Server running on stdio');
}

// Run the server
main().catch((error) => {
  console.error('Fatal error in MCP server:', error);
  process.exit(1);
});
