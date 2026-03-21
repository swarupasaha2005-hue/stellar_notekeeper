import React from 'react';

export default function DraggableWindow({ 
  title, 
  initialPosition, 
  children, 
  isActive, 
  onFocus,
  width = 300,
  height = 'auto',
  className = ''
}) {
  const position = initialPosition;

  return (
    <div 
      className={`retro-window ${className}`}
      style={{
        position: 'absolute',
        top: position?.y ?? 0,
        left: position?.x ?? 0,
        width,
        height,
        zIndex: isActive ? 50 : 10,
        boxShadow: isActive ? '10px 10px 0px rgba(177, 181, 252, 0.6)' : 'var(--window-shadow)',
        transition: 'box-shadow 0.2s ease',
      }}
      onPointerDown={onFocus}
    >
      <div 
        className="window-titlebar"
      >
        <span>{title}</span>
        <span className="window-controls">[-] x</span>
      </div>
      <div className="window-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {children}
      </div>
    </div>
  );
}
