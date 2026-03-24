import React, { useState } from 'react';
import DraggableWindow from './DraggableWindow';
import { sendXLM } from '../lib/stellar';

export default function TransferWidget({ address, isConnected, refreshBalance, playClick, ...dragProps }) {
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [issubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string, hash?: string }

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!isConnected) return;
    
    playClick();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const result = await sendXLM(address, destination, amount);
      setStatus({
        type: 'success',
        message: 'Transfer successful!',
        hash: result.hash
      });
      setDestination('');
      setAmount('');
      refreshBalance();
    } catch (err) {
      console.error('Transfer failed:', err);
      setStatus({
        type: 'error',
        message: err.message || 'Transfer failed'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DraggableWindow title="transfer_xlm.exe" width={320} {...dragProps}>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>DESTINATION ADDRESS</label>
            <input
              type="text"
              className="retro-input"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="G..."
              required
              disabled={issubmitting || !isConnected}
              style={{ width: '100%', padding: '8px', fontSize: '1rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AMOUNT (XLM)</label>
            <input
              type="number"
              step="0.0000001"
              className="retro-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              required
              disabled={issubmitting || !isConnected}
              style={{ width: '100%', padding: '8px', fontSize: '1rem' }}
            />
          </div>

          <button
            type="submit"
            className="retro-btn"
            disabled={issubmitting || !isConnected}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {issubmitting ? 'SENDING...' : 'SEND XLM'}
          </button>
        </form>

        {status && (
          <div style={{ 
            padding: '12px', 
            borderRadius: '8px', 
            fontSize: '0.9rem',
            background: status.type === 'success' ? 'rgba(167,243,208,0.2)' : 'rgba(254,202,202,0.2)',
            border: `1px solid ${status.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)'}`,
            color: 'var(--text-primary)',
            wordBreak: 'break-all'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {status.type === 'success' ? '✅ success' : '❌ Error'}
            </div>
            <div>{status.message}</div>
            {status.hash && (
              <div style={{ marginTop: '8px', fontSize: '0.75rem', opacity: 0.8 }}>
                Hash: <a 
                  href={`https://stellar.expert/explorer/testnet/tx/${status.hash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}
                >
                  {status.hash.substring(0, 8)}...{status.hash.substring(status.hash.length - 8)}
                </a>
              </div>
            )}
          </div>
        )}
        
        {!isConnected && (
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-red)', textAlign: 'center' }}>
            Please connect your wallet to send XLM
          </div>
        )}
      </div>
    </DraggableWindow>
  );
}
