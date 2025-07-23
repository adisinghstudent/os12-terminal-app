import React from 'react';
import { McpEditor } from './components/McpEditor';
import { Terminal } from './components/Terminal';
import { Clock } from './components/Clock';
import './App.css';

export const App: React.FC = () => {
  return (
    <div className="app">
      <div className="panel mcp-panel">
        <McpEditor />
      </div>
      <div className="panel terminal-panel">
        <Terminal />
      </div>
      <div className="panel clock-panel">
        <Clock />
      </div>
    </div>
  );
};