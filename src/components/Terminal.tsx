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

    // Create terminal instance with clean minimal configuration
    const terminal = new XTerm({
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      fontSize: 14,
      theme: {
        background: '#ffffff',
        foreground: '#000000',
        cursor: '#000000'
      },
      cursorBlink: true,
      convertEol: true
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

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <div ref={terminalRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};