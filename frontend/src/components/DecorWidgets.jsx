import React from 'react';
import DraggableWindow from './DraggableWindow';

export function AffirmationWidget({ playClick, ...dragProps }) {
  return (
    <DraggableWindow title="affirmations.txt" width={300} {...dragProps}>
      <div style={{ background: 'var(--accent-blue)', color: '#1e1b4b', textAlign: 'center', padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p style={{ fontSize: '1.4rem', marginTop: '10px', marginBottom: '20px' }} onClick={playClick}>
          just happy you're here.
        </p>
        <div className="flex-center gap-4">
          <div style={{ flex: 1, height: '30px', background: 'rgba(255,255,255,0.4)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ letterSpacing: '8px' }}>🤍🤍🤍</span>
          </div>
          <div style={{ width: '50px', height: '30px', background: 'rgba(255,255,255,0.4)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            :)
          </div>
        </div>
      </div>
    </DraggableWindow>
  );
}

export function DailyWidget({ playClick, ...dragProps }) {
  return (
    <DraggableWindow title="daily.exe" width={240} {...dragProps}>
      <div className="flex-center" style={{ flexDirection: 'column', padding: '30px 20px', height: '100%' }}>
        <div style={{ border: '2px solid var(--accent-pink)', borderRadius: '12px', padding: '20px', width: '100%', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--accent-pink)', fontSize: '1.8rem', marginBottom: '16px' }}>STAY HYDRATED</h3>
          <button className="retro-btn" style={{ width: '100%' }} onClick={(e) => { e.stopPropagation(); playClick(); }}>OK</button>
        </div>
      </div>
    </DraggableWindow>
  );
}
