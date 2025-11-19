import React from 'react';
import './WindowControls.css';

const WindowControls: React.FC = () => {
  const isMac = window.navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  if (!isMac) {
    return null; // Only show custom controls on macOS
  }

  const handleMinimize = () => {
    window.electronAPI.minimizeWindow();
  };

  const handleMaximize = () => {
    window.electronAPI.maximizeWindow();
  };

  const handleClose = () => {
    window.electronAPI.closeWindow();
  };

  return (
    <div className="window-controls">
      <button
        className="window-control window-control-close"
        onClick={handleClose}
        title="Close"
        aria-label="Close window"
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <circle cx="6" cy="6" r="5.5" fill="currentColor" />
          <path d="M4 4l4 4M8 4l-4 4" stroke="var(--bg-primary)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <button
        className="window-control window-control-minimize"
        onClick={handleMinimize}
        title="Minimize"
        aria-label="Minimize window"
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <circle cx="6" cy="6" r="5.5" fill="currentColor" />
          <path d="M3 6h6" stroke="var(--bg-primary)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <button
        className="window-control window-control-maximize"
        onClick={handleMaximize}
        title="Maximize"
        aria-label="Maximize window"
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <circle cx="6" cy="6" r="5.5" fill="currentColor" />
          <path d="M4 4h4v4H4z" stroke="var(--bg-primary)" strokeWidth="1.5" fill="none" />
        </svg>
      </button>
    </div>
  );
};

export default WindowControls;

