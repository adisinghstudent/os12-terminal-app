# OS12 Terminal Application - Technical Documentation

## 📋 Project Overview

**OS12 (Claude)** is an Electron-based terminal application that provides a modern terminal interface with integrated MCP (Model Context Protocol) editor functionality. Built with React, TypeScript, and powered by xterm.js for terminal emulation and node-pty for PTY processes.

### 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron Main Process                    │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │   src/      │  │    node-pty   │  │    IPC Handlers     │ │
│  │  index.ts   │◄─┤   Terminal    │◄─┤   (preload.ts)     │ │
│  │             │  │   Process     │  │                     │ │  
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │ IPC Communication
┌─────────────────────────────────────────────────────────────┐
│                   Renderer Process (React)                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │    App.tsx  │  │ Terminal.tsx │  │   McpEditor.tsx     │ │
│  │  (Layout)   │◄─┤  (xterm.js)  │  │   Clock.tsx         │ │
│  │             │  │              │  │                     │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🧩 Core Components

### 1. **Main Process (`src/index.ts`)**
- **Purpose**: Manages Electron main process, PTY creation, and IPC communication
- **Key Functions**:
  - `testNodePty()`: Tests node-pty functionality before terminal creation
  - `startTerminal()`: Creates and manages PTY processes
  - IPC handlers for terminal input/output and MCP configuration

### 2. **Terminal Component (`src/components/Terminal.tsx`)**
- **Purpose**: React component that renders xterm.js terminal interface
- **Features**:
  - Terminal initialization with xterm.js
  - Automatic resizing with FitAddon
  - Input/output handling via IPC
  - Clean logging and error handling

### 3. **Preload Script (`src/preload.ts`)**
- **Purpose**: Secure bridge between main and renderer processes
- **Exposed APIs**:
  - `terminalInput()`: Send input to PTY
  - `terminalResize()`: Resize PTY dimensions
  - `onTerminalData()`: Listen for terminal output
  - MCP configuration management

### 4. **MCP Editor (`src/components/McpEditor.tsx`)**
- **Purpose**: Configuration interface for Model Context Protocol settings
- **Features**: JSON editor for MCP server configurations

## 🔧 Technical Implementation

### Terminal Process Flow

1. **Initialization**:
   ```typescript
   // Main process starts PTY with optimal shell
   const shell = process.platform === 'darwin' ? '/bin/zsh' : '/bin/bash';
   ptyProcess = pty.spawn(shell, ['-l'], {
     cols: 80, rows: 24,
     cwd: os.homedir(),
     env: { ...process.env, TERM: 'xterm-256color' }
   });
   ```

2. **Data Flow**:
   ```
   User Input → Terminal.tsx → IPC → Main Process → PTY
   PTY Output → Main Process → IPC → Terminal.tsx → xterm.js
   ```

3. **Error Handling**:
   - PTY test validation before creation
   - Automatic terminal restart on crash
   - Comprehensive error logging

### Node-PTY Configuration

- **Shell Selection**: Platform-specific optimal shell
  - macOS: `/bin/zsh -l` (login shell with profile)
  - Linux: `/bin/bash -l`
  - Windows: `powershell.exe`
- **Environment**: Full environment inheritance with terminal-specific vars
- **Working Directory**: User home directory by default

## 🐛 Debugging Guide

### 1. **Terminal Issues**

**Symptoms**: "Terminal failed: node-pty test failed"
```bash
# Check node-pty compilation
npm list node-pty
node --version
npx electron --version

# Rebuild for correct Node.js version
npm rebuild node-pty --force
npx electron-rebuild
```

**Debug Logs Location**:
- Main process: Electron console (DevTools main process)
- Renderer: Browser DevTools console
- Terminal data: Look for `📤` and `📥` emoji logs

### 2. **Common Error Patterns**

| Error | Cause | Solution |
|-------|-------|----------|
| `posix_spawnp failed` | Shell not found | Check shell path exists |
| `NODE_MODULE_VERSION mismatch` | Wrong native build | `npm rebuild node-pty` |
| `No PTY for input` | PTY not initialized | Check startup logs |
| Terminal not responding | IPC communication issue | Restart Electron app |

### 3. **Debug Mode**

Enable verbose logging:
```typescript
// In src/index.ts, add more detailed logs
console.log('🔍 Debug - PTY Environment:', {
  shell, cwd: os.homedir(), 
  cols: ptyProcess.cols, 
  rows: ptyProcess.rows
});
```

## 🧪 Testing Procedures

### 1. **Automated Testing**

Create a test script to verify node-pty:
```javascript
const pty = require('node-pty');
const shell = process.platform === 'darwin' ? '/bin/zsh' : '/bin/bash';
const testPty = pty.spawn(shell, [], {
  cols: 80, rows: 24,
  cwd: require('os').homedir()
});
console.log('✅ PTY test successful:', testPty.pid);
testPty.kill();
```

