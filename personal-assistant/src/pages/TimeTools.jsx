import { useEffect, useRef, useState } from 'react';

function pad(n) { return String(n).padStart(2, '0'); }
function fmt(s) { return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`; }

const worldZones = [
  { label: 'New York', tz: 'America/New_York', flag: '🇺🇸' },
  { label: 'London', tz: 'Europe/London', flag: '🇬🇧' },
  { label: 'Paris', tz: 'Europe/Paris', flag: '🇫🇷' },
  { label: 'Dubai', tz: 'Asia/Dubai', flag: '🇦🇪' },
  { label: 'Kathmandu', tz: 'Asia/Kathmandu', flag: '🇳🇵' },
  { label: 'Tokyo', tz: 'Asia/Tokyo', flag: '🇯🇵' },
  { label: 'Sydney', tz: 'Australia/Sydney', flag: '🇦🇺' },
];

export default function TimeTools() {
  const [tab, setTab] = useState('clock');
  const [now, setNow] = useState(new Date());
  const [sw, setSw] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const swRef = useRef(null);
  const [cdInput, setCdInput] = useState(300);
  const [cd, setCd] = useState(null);
  const [cdRunning, setCdRunning] = useState(false);
  const cdRef = useRef(null);
  const [pomo, setPomo] = useState(25 * 60);
  const [pomoRunning, setPomoRunning] = useState(false);
  const [pomoMode, setPomoMode] = useState('work');
  const pomoRef = useRef(null);

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    if (swRunning) swRef.current = setInterval(() => setSw(s => s + 1), 1000);
    else clearInterval(swRef.current);
    return () => clearInterval(swRef.current);
  }, [swRunning]);
  useEffect(() => {
    if (cdRunning && cd > 0) cdRef.current = setInterval(() => setCd(s => { if (s <= 1) { setCdRunning(false); return 0; } return s - 1; }), 1000);
    else clearInterval(cdRef.current);
    return () => clearInterval(cdRef.current);
  }, [cdRunning]);
  useEffect(() => {
    if (pomoRunning) pomoRef.current = setInterval(() => setPomo(s => {
      if (s <= 1) {
        setPomoRunning(false);
        const next = pomoMode === 'work' ? 'break' : 'work';
        setPomoMode(next);
        return next === 'work' ? 25 * 60 : 5 * 60;
      }
      return s - 1;
    }), 1000);
    else clearInterval(pomoRef.current);
    return () => clearInterval(pomoRef.current);
  }, [pomoRunning, pomoMode]);

  const tabs = [
    { id: 'clock', label: '🕐 Clock' },
    { id: 'stopwatch', label: '⏱ Stopwatch' },
    { id: 'countdown', label: '⏳ Countdown' },
    { id: 'pomodoro', label: '🍅 Pomodoro' },
    { id: 'world', label: '🌍 World' },
  ];

  const pomoColor = pomoMode === 'work' ? 'var(--red)' : 'var(--green)';
  const pomoPct = pomoMode === 'work' ? (pomo / (25 * 60)) * 100 : (pomo / (5 * 60)) * 100;

  return (
    <div className="page" style={{ maxWidth: 600 }}>
      <h1 className="page-title">Time Tools</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 500,
            border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
            background: tab === t.id ? 'var(--blue)' : 'var(--surface)',
            color: tab === t.id ? 'white' : 'var(--text-2)',
            boxShadow: tab === t.id ? '0 2px 10px rgba(0,122,255,0.3)' : 'var(--shadow-sm)',
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'clock' && (
        <div className="card" style={{ padding: '48px 40px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px', fontSize: 64, fontWeight: 200, letterSpacing: '-2px', color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
            {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p style={{ margin: 0, fontSize: 16, color: 'var(--text-3)', fontWeight: 400 }}>
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      )}

      {tab === 'stopwatch' && (
        <div className="card" style={{ padding: '48px 40px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 32px', fontSize: 56, fontWeight: 200, letterSpacing: '-2px', fontVariantNumeric: 'tabular-nums', color: 'var(--text)' }}>{fmt(sw)}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button onClick={() => setSwRunning(r => !r)} className="btn btn-primary" style={{ minWidth: 100 }}>{swRunning ? 'Pause' : 'Start'}</button>
            <button onClick={() => { setSwRunning(false); setSw(0); }} className="btn btn-secondary">Reset</button>
          </div>
        </div>
      )}

      {tab === 'countdown' && (
        <div className="card" style={{ padding: '48px 40px', textAlign: 'center' }}>
          {cd === null ? (
            <div style={{ marginBottom: 32 }}>
              <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--text-3)', fontWeight: 500 }}>Set duration (seconds)</p>
              <input type="number" value={cdInput} onChange={e => setCdInput(Number(e.target.value))} min={1}
                className="input" style={{ textAlign: 'center', fontSize: 24, fontWeight: 300, width: 160, margin: '0 auto' }} />
            </div>
          ) : (
            <p style={{ margin: '0 0 32px', fontSize: 56, fontWeight: 200, letterSpacing: '-2px', fontVariantNumeric: 'tabular-nums', color: cd < 10 ? 'var(--red)' : 'var(--text)' }}>{fmt(cd)}</p>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            {cd === null ? (
              <button onClick={() => { setCd(cdInput); setCdRunning(true); }} className="btn btn-primary">Start</button>
            ) : (
              <>
                <button onClick={() => setCdRunning(r => !r)} className="btn btn-primary" style={{ minWidth: 100 }}>{cdRunning ? 'Pause' : 'Resume'}</button>
                <button onClick={() => { setCd(null); setCdRunning(false); }} className="btn btn-secondary">Reset</button>
              </>
            )}
          </div>
        </div>
      )}

      {tab === 'pomodoro' && (
        <div className="card" style={{ padding: '48px 40px', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto 32px' }}>
            <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="80" cy="80" r="70" fill="none" stroke="var(--surface-2)" strokeWidth="8" />
              <circle cx="80" cy="80" r="70" fill="none" stroke={pomoColor} strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - pomoPct / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: pomoColor, textTransform: 'uppercase', letterSpacing: '1px' }}>{pomoMode}</span>
              <span style={{ fontSize: 28, fontWeight: 600, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{fmt(pomo)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button onClick={() => setPomoRunning(r => !r)} className="btn btn-primary" style={{ minWidth: 100, background: pomoColor }}>{pomoRunning ? 'Pause' : 'Start'}</button>
            <button onClick={() => { setPomoRunning(false); setPomoMode('work'); setPomo(25 * 60); }} className="btn btn-secondary">Reset</button>
          </div>
        </div>
      )}

      {tab === 'world' && (
        <div className="card" style={{ padding: '8px 0', overflow: 'hidden' }}>
          {worldZones.map((z, i) => (
            <div key={z.tz} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 24px', borderBottom: i < worldZones.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>{z.flag}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{z.label}</span>
              </div>
              <span style={{ fontSize: 16, fontWeight: 300, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}>
                {now.toLocaleTimeString('en-US', { timeZone: z.tz, hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
