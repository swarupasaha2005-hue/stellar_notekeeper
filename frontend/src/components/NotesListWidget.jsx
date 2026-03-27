import React, { useState } from 'react';
import DraggableWindow from './DraggableWindow';

export default function NotesListWidget({ notes, currentAddress, isLoading, error, onRetry, onUpdate, onDelete, playClick, ...dragProps }) {
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const startEdit = (e, note) => {
    e.stopPropagation(); playClick();
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const handleUpdate = async (e, id) => {
    e.stopPropagation(); playClick();
    if (!editContent.trim()) return;
    setProcessingId(id);
    try {
      await onUpdate(id, editContent.trim());
      setEditingId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); playClick();
    if (!window.confirm('Delete this dream forever?')) return;
    setProcessingId(id);
    try {
      await onDelete(id);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <DraggableWindow title="saved_dreams.dir" width={500} height={420} {...dragProps}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px' }}>
        <div className="flex-between" style={{ borderBottom: '2px dotted var(--window-border)', paddingBottom: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ letterSpacing: '0.1em', fontSize: '1.2rem', fontWeight: 'bold' }}>NETWORK DRIVE: DREAMS</div>
            <div className="mt-4 flex-center gap-2" style={{ justifyContent: 'flex-start', fontSize: '1.4rem', color: 'var(--text-primary)' }}>
              <span>⭐</span> DREAMS
            </div>
          </div>
          <button className="retro-btn outline" style={{ fontSize: '1.2rem', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => { e.stopPropagation(); playClick(); onRetry(); }}>
            <span style={{ fontSize: '1.4rem' }}>🔄</span> RELOAD
          </button>
        </div>

        <div style={{ flex: 1, border: '4px dashed var(--window-border)', borderRadius: '12px', overflowY: 'auto', padding: '16px', background: 'var(--window-bg)', opacity: 0.8 }}>
          {isLoading && <div className="text-center" style={{ fontSize: '2rem', marginTop: '40px' }}>Loading Data...</div>}
          {error && <div className="text-center" style={{ color: 'red', marginTop: '20px' }}>{error}</div>}

          {!isLoading && !error && notes.length === 0 && (
            <div className="flex-center" style={{ flexDirection: 'column', height: '100%', color: 'var(--text-main)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.5 }}>🗄️</div>
              <h3 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', letterSpacing: '0.1em' }}>NO DREAMS FOUND</h3>
              <p style={{ fontSize: '1.2rem', marginTop: '10px' }}>Connect your wallet to upload data,</p>
              <p style={{ fontSize: '1.2rem' }}>or clear deleted notes.</p>
            </div>
          )}

          {!isLoading && notes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {notes.map((note, i) => (
                <div key={note.id || i} className="dream-item" onClick={playClick}>
                  <div className="flex-between dream-owner">
                    <span>[OWNER: {note.owner.substring(0,4)}...{note.owner.substring(note.owner.length-4)}]</span>
                    
                    {currentAddress === note.owner && (
                      <div className="flex-center gap-2">
                        {processingId === note.id ? (
                          <span style={{color: 'var(--text-primary)'}}>PROCESSING...</span>
                        ) : editingId === note.id ? (
                          <>
                            <button className="retro-btn outline" style={{padding:'2px 8px', fontSize:'1rem'}} onClick={(e) => {e.stopPropagation(); setEditingId(null);}}>X</button>
                            <button className="retro-btn" style={{padding:'2px 8px', fontSize:'1rem'}} onClick={(e) => handleUpdate(e, note.id)}>SAVE</button>
                          </>
                        ) : (
                          <>
                            <button className="retro-btn outline" style={{padding:'2px 8px', fontSize:'1rem'}} onClick={(e) => startEdit(e, note)}>✏️</button>
                            <button className="retro-btn outline" style={{padding:'2px 8px', fontSize:'1rem', borderColor: '#f43f5e', color: '#f43f5e'}} onClick={(e) => handleDelete(e, note.id)}>🗑️</button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {editingId === note.id ? (
                    <textarea 
                      value={editContent} 
                      onChange={e => setEditContent(e.target.value)}
                      className="retro-textarea"
                      style={{ height: '80px', marginTop: '8px', fontSize: '1.2rem' }}
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <div>{note.content}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DraggableWindow>
  );
}
