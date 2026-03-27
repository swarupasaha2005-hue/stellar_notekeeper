import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from './hooks/useWallet';
import { fetchNotes, submitNote, updateNote, deleteNote } from './lib/stellar';

import AddNoteWidget from './components/AddNoteWidget';
import NotesListWidget from './components/NotesListWidget';
import WalletWidget from './components/WalletWidget';
import TransferWidget from './components/TransferWidget';
import ClockWidget from './components/ClockWidget';
import MusicPlayerWidget from './components/MusicPlayerWidget';
import { AffirmationWidget, DailyWidget } from './components/DecorWidgets';

export default function App() {
  const wallet = useWallet();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [theme, setTheme] = useState('light');
  const [activeWindow, setActiveWindow] = useState('saved_dreams');
  console.log("updated build");
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

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  async function handleSubmitNote(content) {
    if (!wallet.address) throw new Error('Wallet not connected');
    await submitNote(wallet.address, content);
    setTimeout(loadNotes, 3000);
  }

  async function handleUpdateNote(id, newContent) {
    if (!wallet.address) throw new Error('Wallet not connected');
    await updateNote(wallet.address, id, newContent);
    setTimeout(loadNotes, 3000);
  }

  async function handleDeleteNote(id) {
    if (!wallet.address) throw new Error('Wallet not connected');
    await deleteNote(wallet.address, id);
    setTimeout(loadNotes, 3000);
  }

  const playClick = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      // Ignore if audio fails or is blocked
    }
  }, []);

  const toggleTheme = () => {
    playClick();
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleDesktopClick = (e) => {
    if (e.target.className.includes('app-container')) {
      playClick();
      setActiveWindow('');
    }
  };

  const winW = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const winH = typeof window !== 'undefined' ? window.innerHeight : 800;

  return (
    <div className="app-container" style={{ width: '100%', height: '100%' }} onPointerDown={handleDesktopClick}>

      <div className="desktop-background-layer">
        <div className="cloud cloud-1">☁️</div>
        <div className="cloud cloud-2">☁️</div>
        <div className="cloud cloud-3">✨</div>
        <div className="city-silhouette"></div>
      </div>

      <h1 className="app-title-main">NOTEKEEPER</h1>

      <button className="theme-toggle-btn" onClick={toggleTheme}>
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <AddNoteWidget
        initialPosition={{ x: 58, y: 51 }}
        isDraggable={false}
        isActive={activeWindow === 'new_dream'}
        onFocus={() => setActiveWindow('new_dream')}
        isConnected={wallet.isConnected}
        onSubmit={handleSubmitNote}
        playClick={playClick}
      />

      <NotesListWidget
        initialPosition={{ x: 482, y: 115 }}
        isDraggable={false}
        isActive={activeWindow === 'saved_dreams'}
        onFocus={() => setActiveWindow('saved_dreams')}
        notes={notes}
        currentAddress={wallet.address}
        isLoading={isLoading}
        error={fetchError}
        onRetry={loadNotes}
        onUpdate={handleUpdateNote}
        onDelete={handleDeleteNote}
        playClick={playClick}
      />

      <WalletWidget
        initialPosition={{ x: 58, y: 323 }}
        isDraggable={false}
        isActive={activeWindow === 'notekeeper'}
        onFocus={() => setActiveWindow('notekeeper')}
        address={wallet.address}
        isConnected={wallet.isConnected}
        isConnecting={wallet.isConnecting}
        error={wallet.error}
        connect={wallet.connect}
        disconnect={wallet.disconnect}
        playClick={playClick}
      />

      <TransferWidget
        initialPosition={{ x: 1094, y: 503 }}
        isDraggable={false}
        isActive={activeWindow === 'transfer_xlm'}
        onFocus={() => setActiveWindow('transfer_xlm')}
        address={wallet.address}
        isConnected={wallet.isConnected}
        refreshBalance={wallet.refreshBalance}
        playClick={playClick}
      />

      <ClockWidget
        initialPosition={{ x: 1095, y: 50 }}
        isDraggable={false}
        isActive={activeWindow === 'sys_clock'}
        onFocus={() => setActiveWindow('sys_clock')}
        playClick={playClick}
      />

      <MusicPlayerWidget
        initialPosition={{ x: 60, y: 511 }}
        isDraggable={false}
        isActive={activeWindow === 'vibes_player'}
        onFocus={() => setActiveWindow('vibes_player')}
        playClick={playClick}
      />

      <AffirmationWidget
        initialPosition={{ x: 730, y: 593 }}
        isDraggable={false}
        isActive={activeWindow === 'affirmations'}
        onFocus={() => setActiveWindow('affirmations')}
        playClick={playClick}
      />

      <DailyWidget
        initialPosition={{ x: 441, y: 558 }}
        isDraggable={false}
        isActive={activeWindow === 'daily_hydrate'}
        onFocus={() => setActiveWindow('daily_hydrate')}
        playClick={playClick}
      />

    </div>
  );
}
