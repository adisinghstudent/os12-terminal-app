import React, { useState, useEffect } from 'react';

interface McpConfig {
  mcpServers?: Record<string, any>;
}

export const McpEditor: React.FC = () => {
  const [config, setConfig] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Load MCP config on component mount
    loadMcpConfig();
  }, []);

  const loadMcpConfig = async () => {
    try {
      const mcpConfig = await window.electronAPI?.loadMcpConfig();
      if (mcpConfig) {
        setConfig(JSON.stringify(mcpConfig, null, 2));
      } else {
        // Default MCP config
        const defaultConfig: McpConfig = {
          mcpServers: {
            filesystem: {
              command: ['uv', 'tool', 'run', 'mcp-server-filesystem'],
              args: [process.cwd()]
            }
          }
        };
        setConfig(JSON.stringify(defaultConfig, null, 2));
      }
    } catch (error) {
      console.error('Failed to load MCP config:', error);
    }
  };

  const handleSave = async () => {
    try {
      const parsedConfig = JSON.parse(config);
      await window.electronAPI?.saveMcpConfig(parsedConfig);
      setIsEditing(false);
    } catch (error) {
      console.error('Invalid JSON or save failed:', error);
      alert('Invalid JSON format or save failed');
    }
  };

  const handleConfigChange = (value: string) => {
    setConfig(value);
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        marginBottom: '16px', 
        fontSize: '14px', 
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        color: '#000'
      }}>
        MCP Configuration
      </div>
      
      <textarea
        value={config}
        onChange={(e) => handleConfigChange(e.target.value)}
        style={{
          flex: 1,
          padding: '0',
          border: 'none',
          borderRadius: '0',
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          fontSize: '14px',
          resize: 'none',
          outline: 'none',
          backgroundColor: 'white',
          color: '#000'
        }}
        placeholder="MCP server configuration..."
      />
      
      {isEditing && (
        <div
          onClick={handleSave}
          style={{
            marginTop: '12px',
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            fontSize: '14px',
            cursor: 'pointer',
            color: '#000'
          }}
        >
          [Save Changes]
        </div>
      )}
    </div>
  );
};