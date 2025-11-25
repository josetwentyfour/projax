import React, { useState, useEffect } from 'react';
import './SettingsCategory.css';

interface MCPStatus {
  available: boolean;
  prxPath: string;
  isPrxAvailable: boolean;
  isMcpServerBuilt: boolean;
  cursorConfig: any;
  vscodeConfig: any;
  resources: Array<{
    uri: string;
    description: string;
  }>;
}

const MCPSettings: React.FC = () => {
  const [mcpStatus, setMcpStatus] = useState<MCPStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCursor, setCopiedCursor] = useState(false);
  const [copiedVSCode, setCopiedVSCode] = useState(false);

  useEffect(() => {
    fetchMCPStatus();
  }, []);

  const fetchMCPStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiPort = localStorage.getItem('api-port') || '38124';
      const response = await fetch(`http://localhost:${apiPort}/api/mcp/status`);

      if (!response.ok) {
        throw new Error('Failed to fetch MCP status');
      }

      const data = await response.json();
      setMcpStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'cursor' | 'vscode') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'cursor') {
        setCopiedCursor(true);
        setTimeout(() => setCopiedCursor(false), 2000);
      } else {
        setCopiedVSCode(true);
        setTimeout(() => setCopiedVSCode(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="settings-category">
        <h2>MCP Server Configuration</h2>
        <div className="settings-section">
          <p>Loading MCP status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="settings-category">
        <h2>MCP Server Configuration</h2>
        <div className="settings-section">
          <div className="error-message">
            <p>❌ Error: {error}</p>
            <button onClick={fetchMCPStatus} className="btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!mcpStatus) {
    return null;
  }

  return (
    <div className="settings-category">
      <h2>MCP Server Configuration</h2>
      <p className="settings-description">
        Configure the Model Context Protocol (MCP) server to provide project context to AI tools like Cursor and VS Code.
      </p>

      {/* Status Section */}
      <div className="settings-section">
        <h3>Status</h3>
        <div className="mcp-status">
          <div className="status-item">
            <span className="status-label">MCP Server:</span>
            <span className={`status-value ${mcpStatus.available ? 'status-ok' : 'status-error'}`}>
              {mcpStatus.available ? '✓ Available' : '✗ Not Available'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">prx Command:</span>
            <span className={`status-value ${mcpStatus.isPrxAvailable ? 'status-ok' : 'status-error'}`}>
              {mcpStatus.isPrxAvailable ? `✓ ${mcpStatus.prxPath}` : '✗ Not Found'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">MCP Server Built:</span>
            <span className={`status-value ${mcpStatus.isMcpServerBuilt ? 'status-ok' : 'status-error'}`}>
              {mcpStatus.isMcpServerBuilt ? '✓ Yes' : '✗ No'}
            </span>
          </div>
        </div>

        {!mcpStatus.available && (
          <div className="warning-message">
            <p>⚠️ MCP Server is not fully configured.</p>
            {!mcpStatus.isMcpServerBuilt && (
              <p>Please build the MCP server: <code>npm run build:mcp-server</code></p>
            )}
            {!mcpStatus.isPrxAvailable && (
              <p>Please ensure Projax is installed globally: <code>npm install -g projax</code></p>
            )}
          </div>
        )}
      </div>

      {/* Cursor Configuration */}
      <div className="settings-section">
        <h3>Cursor Configuration</h3>
        <p className="settings-help">
          Add this configuration to <code>~/.cursor/mcp.json</code> or use Cursor Settings → MCP
        </p>
        <div className="config-block">
          <pre className="config-json">
            {JSON.stringify(mcpStatus.cursorConfig, null, 2)}
          </pre>
          <button
            onClick={() => copyToClipboard(JSON.stringify(mcpStatus.cursorConfig, null, 2), 'cursor')}
            className="btn-copy"
            title="Copy to clipboard"
          >
            {copiedCursor ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
        <div className="settings-help">
          <ol>
            <li>Open Cursor Settings (Cmd/Ctrl + ,)</li>
            <li>Search for "MCP" or navigate to Features → Model Context Protocol</li>
            <li>Click "Edit Config" or open <code>~/.cursor/mcp.json</code></li>
            <li>Paste the configuration above</li>
            <li>Restart Cursor</li>
          </ol>
        </div>
      </div>

      {/* VS Code Configuration */}
      <div className="settings-section">
        <h3>VS Code Configuration</h3>
        <p className="settings-help">
          Add this configuration to your <code>settings.json</code> or use the MCP extension
        </p>
        <div className="config-block">
          <pre className="config-json">
            {JSON.stringify(mcpStatus.vscodeConfig, null, 2)}
          </pre>
          <button
            onClick={() => copyToClipboard(JSON.stringify(mcpStatus.vscodeConfig, null, 2), 'vscode')}
            className="btn-copy"
            title="Copy to clipboard"
          >
            {copiedVSCode ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
        <div className="settings-help">
          <ol>
            <li>Open VS Code Settings (Cmd/Ctrl + ,)</li>
            <li>Search for "MCP" or click the {} icon to edit <code>settings.json</code></li>
            <li>Paste the configuration above</li>
            <li>Reload VS Code</li>
          </ol>
        </div>
      </div>

      {/* Available Resources */}
      <div className="settings-section">
        <h3>Available Resources</h3>
        <p className="settings-help">
          The MCP server exposes the following resources to AI assistants:
        </p>
        <ul className="resource-list">
          {mcpStatus.resources.map((resource, index) => (
            <li key={index}>
              <code>{resource.uri}</code>
              <p>{resource.description}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Usage Instructions */}
      <div className="settings-section">
        <h3>How It Works</h3>
        <div className="settings-help">
          <p>Once configured, the MCP server automatically provides context to your AI assistant:</p>
          <ol>
            <li>You're working in a directory registered as a Projax project</li>
            <li>The AI assistant queries the MCP server for context</li>
            <li>The server returns information about:
              <ul>
                <li>Current project details (name, framework, tags)</li>
                <li>Linked projects in the same workspace</li>
                <li>Workspace metadata</li>
              </ul>
            </li>
            <li>The AI uses this context for more informed responses</li>
          </ol>
          <p>
            <strong>Example:</strong> If you're in a frontend project that's part of a workspace with backend and mobile projects,
            the AI will know about all three projects and can provide context-aware suggestions.
          </p>
        </div>
      </div>

      {/* CLI Commands */}
      <div className="settings-section">
        <h3>CLI Commands</h3>
        <div className="cli-commands">
          <div className="cli-command">
            <code>prx mcp</code>
            <p>Start the MCP server (used by editors)</p>
          </div>
          <div className="cli-command">
            <code>prx mcp-config</code>
            <p>Display configuration for all editors</p>
          </div>
          <div className="cli-command">
            <code>prx mcp-config --cursor</code>
            <p>Display Cursor-specific configuration</p>
          </div>
          <div className="cli-command">
            <code>prx mcp-config --vscode</code>
            <p>Display VS Code-specific configuration</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCPSettings;

