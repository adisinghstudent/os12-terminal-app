import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  terminalInput: (data: string) => ipcRenderer.invoke('terminal-input', data),
  terminalResize: (cols: number, rows: number) => ipcRenderer.invoke('terminal-resize', cols, rows),
  loadMcpConfig: () => ipcRenderer.invoke('load-mcp-config'),
  saveMcpConfig: (config: any) => ipcRenderer.invoke('save-mcp-config', config),
  onTerminalData: (callback: (data: string) => void) => 
    ipcRenderer.on('terminal-data', (_event, data) => callback(data)),
  removeTerminalDataListener: () => ipcRenderer.removeAllListeners('terminal-data')
});
