import React from 'react';
import NoteCard from './NoteCard';

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line" />
      <div className="skeleton-line medium" />
      <div className="skeleton-line short" />
      <div className="skeleton-line xs" />
    </div>
  );
}

export default function NotesList({ notes, isLoading, error, onRetry }) {
  return (
    <div className="notes-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          <span className="icon">📋</span>
          Notes
          {!isLoading && notes.length > 0 && (
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontWeight: 500,
              marginLeft: 4,
            }}>
              ({notes.length})
            </span>
          )}
        </h2>
        {!isLoading && (
          <button className="btn btn-ghost btn-sm" onClick={onRetry} id="refresh-notes">
            🔄 Refresh
          </button>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-banner-icon">⚠️</span>
          <span className="error-banner-text">{error}</span>
          <button className="btn btn-ghost btn-sm" onClick={onRetry}>Retry</button>
        </div>
      )}

      {isLoading && (
        <div className="skeleton-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!isLoading && !error && notes.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h3>No notes yet</h3>
          <p>Connect your wallet and add the first on-chain note to the NoteKeeper contract.</p>
        </div>
      )}

      {!isLoading && notes.length > 0 && (
        <div className="notes-grid">
          {notes.map((note, i) => (
            <NoteCard key={i} note={note} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
