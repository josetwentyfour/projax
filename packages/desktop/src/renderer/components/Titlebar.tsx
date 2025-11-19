import React from 'react';
import './Titlebar.css';

interface TitlebarProps {
  children?: React.ReactNode;
}

const Titlebar: React.FC<TitlebarProps> = ({ children }) => {
  return (
    <div className="app-header">
      {children}
    </div>
  );
};

export default Titlebar;

