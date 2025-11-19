import React from 'react';
import { createRoot } from 'react-dom/client';
import ProjectDetailsView from './components/ProjectDetailsView';
import './styles.css';

// VS Code webview API
declare const acquireVsCodeApi: () => {
  postMessage: (message: any) => void;
  getState: () => any;
  setState: (state: any) => void;
};

const vscode = acquireVsCodeApi();

const root = createRoot(document.getElementById('root')!);
root.render(<ProjectDetailsView vscode={vscode} />);

