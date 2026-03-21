import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from './hooks/useWallet';
import { fetchNotes, submitNote } from './lib/stellar';
import WalletConnect from './components/WalletConnect';
import AddNoteForm from './components/AddNoteForm';
import NotesList from './components/NotesList';

export default function App() {
  const wallet = useWallet();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const loadNotes = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const result = await fetchNotes();
      setNotes(result);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
      setFetchError(err.message || 'Failed to fetch notes from the blockchain');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  async function handleSubmitNote(content) {
    if (!wallet.address) throw new Error('Wallet not connected');
    await submitNote(wallet.address, content);
    // Refresh notes after submission (with short delay for on-chain confirmation)
    setTimeout(loadNotes, 3000);
  }

  return (
    <div className="app-container">
      <div className="floating-stickers">
        <img src="/assets/cat1.png" alt="cat with bow" className="sticker cat-sticker cat-sticker-1" />
        <img src="/assets/cat2.png" alt="cat with strawberry" className="sticker cat-sticker cat-sticker-2" />
        <img src="/assets/cat3.png" alt="hugging cats" className="sticker cat-sticker cat-sticker-3" />
        <span className="sticker sticker-4">🌸</span>
        <span className="sticker sticker-5">✨</span>
        <span className="sticker sticker-6">⭐</span>
      </div>

      <header className="app-header">
        <div className="app-logo">
          <div className="app-logo-icon">🦄</div>
          <div>
            <h1 className="title-with-sparkles">
              <span className="title-sparkle title-sparkle-left">✨</span>
              NoteKeeper
              <span className="title-sparkle title-sparkle-right">⭐</span>
            </h1>
            <p className="app-subtitle">Decentralized notes on Stellar</p>
          </div>
        </div>
        <WalletConnect
          address={wallet.address}
          isConnected={wallet.isConnected}
          isConnecting={wallet.isConnecting}
          error={wallet.error}
          connect={wallet.connect}
          disconnect={wallet.disconnect}
        />
      </header>

      <main className="app-main-content">
        <AddNoteForm
          isConnected={wallet.isConnected}
          onSubmit={handleSubmitNote}
        />
        <NotesList
          notes={notes}
          isLoading={isLoading}
          error={fetchError}
          onRetry={loadNotes}
        />
      </main>
    </div>
  );
}
