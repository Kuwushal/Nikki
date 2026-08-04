import { useEffect, useState } from 'react';
import { db } from '../db/db';
import { Trash2, Plus, Edit2, X } from 'lucide-react';
import { DateInput } from '../components/DateTimeInputs';

const colors = ['var(--blue)', 'var(--purple)', 'var(--green)', 'var(--orange)', 'var(--cyan)', 'var(--red)'];
const classes = ['card-blue', 'card-purple', 'card-green', 'card-orange', 'card-cyan', 'card-red'];
const empty = { title: '', description: '', deadline: '', progress: 0 };

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const load = () => db.goals.toArray().then(setGoals);
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editId) {
      await db.goals.update(editId, { ...form, progress: Number(form.progress), done: form.progress >= 100 ? 1 : 0 });
      setEditId(null);
    } else {
      await db.goals.add({ ...form, progress: Number(form.progress), done: 0 });
    }
    setForm(empty);
    load();
  };

  const startEdit = (g) => {
    setEditId(g.id);
    setForm({ title: g.title, description: g.description || '', deadline: g.deadline || '', progress: g.progress });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => { setEditId(null); setForm(empty); };
  const updateProgress = async (id, progress) => { await db.goals.update(id, { progress: Number(progress), done: progress >= 100 ? 1 : 0 }); load(); };
  const remove = async (id) => { await db.goals.delete(id); if (editId === id) cancelEdit(); load(); };

  return (
    <div className="page">
      <h1 className="page-title">Goals</h1>

      <div className="card-flat" style={{ padding: '18px 20px', marginBottom: 22, borderLeft: editId ? '3px solid var(--orange)' : undefined }}>
        {editId && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--orange)' }}>Editing goal</span>
            <button onClick={cancelEdit} className="btn-icon"><X size={13} /></button>
          </div>
        )}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Goal title" className="input" style={{ fontSize: 14 }} />
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)" className="input" />
          <div style={{ display: 'flex', gap: 8 }}>
            <DateInput value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            <button type="submit" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
              {editId ? 'Update' : <><Plus size={13} style={{ pointerEvents: 'none' }} /> Add Goal</>}
            </button>
          </div>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 12 }}>
        {goals.map((g, i) => {
          const color = colors[i % colors.length];
          const cls = classes[i % classes.length];
          const r = 32;
          const circ = 2 * Math.PI * r;
          return (
            <div key={g.id} className={`card ${cls}`} style={{ padding: '20px 22px', outline: editId === g.id ? '2px solid var(--orange)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ flex: 1, paddingRight: 12 }}>
                  <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{g.title}</p>
                  {g.description && <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--text-3)' }}>{g.description}</p>}
                  {g.deadline && <p style={{ margin: 0, fontSize: 11, color: 'var(--text-3)' }}>📅 {g.deadline}</p>}
                </div>
                <div style={{ position: 'relative', width: 70, height: 70, flexShrink: 0 }}>
                  <svg width="70" height="70" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="35" cy="35" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="6" />
                    <circle cx="35" cy="35" r={r} fill="none" stroke={color} strokeWidth="6"
                      strokeDasharray={circ} strokeDashoffset={circ * (1 - g.progress / 100)}
                      strokeLinecap="square" style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(0.16,1,0.3,1)' }} />
                  </svg>
                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color }}>{g.progress}%</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="range" min={0} max={100} value={g.progress} onChange={e => updateProgress(g.id, e.target.value)} style={{ flex: 1, accentColor: color }} />
                <button onClick={() => startEdit(g)} className="btn-icon"><Edit2 size={13} /></button>
                <button onClick={() => remove(g.id)} className="btn-icon"><Trash2 size={13} /></button>
              </div>
              {g.done === 1 && <span className="badge" style={{ marginTop: 10, background: 'var(--green-soft)', color: 'var(--green)', borderColor: 'rgba(22,163,74,0.2)' }}>✓ Completed</span>}
            </div>
          );
        })}
        {goals.length === 0 && (
          <div className="card-flat" style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)', fontSize: 13, fontStyle: 'italic', gridColumn: '1/-1' }}>No goals set yet.</div>
        )}
      </div>
    </div>
  );
}
