import React from 'react';
import './Titlebar.css';

interface TitlebarProps {
  children?: React.ReactNode;
  tabBar?: React.ReactNode;
}

const Titlebar: React.FC<TitlebarProps> = ({ children, tabBar }) => {
  return (
    <div className="app-header">
      <div className="header-left">
        {tabBar && <div className="header-tabs">{tabBar}</div>}
      </div>
      {children}
    </div>
  );
};

export default Titlebar;