### 2. **Manual Testing Checklist**

- [ ] Terminal starts without errors
- [ ] Can type commands and see output
- [ ] Terminal resize works properly
- [ ] Shell prompt appears correctly
- [ ] Command history navigation works
- [ ] Terminal survives window resize
- [ ] Auto-restart works after crash

### 3. **Performance Testing**

Monitor resource usage:
```bash
# Check memory usage
ps aux | grep -i electron
top -pid <electron-pid>

# Monitor PTY processes
ps aux | grep -E "(zsh|bash|pty)"
```

## 🔄 Development Workflow

### 1. **Setup & Installation**
```bash
git clone <repository>
cd os12-claude
npm install
npm rebuild node-pty --force  # Important for native modules
npm start
```

### 2. **Build Process**
- **Development**: `npm start` (hot reload enabled)
- **Production**: `npm run make` (creates distributable)
- **Linting**: `npm run lint`

### 3. **Native Module Handling**
- Node-pty requires compilation for specific Node.js/Electron versions
- Use `AutoUnpackNativesPlugin` in Forge configuration
- Webpack externals prevent bundling of native modules

## 🛠️ Configuration Files

### Key Files & Purpose

| File | Purpose | Notes |
|------|---------|-------|
| `forge.config.ts` | Electron Forge configuration | Handles native modules |
| `webpack.main.config.ts` | Main process webpack config | Node-pty externals |
| `webpack.renderer.config.ts` | Renderer webpack config | React/TypeScript |
| `tsconfig.json` | TypeScript configuration | Shared compiler settings |

### Environment Variables

```bash
# Terminal configuration
TERM=xterm-256color
COLORTERM=truecolor
SHELL=/bin/zsh  # Platform specific

# Development
NODE_ENV=development
ELECTRON_IS_DEV=1
```

## 🚨 Troubleshooting

### 1. **Terminal Won't Start**

```bash
# Verify node-pty installation
ls -la node_modules/node-pty/build/Release/
file node_modules/node-pty/build/Release/pty.node

# Check shell availability
which zsh bash sh
echo $SHELL
```

### 2. **Performance Issues**

```bash
# Monitor PTY processes
ps aux | grep pty
lsof -p <pty-pid>  # Check file descriptors

# Memory leaks
heap dump analysis in DevTools
```

### 3. **IPC Communication Problems**

```javascript
// Test IPC in DevTools console
window.electronAPI.terminalInput('echo test\r');

// Check preload script loading
console.log('electronAPI available:', !!window.electronAPI);
```

## 📊 Monitoring & Logging

### Log Levels & Emoji Guide

| Emoji | Level | Description |
|-------|-------|-------------|
| 🚀 | INFO | Process initialization |
| ✅ | SUCCESS | Operation completed |
| ❌ | ERROR | Operation failed |
| 🧪 | DEBUG | Testing/validation |
| 📤📥 | DATA | Input/output flow |
| 📏 | RESIZE | Dimension changes |
| 🔄 | RESTART | Process recovery |

### Performance Metrics

Monitor these key indicators:
- **PTY Startup Time**: Should be < 2 seconds
- **Memory Usage**: ~50-100MB per PTY process
- **Input Latency**: < 10ms for responsive typing
- **CPU Usage**: < 5% during normal operation

## 🔐 Security Considerations

### 1. **Process Isolation**
- PTY processes run with user permissions
- No privilege escalation
- Sandboxed renderer process

### 2. **IPC Security**
- Context isolation enabled
- No direct Node.js access in renderer
- Validated IPC message handling

### 3. **Shell Command Safety**
- No command injection in PTY spawn
- User input passed directly to shell
- Standard shell escaping applies

## 📈 Future Improvements

### Planned Features
- [ ] Multiple terminal tabs
- [ ] Customizable themes
- [ ] Plugin system for shell integrations
- [ ] Enhanced MCP server management
- [ ] Terminal session persistence
- [ ] Collaborative terminal sharing

### Performance Optimizations
- [ ] Virtual scrolling for large output
- [ ] WebGL-accelerated rendering
- [ ] Lazy terminal initialization
- [ ] Memory usage optimization

---

## 🆘 Quick Reference

### Emergency Fixes
```bash
# Complete reset
rm -rf node_modules package-lock.json
npm install
npm rebuild node-pty --force

# Terminal stuck
pkill -f "electron"
npm start

# Native module issues
npx electron-rebuild
```

### Support Commands
```bash
# System info
node --version && npm --version && npx electron --version
uname -a  # Platform details
echo $SHELL  # Current shell

# Debug mode
NODE_ENV=development npm start
```

This documentation should be updated as the application evolves. For additional support, check the console logs and refer to the specific error patterns outlined above. 