import React, { useEffect, useRef, useState } from 'react';
import './Terminal.css';

interface TerminalProps {
  pid: number;
  scriptName: string;
  projectName: string;
  onClose: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ pid, scriptName, projectName, onClose }) => {
  const [output, setOutput] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

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
    const handleOutput = (_event: any, data: { pid: number; data: string }) => {
      if (data.pid === pid) {
        setOutput(prev => [...prev, data.data]);
      }
    };

    // Listen for process exit events
    const handleExit = (_event: any, data: { pid: number; code: number }) => {
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
  }, [output, autoScroll]);

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

  return (
    <div className="terminal-sidebar">
      <div className="terminal-header">
        <div className="terminal-title">
          <span className="terminal-icon">▶</span>
          <div className="terminal-info">
            <span className="terminal-script">{scriptName}</span>
            <span className="terminal-project">{projectName}</span>
          </div>
          <span className={`terminal-status ${isConnected ? 'running' : 'stopped'}`}>
            {isConnected ? '● Running' : '○ Stopped'}
          </span>
        </div>
        <div className="terminal-actions">
          <button
            onClick={handleClear}
            className="terminal-btn"
            title="Clear output"
          >
            Clear
          </button>
          {!autoScroll && (
            <button
              onClick={handleScrollToBottom}
              className="terminal-btn terminal-btn-scroll"
              title="Scroll to bottom"
            >
              ↓
            </button>
          )}
          <button
            onClick={onClose}
            className="terminal-btn terminal-btn-close"
            title="Close terminal"
          >
            ✕
          </button>
        </div>
      </div>
      <div
        ref={terminalRef}
        className="terminal-output"
        onScroll={handleScroll}
      >
        {output.length === 0 ? (
          <div className="terminal-empty">Waiting for output from PID {pid}...</div>
        ) : (
          output.map((line, index) => (
            <div key={index} className="terminal-line">
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Terminal;

