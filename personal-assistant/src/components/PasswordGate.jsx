import { useState, useEffect, useRef } from 'react';

const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export default function PasswordGate({ onUnlock }) {
  const [dots, setDots] = useState(0);
  const [error, setError] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [blink, setBlink] = useState(true);
  const valueRef = useRef('');
  const unlockingRef = useRef(false);
  const inputRef = useRef();

  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 530);
    return () => clearInterval(t);
  }, []);

  // Auto-focus hidden input on mobile to trigger keyboard
  useEffect(() => {
    if (isMobile() && inputRef.current) inputRef.current.focus();
  }, []);

  function submit(val) {
    if (unlockingRef.current) return;
    if (val === 'oreimo@567') {
      unlockingRef.current = true;
      setUnlocking(true);
      setTimeout(onUnlock, 1400);
    } else {
      setError(true);
      valueRef.current = '';
      setDots(0);
      if (inputRef.current) inputRef.current.value = '';
      setTimeout(() => setError(false), 1000);
    }
  }

  // Desktop — global keydown
  useEffect(() => {
    const handler = (e) => {
      if (isMobile()) return; // let mobile input handle it
      if (unlockingRef.current) return;
      if (e.key === 'Enter') {
        submit(valueRef.current);
      } else if (e.key === 'Backspace') {
        valueRef.current = valueRef.current.slice(0, -1);
        setDots(valueRef.current.length);
      } else if (e.key.length === 1) {
        valueRef.current += e.key;
        setDots(valueRef.current.length);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onUnlock]);

  return (
    <div
      onClick={() => { if (isMobile() && inputRef.current) inputRef.current.focus(); }}
      style={{
      minHeight: '100vh',
      background: '#0e0e10',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Hidden input for mobile keyboard */}
      <input
        ref={inputRef}
        type="password"
        autoComplete="off"
        onChange={e => {
          valueRef.current = e.target.value;
          setDots(e.target.value.length);
        }}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit(valueRef.current); } }}
        style={{
          position: 'fixed', opacity: 0, pointerEvents: isMobile() ? 'auto' : 'none',
          width: 1, height: 1, top: 0, left: 0, zIndex: -1,
        }}
      />

      {/* Radial glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(37,99,235,0.07) 0%, transparent 70%)',
      }} />

      {/* Subtle grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
      }} />

      {/* Corner marks */}
      {[
        { top: 28, left: 28 },
        { top: 28, right: 28 },
        { bottom: 28, left: 28 },
        { bottom: 28, right: 28 },
      ].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute', ...pos,
          width: 18, height: 18, pointerEvents: 'none',
          borderTop: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
          borderBottom: i >= 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
          borderLeft: i % 2 === 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
          borderRight: i % 2 === 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
        }} />
      ))}

      {/* Top label */}
      <div style={{
        position: 'absolute', top: 32, left: '50%', transform: 'translateX(-50%)',
        fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.12)',
        fontFamily: 'monospace', textTransform: 'uppercase', whiteSpace: 'nowrap',
      }}>
        personal · assistant
      </div>

      {/* Center */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 48, position: 'relative', zIndex: 1 }}>
        {unlocking ? (
          // Unlocking — plain fading dots, no glow
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 5, height: 5, borderRadius: '50%',
                background: 'rgba(255,255,255,0.25)',
                animation: `fade 1.2s ease ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        ) : dots === 0 && !error ? (
          // Idle blinking dot
          <div style={{
            width: 5, height: 5, borderRadius: '50%',
            background: blink ? 'rgba(255,255,255,0.22)' : 'transparent',
            border: '1px solid rgba(255,255,255,0.12)',
            transition: 'background 0.15s',
          }} />
        ) : (
          // Typing — glowing dots
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {Array.from({ length: dots }).map((_, i) => (
              <div key={i} style={{
                width: 7, height: 7, borderRadius: '50%',
                background: error ? 'rgba(220,38,38,0.9)' : 'rgba(255,255,255,0.95)',
                boxShadow: error
                  ? '0 0 8px rgba(220,38,38,0.9), 0 0 20px rgba(220,38,38,0.4)'
                  : '0 0 8px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.35)',
                transition: 'background 0.2s, box-shadow 0.2s',
                animation: `popIn 0.15s ease`,
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Error hint */}
      <div style={{
        position: 'absolute', bottom: '44%',
        fontSize: 10, letterSpacing: '0.15em', fontFamily: 'monospace',
        color: 'rgba(220,38,38,0.5)',
        opacity: error ? 1 : 0,
        transition: 'opacity 0.2s',
        textTransform: 'uppercase',
      }}>
        incorrect
      </div>

      {/* Bottom hint */}
      <div style={{
        position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
        fontSize: 10, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.08)',
        fontFamily: 'monospace', whiteSpace: 'nowrap',
      }}>
        type password · tap screen · press enter
      </div>

      <style>{`
        @keyframes fade {
          0%, 100% { opacity: 0.15; }
          50%       { opacity: 0.5; }
        }
        @keyframes popIn {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
