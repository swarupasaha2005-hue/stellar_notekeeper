import React from 'react';

export default function WalletConnect({ address, isConnected, isConnecting, error, connect, disconnect }) {
  if (isConnected && address) {
    const truncated = `${address.slice(0, 4)}…${address.slice(-4)}`;
    return (
      <div className="wallet-section">
        <div className="wallet-info">
          <span className="wallet-dot" />
          <span className="wallet-address" title={address}>{truncated}</span>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={disconnect}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-section">
      {error && <span style={{ fontSize: '0.78rem', color: 'var(--error)', marginRight: 8 }}>{error}</span>}
      <button className="btn btn-primary" onClick={connect} disabled={isConnecting}>
        {isConnecting ? (
          <>
            <span className="spinner spinner-sm" />
            Connecting…
          </>
        ) : (
          <>🔗 Connect Wallet</>
        )}
      </button>
    </div>
  );
}
