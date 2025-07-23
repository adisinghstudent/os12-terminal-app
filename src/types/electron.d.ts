export interface ElectronAPI {
  terminalInput: (data: string) => Promise<void>;
  terminalResize: (cols: number, rows: number) => Promise<void>;
  loadMcpConfig: () => Promise<any>;
  saveMcpConfig: (config: any) => Promise<boolean>;
  onTerminalData: (callback: (data: string) => void) => void;
  removeTerminalDataListener: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}