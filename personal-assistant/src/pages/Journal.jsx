import { useEffect, useState } from 'react';
import { db } from '../db/db';
import { Trash2, Edit2 } from 'lucide-react';
import { DateInput } from '../components/DateTimeInputs';

const moods = [
  { emoji: '😊', label: 'Happy', color: 'var(--green)' },
  { emoji: '😐', label: 'Neutral', color: 'var(--orange)' },
  { emoji: '😔', label: 'Sad', color: 'var(--blue)' },
  { emoji: '😤', label: 'Frustrated', color: 'var(--red)' },
  { emoji: '😴', label: 'Tired', color: 'var(--purple)' },
  { emoji: '🤩', label: 'Excited', color: 'var(--cyan)' },
];

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('😊');
  const [editId, setEditId] = useState(null);

  const load = () => db.journal.orderBy('date').reverse().toArray().then(setEntries);
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!content.trim()) return;
    if (editId) {
      await db.journal.update(editId, { date, content, mood });
      setEditId(null);
    } else {
      await db.journal.add({ date, content, mood });
    }
    setContent(''); setDate(new Date().toISOString().split('T')[0]); setMood('😊');
    load();
  };

  const open = (e) => { setEditId(e.id); setDate(e.date); setContent(e.content); setMood(e.mood); };
  const remove = async (id) => { await db.journal.delete(id); if (editId === id) { setEditId(null); setContent(''); } load(); };

  return (
    <div className="page">
      <h1 className="page-title">Journal</h1>

      <div className="card-flat" style={{ padding: '20px 22px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <DateInput value={date} onChange={e => setDate(e.target.value)} style={{ width: 'auto' }} />
          {editId && <span style={{ fontSize: 11, color: 'var(--orange)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Editing</span>}
        </div>
        <div style={{ marginBottom: 14 }}>
          <p className="section-label" style={{ marginBottom: 8 }}>Mood</p>
          <div style={{ display: 'flex', gap: 6 }}>
            {moods.map(m => (
              <button key={m.emoji} onClick={() => setMood(m.emoji)} className={`mood-btn${mood === m.emoji ? ' selected' : ''}`} title={m.label}>{m.emoji}</button>
            ))}
          </div>
        </div>
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} placeholder="What's on your mind?" className="input" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          {editId && <button onClick={() => { setEditId(null); setContent(''); }} className="btn btn-secondary btn-sm">Cancel</button>}
          <button onClick={save} className="btn btn-primary btn-sm">{editId ? 'Update' : 'Save Entry'}</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {entries.map(e => {
          const moodObj = moods.find(m => m.emoji === e.mood) || moods[0];
          return (
            <div key={e.id} className="card" style={{ padding: '16px 20px', borderLeftColor: moodObj.color }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{e.mood}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                      {new Date(e.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: moodObj.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{moodObj.label}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => open(e)} className="btn-icon"><Edit2 size={12} /></button>
                  <button onClick={() => remove(e.id)} className="btn-icon"><Trash2 size={12} /></button>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{e.content}</p>
            </div>
          );
        })}
        {entries.length === 0 && (
          <div className="card-flat" style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)', fontSize: 13, fontStyle: 'italic' }}>
            Your journal is empty. Start writing.
          </div>
        )}
      </div>
    </div>
  );
}
