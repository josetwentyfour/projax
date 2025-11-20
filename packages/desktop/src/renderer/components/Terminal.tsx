import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import './Terminal.css';

interface TerminalProps {
  pid: number;
  scriptName: string;
  projectName: string;
  onClose: () => void;
}

interface DetectedServer {
  url: string;
  port: number;
}

const Terminal: FC<TerminalProps> = ({ pid, scriptName, projectName, onClose }) => {
  const [output, setOutput] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [detectedServers, setDetectedServers] = useState<DetectedServer[]>([]);

  // Function to detect server URLs and ports from terminal output
  const detectServers = useCallback((text: string): DetectedServer[] => {
    const servers: DetectedServer[] = [];
    const seenUrls = new Set<string>();

    // Patterns to match various server URL formats
    const patterns = [
      // Full URLs with http/https
      /https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0):(\d+)/gi,
      // Port only mentions (e.g., "Server running on port 3000")
      /(?:port|PORT)\s+(\d+)/gi,
      // Local addresses without protocol
      /(?:localhost|127\.0\.0\.1):(\d+)/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        let url: string;
        let port: number;

        if (match[0].includes('http')) {
          // Full URL match
          url = match[0];
          port = Number.parseInt(match[2], 10);
        } else if (match[0].toLowerCase().includes('port')) {
          // Port only mention
          port = Number.parseInt(match[1], 10);
          url = `http://localhost:${port}`;
        } else {
          // localhost:port format
          port = Number.parseInt(match[1], 10);
          url = match[0].includes('://') ? match[0] : `http://${match[0]}`;
        }

        // Only add valid ports and avoid duplicates
        if (port >= 1000 && port <= 65535 && !seenUrls.has(url)) {
          seenUrls.add(url);
          servers.push({ url, port });
        }
      }
    }

    return servers;
  }, []);

  // Detect servers whenever output changes
  useEffect(() => {
    const fullOutput = output.join('\n');
    const servers = detectServers(fullOutput);
    
    if (servers.length > 0) {
      setDetectedServers(servers);
    }
  }, [output, detectServers]);

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    // Start listening to process output
    const startListener = async () => {
      try {
        await window.electronAPI.watchProcessOutput(pid);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to start watching process:', error);
        setOutput(prev => [...prev, `Error: Failed to connect to process ${pid}`]);
      }
    };

    startListener();

    // Listen for output events
    const handleOutput = (_event: unknown, data: { pid: number; data: string }) => {
      if (data.pid === pid) {
        setOutput(prev => [...prev, data.data]);
      }
    };

    // Listen for process exit events
    const handleExit = (_event: unknown, data: { pid: number; code: number }) => {
      if (data.pid === pid) {
        setOutput(prev => [...prev, `\n[Process exited with code ${data.code}]`]);
        setIsConnected(false);
      }
    };

    window.electronAPI.onProcessOutput(handleOutput);
    window.electronAPI.onProcessExit(handleExit);

    // Cleanup
    return () => {
      window.electronAPI.unwatchProcessOutput(pid);
      window.electronAPI.removeProcessOutputListener(handleOutput);
      window.electronAPI.removeProcessExitListener(handleExit);
    };
  }, [pid]);

  // Auto-scroll to bottom when new output arrives
  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [autoScroll]);

  // Detect if user scrolls up
  const handleScroll = () => {
    if (terminalRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = terminalRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setAutoScroll(isAtBottom);
    }
  };

  const handleClear = () => {
    setOutput([]);
  };

  const handleScrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      setAutoScroll(true);
    }
  };

  const handleOpenUrl = (url: string) => {
    window.open(url, '_blank');
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="terminal-sidebar">
      <div className="terminal-header">
        <div className="terminal-title-row">
          <div className="terminal-title-content">
            <span className={`terminal-status-indicator ${isConnected ? 'running' : 'stopped'}`}>
              {isConnected ? '●' : '○'}
            </span>
            <div className="terminal-info">
              <span className="terminal-script">{scriptName}</span>
              <span className="terminal-project">{projectName}</span>
            </div>
          </div>
          <div className="terminal-meta">
            <span className={`terminal-status-badge ${isConnected ? 'running' : 'stopped'}`}>
              {isConnected ? 'Running' : 'Stopped'}
            </span>
            <span className="terminal-pid">PID: {pid}</span>
          </div>
        </div>
        <div className="terminal-toolbar">
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-secondary btn-tiny"
            title="Clear output"
          >
            Clear
          </button>
          {!autoScroll && (
            <button
              type="button"
              onClick={handleScrollToBottom}
              className="btn btn-secondary btn-tiny"
              title="Scroll to bottom"
            >
              ↓ Bottom
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="btn btn-danger btn-tiny"
            title="Close terminal"
          >
            Close
          </button>
        </div>
      </div>
      <div
        ref={terminalRef}
        className="terminal-output"
        onScroll={handleScroll}
      >
        {output.length === 0 ? (
          <div className="terminal-empty">
            <div className="terminal-empty-icon">⌘</div>
            <div className="terminal-empty-text">Waiting for output...</div>
            <div className="terminal-empty-hint">Process PID {pid}</div>
          </div>
        ) : (
          output.map((line, index) => (
            <div key={`${index}-${line.slice(0, 20)}`} className="terminal-line">
              {line}
            </div>
          ))
        )}
      </div>
      
      {/* Terminal Loupe - Server Detection Toolbar */}
      {detectedServers.length > 0 && (
        <div className="terminal-loupe">
          <div className="terminal-loupe-header">
            <span className="terminal-loupe-icon">🔍</span>
            <span className="terminal-loupe-title">Detected Servers</span>
          </div>
          <div className="terminal-loupe-servers">
            {detectedServers.map((server) => (
              <div key={server.url} className="terminal-loupe-server">
                <div className="terminal-loupe-server-info">
                  <span className="terminal-loupe-port">:{server.port}</span>
                  <span className="terminal-loupe-url">{server.url}</span>
                </div>
                <div className="terminal-loupe-actions">
                  <button
                    type="button"
                    onClick={() => handleOpenUrl(server.url)}
                    className="btn btn-primary btn-tiny"
                    title="Open in browser"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(server.url)}
                    className="btn btn-secondary btn-tiny"
                    title="Copy URL"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Terminal;

