import React, { useState, useEffect, useRef } from 'react';
import DraggableWindow from './DraggableWindow';

class LofiSynth {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.isPlaying = false;
    this.nextNoteTime = 0;
    this.currentChord = 0;
    this.tempo = 80;
    this.chords = [
      [261.63, 329.63, 392.00, 493.88],
      [220.00, 261.63, 329.63, 392.00],
      [174.61, 220.00, 261.63, 329.63],
      [196.00, 246.94, 293.66, 349.23],
    ];
  }

  playChord(freqs, time) {
    const duration = 2.0;
    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      filter.type = 'lowpass';
      filter.frequency.value = 800;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.1, time + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.start(time);
      osc.stop(time + duration);
    });
  }

  scheduler() {
    while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
      if (this.currentChord % 2 === 0) this.playCrackle(this.nextNoteTime);
      this.playChord(this.chords[Math.floor(this.currentChord / 4) % this.chords.length], this.nextNoteTime);
      this.nextNoteTime += (60.0 / this.tempo) * 2;
      this.currentChord++;
    }
    if (this.isPlaying) {
      this.timerID = requestAnimationFrame(() => this.scheduler());
    }
  }

  playCrackle(time) {
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 4000;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.02;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(time);
  }

  start() {
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.isPlaying = true;
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.scheduler();
  }

  stop() {
    this.isPlaying = false;
    cancelAnimationFrame(this.timerID);
  }
}

export default function MusicPlayerWidget({ playClick, ...dragProps }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const synthRef = useRef(null);

  useEffect(() => {
    synthRef.current = new LofiSynth();
    return () => { if (synthRef.current) synthRef.current.stop(); };
  }, []);

  useEffect(() => {
    let interval;
    if (playing) {
      interval = setInterval(() => setProgress(p => (p + 1) % 100), 1000);
    }
    return () => clearInterval(interval);
  }, [playing]);

  const togglePlay = (e) => {
    e.stopPropagation();
    playClick();
    if (playing) synthRef.current.stop();
    else synthRef.current.start();
    setPlaying(!playing);
  };

  return (
    <DraggableWindow title="vibes_player.exe" width={320} {...dragProps}>
      <div style={{ padding: '16px' }}>
        <div style={{ border: '2px dashed rgba(165,180,252,0.5)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
          <div className="flex-center gap-4">
            <div style={{ width: '40px', height: '40px', background: 'var(--accent-pink)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e1b4b' }}>
              🎵
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-primary)' }}>LOFI BEATS TO STUDY</div>
              <div style={{ fontSize: '1rem' }}>DREAMY FM</div>
            </div>
          </div>
        </div>
        
        <div className="music-progress">
          <div className="music-progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="flex-between text-sm" style={{ marginBottom: '20px' }}>
          <span>00:{progress.toString().padStart(2, '0')}</span>
          <span>01:40</span>
        </div>

        <div className="flex-center gap-4">
          <button className="retro-btn outline" onClick={(e) => { e.stopPropagation(); playClick(); }} style={{ padding: '4px 12px', fontSize: '1rem', border: 'none' }}>⏮</button>
          <button className="music-btn-giant" onClick={togglePlay}>{playing ? '⏸' : '▶'}</button>
          <button className="retro-btn outline" onClick={(e) => { e.stopPropagation(); playClick(); }} style={{ padding: '4px 12px', fontSize: '1rem', border: 'none' }}>⏭</button>
        </div>
      </div>
    </DraggableWindow>
  );
}
