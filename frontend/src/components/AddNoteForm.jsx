import React, { useState } from 'react';

const MAX_CHARS = 280;

export default function AddNoteForm({ isConnected, onSubmit }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const charCount = content.length;
  const charClass = charCount >= MAX_CHARS ? 'at-limit' : charCount >= MAX_CHARS * 0.85 ? 'near-limit' : '';

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim() || !isConnected || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await onSubmit(content.trim());
      setContent('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.message || 'Failed to submit note');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="add-note-section">
      <h2 className="section-title">
        <span className="icon">✏️</span>
        Add a Note
      </h2>

      <form className="add-note-card" onSubmit={handleSubmit}>
        <textarea
          className="textarea"
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
          placeholder={isConnected ? 'Write your note here…' : 'Connect your wallet to add notes'}
          disabled={!isConnected || isSubmitting}
          id="note-input"
        />

        <div className="add-note-footer">
          <span className={`char-count ${charClass}`}>
            {charCount}/{MAX_CHARS}
          </span>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!isConnected || !content.trim() || isSubmitting}
            id="submit-note"
          >
            {isSubmitting ? (
              <>
                <span className="spinner spinner-sm" />
                Submitting…
              </>
            ) : (
              <>📝 Submit Note</>
            )}
          </button>
        </div>

        {error && (
          <div className="error-banner" style={{ marginTop: 16 }}>
            <span className="error-banner-icon">⚠️</span>
            <span className="error-banner-text">{error}</span>
          </div>
        )}

        {success && (
          <div className="success-toast">
            ✅ Note added successfully! It may take a moment to appear.
          </div>
        )}
      </form>
    </div>
  );
}
