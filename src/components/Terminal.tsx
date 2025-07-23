import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

export const Terminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!terminalRef.current) {
      console.log('❌ Terminal ref not available');
      return;
    }

    console.log('🚀 Initializing terminal component...');

    // Create terminal instance with better configuration
    const terminal = new XTerm({
      fontFamily: '"Cascadia Code", "Fira Code", Monaco, Menlo, "Ubuntu Mono", monospace',
      fontSize: 14,
      lineHeight: 1.2,
      letterSpacing: 0,
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        cursorAccent: '#000000',
        selection: '#264f78',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5'
      },
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 1000,
      tabStopWidth: 4,
      convertEol: true,
      allowTransparency: false
    });

    console.log('✅ Terminal instance created');

    // Create and load fit addon
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    console.log('✅ Fit addon loaded');

    // Open terminal in the DOM
    terminal.open(terminalRef.current);
    console.log('✅ Terminal opened in DOM');

    // Initial fit
    setTimeout(() => {
      fitAddon.fit();
      console.log(`📏 Terminal fitted: ${terminal.cols}x${terminal.rows}`);
      setIsInitialized(true);
    }, 100);

    // Store refs
    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Handle resize with debouncing
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (fitAddon && terminal) {
          try {
            fitAddon.fit();
            console.log(`📏 Terminal resized: ${terminal.cols}x${terminal.rows}`);
            // Update terminal size in pty
            window.electronAPI?.terminalResize(terminal.cols, terminal.rows);
          } catch (error) {
            console.error('❌ Error during resize:', error);
          }
        }
      }, 150);
    };
    
    window.addEventListener('resize', handleResize);
    console.log('✅ Resize handler attached');

    // Handle terminal input with logging
    const handleTerminalInput = (data: string) => {
      console.log('📤 Terminal input:', JSON.stringify(data));
      // Send data to terminal process
      window.electronAPI?.terminalInput(data);
    };
    
    terminal.onData(handleTerminalInput);
    console.log('✅ Input handler attached');

    // Handle terminal output with logging
    const handleTerminalData = (data: string) => {
      console.log('📥 Received terminal data:', JSON.stringify(data.substring(0, 100)) + (data.length > 100 ? '...' : ''));
      try {
        terminal.write(data);
      } catch (error) {
        console.error('❌ Error writing to terminal:', error);
      }
    };
    
    // Set up terminal data listener
    if (window.electronAPI?.onTerminalData) {
      window.electronAPI.onTerminalData(handleTerminalData);
      console.log('✅ Terminal data listener attached');
    } else {
      console.error('❌ electronAPI.onTerminalData not available');
    }

    // Initial resize after everything is set up
    setTimeout(() => {
      handleResize();
      terminal.focus();
      console.log('🎯 Terminal focused and ready');
    }, 200);

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up terminal component...');
      
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      
      if (window.electronAPI?.removeTerminalDataListener) {
        window.electronAPI.removeTerminalDataListener();
        console.log('✅ Terminal data listener removed');
      }
      
      if (terminal) {
        terminal.dispose();
        console.log('✅ Terminal disposed');
      }
    };
  }, []);

  // Add a status indicator
  const terminalStyle: React.CSSProperties = {
    height: '100%',
    width: '100%',
    position: 'relative',
    backgroundColor: '#1e1e1e',
    border: '1px solid #333'
  };

  const statusStyle: React.CSSProperties = {
    position: 'absolute',
    top: '5px',
    right: '10px',
    color: isInitialized ? '#0dbc79' : '#f14c4c',
    fontSize: '12px',
    fontFamily: 'monospace',
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: '2px 6px',
    borderRadius: '3px'
  };

  return (
    <div style={terminalStyle}>
      <div style={statusStyle}>
        {isInitialized ? '🟢 READY' : '🔄 INIT'}
      </div>
      <div ref={terminalRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};