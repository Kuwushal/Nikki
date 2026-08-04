import { useEffect, useState } from 'react';
import { db } from '../db/db';
import { Trash2, Plus, ExternalLink } from 'lucide-react';

const types = ['Course', 'Book', 'Article', 'Video', 'Other'];
const typeColors = { Course: 'var(--blue)', Book: 'var(--purple)', Article: 'var(--green)', Video: 'var(--red)', Other: 'var(--orange)' };

export default function Learning() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', url: '', type: 'Course', progress: 0, notes: '' });

  const load = () => db.learning.toArray().then(setItems);
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await db.learning.add({ ...form, progress: Number(form.progress) });
    setForm({ title: '', url: '', type: 'Course', progress: 0, notes: '' });
    load();
  };

  const updateProgress = async (id, progress) => {
    await db.learning.update(id, { progress: Number(progress) });
    load();
  };

  const remove = async (id) => { await db.learning.delete(id); load(); };

  return (
    <div className="page">
      <h1 className="page-title">Learning Hub</h1>
      <div className="card" style={{ padding: '20px 24px', marginBottom: 24 }}>
        <form onSubmit={add} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" className="input" style={{ flex: 2 }} />
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input" style={{ flex: 1 }}>
              {types.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="URL (optional)" className="input" style={{ flex: 2 }} />
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="input" style={{ flex: 2 }} />
            <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}><Plus size={15} /> Add</button>
          </div>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {items.map(item => {
          const color = typeColors[item.type] || 'var(--blue)';
          return (
            <div key={item.id} className="card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ flex: 1, paddingRight: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                    <span className="badge" style={{ background: `${color}20`, color, fontSize: 11 }}>{item.type}</span>
                    {item.url && <a href={item.url} target="_blank" rel="noreferrer" style={{ color: 'var(--text-3)' }}><ExternalLink size={12} /></a>}
                  </div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item.title}</p>
                  {item.notes && <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-3)' }}>{item.notes}</p>}
                </div>
                <button onClick={() => remove(item.id)} className="btn-icon" style={{ color: 'var(--text-3)' }}><Trash2 size={14} /></button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="range" min={0} max={100} value={item.progress}
                  onChange={e => updateProgress(item.id, e.target.value)}
                  style={{ flex: 1, accentColor: color }} />
                <span style={{ fontSize: 13, fontWeight: 600, color, width: 36, textAlign: 'right' }}>{item.progress}%</span>
              </div>
              <div className="progress-track" style={{ marginTop: 6 }}>
                <div className="progress-fill" style={{ width: `${item.progress}%`, background: color }} />
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)', fontSize: 14, gridColumn: '1/-1' }}>
            Nothing to learn yet. Add your first resource 📚
          </div>
        )}
      </div>
    </div>
  );
}
