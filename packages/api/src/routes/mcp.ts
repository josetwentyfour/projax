import { Router } from 'express';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

/**
 * Get MCP server status and configuration
 */
router.get('/status', (req, res) => {
  try {
    // Check if prx command is available
    let prxPath = 'prx';
    let isPrxAvailable = false;
    
    try {
      prxPath = execSync('which prx', { encoding: 'utf-8' }).trim();
      isPrxAvailable = !!prxPath;
    } catch {
      isPrxAvailable = false;
    }
    
    // Check if MCP server package exists
    let isMcpServerBuilt = false;
    try {
      const mcpServerPath = path.join(__dirname, '..', '..', '..', 'mcp-server', 'dist', 'index.js');
      isMcpServerBuilt = fs.existsSync(mcpServerPath);
    } catch {
      isMcpServerBuilt = false;
    }
    
    const cursorConfig = {
      mcpServers: {
        projax: {
          command: prxPath,
          args: ['mcp'],
        },
      },
    };
    
    const vscodeConfig = {
      'mcp.servers': {
        projax: {
          command: prxPath,
          args: ['mcp'],
        },
      },
    };
    
    res.json({
      available: isPrxAvailable && isMcpServerBuilt,
      prxPath,
      isPrxAvailable,
      isMcpServerBuilt,
      cursorConfig,
      vscodeConfig,
      resources: [
        {
          uri: 'projax://current-workspace',
          description: 'Information about the current project and its linked projects in the workspace',
        },
        {
          uri: 'projax://project/{projectPath}',
          description: 'Context for a specific project by path',
        },
        {
          uri: 'projax://workspace/{workspaceFilePath}',
          description: 'All projects in a specific workspace',
        },
      ],
    });
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      available: false,
    });
  }
});

/**
 * Get MCP configuration for a specific editor
 */
router.get('/config/:editor', (req, res) => {
  try {
    const editor = req.params.editor.toLowerCase();
    
    let prxPath = 'prx';
    try {
      prxPath = execSync('which prx', { encoding: 'utf-8' }).trim();
    } catch {
      // Use 'prx' as default
    }
    
    if (editor === 'cursor') {
      const config = {
        mcpServers: {
          projax: {
            command: prxPath,
            args: ['mcp'],
          },
        },
      };
      res.json(config);
    } else if (editor === 'vscode') {
      const config = {
        'mcp.servers': {
          projax: {
            command: prxPath,
            args: ['mcp'],
          },
        },
      };
      res.json(config);
    } else {
      res.status(400).json({ error: 'Unknown editor. Use "cursor" or "vscode"' });
    }
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
