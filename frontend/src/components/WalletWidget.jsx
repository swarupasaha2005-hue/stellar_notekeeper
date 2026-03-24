import React from 'react';
import DraggableWindow from './DraggableWindow';

export default function WalletWidget({ address, balance, isConnected, isConnecting, error, connect, disconnect, playClick, ...dragProps }) {
  const shortAddress = address ? `${address.substring(0, 4)}...${address.substring(address.length - 4)}` : '';

  return (
    <DraggableWindow title="notekeeper.exe" width={280} {...dragProps}>
      <div className="flex-center" style={{ flexDirection: 'column', gap: '16px', padding: '16px' }}>
        <h3 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', letterSpacing: '0.1em' }}>
          WELCOME DREAMER ✨
        </h3>

        {error && <div style={{ color: 'red', fontSize: '1.2rem' }}>{error}</div>}

        {isConnected ? (
          <div className="flex-center" style={{ flexDirection: 'column', gap: '12px', width: '100%' }}>
            <div style={{ width: '100%', border: '2px solid var(--accent-green)', borderRadius: '12px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(167,243,208,0.1)' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-green)' }}></div>
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{shortAddress}</span>
            </div>
            
            <div style={{ width: '100%', textAlign: 'center', padding: '8px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '4px' }}>BALANCE</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-blue)' }}>{balance} XLM</div>
            </div>

            <button className="retro-btn outline" onClick={(e) => { e.stopPropagation(); playClick(); disconnect(); }} style={{ width: '100%', fontSize: '1.2rem', padding: '8px' }}>
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
