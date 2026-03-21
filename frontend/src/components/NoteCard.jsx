import React, { useState } from 'react';

export default function NoteCard({ note, index }) {
  const [copied, setCopied] = useState(false);

  const ownerStr = typeof note.owner === 'string' ? note.owner : note.owner?.toString?.() ?? 'Unknown';
  const truncatedOwner = ownerStr.length > 12
    ? `${ownerStr.slice(0, 4)}…${ownerStr.slice(-4)}`
    : ownerStr;

  function handleCopy() {
    navigator.clipboard.writeText(ownerStr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="note-card card" style={{ animationDelay: `${0.05 * (index ?? 0)}s` }}>
      <p className="note-content">{note.content}</p>
      <div className="note-meta">
        <span className="note-owner" onClick={handleCopy} title={`Click to copy: ${ownerStr}`}>
          👤 {copied ? <span className="copy-tooltip">Copied!</span> : truncatedOwner}
        </span>
        <span className="note-badge">On-chain</span>
      </div>
    </div>
  );
}
