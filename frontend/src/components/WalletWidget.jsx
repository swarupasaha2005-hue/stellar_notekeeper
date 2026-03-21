import React from 'react';
import DraggableWindow from './DraggableWindow';

export default function WalletWidget({ address, isConnected, isConnecting, error, connect, disconnect, playClick, ...dragProps }) {
  const shortAddress = address ? `${address.substring(0, 4)}...${address.substring(address.length - 4)}` : '';

  return (
    <DraggableWindow title="notekeeper.exe" width={280} {...dragProps}>
      <div className="flex-center" style={{ flexDirection: 'column', gap: '16px', padding: '16px' }}>
        <h3 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', letterSpacing: '0.1em' }}>
          WELCOME DREAMER ✨
        </h3>

        {error && <div style={{ color: 'red', fontSize: '1.2rem' }}>{error}</div>}

        {isConnected ? (
          <div className="flex-center gap-4" style={{ width: '100%' }}>
            <div style={{ flex: 1, border: '2px solid var(--accent-green)', borderRadius: '24px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(167,243,208,0.2)' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-green)' }}></div>
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{shortAddress}</span>
            </div>
            <button className="retro-btn outline" onClick={(e) => { e.stopPropagation(); playClick(); disconnect(); }} style={{ fontSize: '1.2rem', padding: '6px 12px' }}>
              Disconnect
            </button>
          </div>
        ) : (
          <button 
            className="retro-btn" 
            onClick={(e) => { e.stopPropagation(); playClick(); connect(); }} 
            disabled={isConnecting}
            style={{ width: '100%' }}
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </DraggableWindow>
  );
}
