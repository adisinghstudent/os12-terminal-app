import React, { useState, useEffect } from 'react';

export const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      textAlign: 'center'
    }}>
      <div style={{
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        fontSize: '14px',
        color: '#000'
      }}>
        {formatTime(time)}
      </div>
      <div style={{
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        fontSize: '14px',
        color: '#000',
        marginTop: '4px'
      }}>
        {formatDate(time)}
      </div>
    </div>
  );
};