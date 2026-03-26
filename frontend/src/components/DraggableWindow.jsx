import React, { useState, useEffect, useCallback } from 'react';

export default function DraggableWindow({ 
  title, 
  initialPosition, 
  children, 
  isActive, 
  onFocus,
  width = 300,
  height = 'auto',
  className = '',
  isDraggable = true
}) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    if (!isDraggable) return;
    // Only drag from the titlebar
    if (e.target.closest('.window-titlebar')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      onFocus();
    }
  };

  const handlePointerMove = useCallback((e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  }, [isDragging, dragOffset]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    } else {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

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
        cursor: isDragging ? 'grabbing' : (isDraggable ? 'default' : 'default'),
        touchAction: isDraggable ? 'none' : 'auto'
      }}
      onPointerDown={(e) => {
        onFocus();
        if (isDraggable) handlePointerDown(e);
      }}
    >
      <div 
        className="window-titlebar"
        style={{ cursor: isDraggable ? 'grab' : 'default' }}
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
