import React, { useState, useEffect } from 'react';
import DraggableWindow from './DraggableWindow';

export default function ClockWidget({ playClick, ...dragProps }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const formatDate = (date) => date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <DraggableWindow title="sys_clock.exe" width={320} {...dragProps}>
      <div style={{ padding: '24px' }}>
        <div style={{ background: '#fff', border: '2px solid var(--window-border)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
          <div className="clock-display" onClick={playClick} style={{ cursor: 'pointer' }}>{formatTime(time)}</div>
          <div className="clock-date">{formatDate(time)}</div>
        </div>
        
        <div style={{ background: '#fff', border: '2px solid var(--window-border)', borderRadius: '8px', padding: '12px 16px' }}>
          <div className="status-row"><span>SKY STATUS</span><span className="badge-online">ONLINE</span></div>
          <div className="status-row"><span>NETWORK</span><span className="text-primary">Stellar Testnet</span></div>
          <div className="status-row"><span>WEATHER</span><span style={{ color: 'var(--accent-pink)' }}>☁️ Peaceful</span></div>
          <div className="status-row"><span>UPLINK</span><span className="text-primary">Stable (24ms)</span></div>
        </div>
      </div>
    </DraggableWindow>
  );
}
