import React, { useState } from 'react';
import DraggableWindow from './DraggableWindow';

const MAX_CHARS = 280;

export default function AddNoteWidget({ isConnected, onSubmit, playClick, ...dragProps }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!content.trim() || !isConnected || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DraggableWindow title="new_dream.txt" width={320} height={240} {...dragProps}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px' }}>
        <textarea
          className="retro-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
          placeholder={isConnected ? '> log your dream here...' : '> connect wallet first'}
          disabled={!isConnected || isSubmitting}
        />
        <div className="flex-between mt-4">
          <div style={{ padding: '4px 12px', border: '2px dashed var(--window-border)', borderRadius: '4px', fontSize: '1.2rem' }}>
            [ {content.length.toString().padStart(3, '0')} / {MAX_CHARS} ]
          </div>
          <button 
            className="retro-btn"
            disabled={!isConnected || !content.trim() || isSubmitting}
            onClick={(e) => { e.stopPropagation(); playClick(); handleSubmit(); }}
          >
            {isSubmitting ? 'SAVING...' : '💾 PIN THOUGHT'}
          </button>
        </div>
      </div>
    </DraggableWindow>
  );
}
