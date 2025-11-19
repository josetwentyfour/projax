import React from 'react';
import './Titlebar.css';

interface TitlebarProps {
  children?: React.ReactNode;
}

const Titlebar: React.FC<TitlebarProps> = ({ children }) => {
  return (
    <div className="app-header">
      <h1 className="app-logo">PROJAX</h1>
      {children}
    </div>
  );
};

export default Titlebar;

