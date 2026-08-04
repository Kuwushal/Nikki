import { useEffect, useState } from 'react';
import { db } from '../db/db';
import { Trash2, Plus, Edit2, X } from 'lucide-react';

const today = new Date().toISOString().split('T')[0];
const accentColors = ['var(--blue)', 'var(--green)', 'var(--orange)', 'var(--purple)', 'var(--cyan)', 'var(--red)'];
const accentClasses = ['card-blue', 'card-green', 'card-orange', 'card-purple', 'card-cyan', 'card-red'];

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [editId, setEditId] = useState(null);

  const load = () => db.habits.toArray().then(setHabits);
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (editId) {
      await db.habits.update(editId, { title, frequency });
      setEditId(null);
    } else {
      await db.habits.add({ title, frequency, completedDates: [] });
    }
    setTitle(''); setFrequency('daily');
    load();
  };

  const startEdit = (h) => { setEditId(h.id); setTitle(h.title); setFrequency(h.frequency); };
  const cancelEdit = () => { setEditId(null); setTitle(''); setFrequency('daily'); };

  const toggle = async (habit) => {
    const dates = habit.completedDates || [];
    const updated = dates.includes(today) ? dates.filter(d => d !== today) : [...dates, today];
    await db.habits.update(habit.id, { completedDates: updated });
    load();
  };

  const remove = async (id) => { await db.habits.delete(id); if (editId === id) cancelEdit(); load(); };

  const streak = (dates) => {
    let count = 0;
    const d = new Date();
    while ((dates || []).includes(d.toISOString().split('T')[0])) { count++; d.setDate(d.getDate() - 1); }
    return count;
  };

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const doneToday = habits.filter(h => (h.completedDates || []).includes(today)).length;
  const pct = habits.length ? Math.round((doneToday / habits.length) * 100) : 0;

  return (
    <div className="page">
      <h1 className="page-title">Habits</h1>

      {habits.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', background: 'var(--surface)', border: '1px solid var(--border-strong)', borderLeft: '4px solid var(--green)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', boxShadow: 'var(--shadow-card)', marginBottom: 20, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--green)', letterSpacing: '-1px' }}>{pct}%</span>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-3)' }}>Today</span>
          </div>
          <div style={{ padding: '18px 22px' }}>
            <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--text-2)' }}>{doneToday} of {habits.length} habits completed</p>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--green)' }} /></div>
          </div>
        </div>
      )}

      <div className="card-flat" style={{ padding: '12px 14px', marginBottom: 18, borderLeft: editId ? '3px solid var(--orange)' : undefined }}>
        {editId && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--orange)' }}>Editing habit</span>
            <button onClick={cancelEdit} className="btn-icon"><X size={13} /></button>
          </div>
        )}
        <form onSubmit={submit} style={{ display: 'flex', gap: 8 }}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Habit name..." className="input" />
          <select value={frequency} onChange={e => setFrequency(e.target.value)} className="input" style={{ width: 'auto' }}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
          <button type="submit" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
            {editId ? 'Update' : <><Plus size={13} style={{ pointerEvents: 'none' }} /> Add</>}
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {habits.map((h, i) => {
          const done = (h.completedDates || []).includes(today);
          const s = streak(h.completedDates);
          const color = accentColors[i % accentColors.length];
          const cls = accentClasses[i % accentClasses.length];
          return (
            <div key={h.id} className={`card ${cls}`} style={{ padding: '14px 18px', outline: editId === h.id ? '2px solid var(--orange)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <button onClick={() => toggle(h)} className={`habit-ring${done ? ' done' : ''}`} style={{ borderColor: done ? color : 'var(--border-strong)', background: done ? color : undefined }}>
                  {done && '✓'}
                </button>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{h.title}</p>
                  <p style={{ margin: '1px 0 0', fontSize: 11, color: 'var(--text-3)', textTransform: 'capitalize' }}>{h.frequency}</p>
                </div>
                {s > 0 && <span className="badge" style={{ background: 'var(--orange-soft)', color: 'var(--orange)', borderColor: 'rgba(234,88,12,0.2)', fontSize: 11 }}>🔥 {s}d</span>}
                <button onClick={() => startEdit(h)} className="btn-icon"><Edit2 size={12} /></button>
                <button onClick={() => remove(h.id)} className="btn-icon"><Trash2 size={12} /></button>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {last7.map(d => {
                  const filled = (h.completedDates || []).includes(d);
                  const isToday = d === today;
                  return <div key={d} style={{ flex: 1, height: 4, borderRadius: 2, background: filled ? color : 'var(--surface-2)', border: isToday ? `1px solid ${color}` : '1px solid transparent', transition: 'background 0.2s ease' }} />;
                })}
              </div>
            </div>
          );
        })}
        {habits.length === 0 && <div className="card-flat" style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)', fontSize: 13, fontStyle: 'italic' }}>No habits yet.</div>}
      </div>
    </div>
  );
}
