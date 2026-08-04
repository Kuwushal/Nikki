import { useEffect, useState } from 'react';
import { db } from '../db/db';
import { Trash2, Edit2, X } from 'lucide-react';

const types = ['Movie', 'TV Show', 'Anime', 'Manga', 'YouTube', 'Podcast', 'Other'];
const statuses = ['Want to', 'In Progress', 'Completed'];
const statusColors = { 'Want to': 'var(--blue)', 'In Progress': 'var(--orange)', 'Completed': 'var(--green)' };
const statusBg = { 'Want to': 'var(--blue-soft)', 'In Progress': 'var(--orange-soft)', 'Completed': 'var(--green-soft)' };
const statusIcons = { 'Want to': '🎯', 'In Progress': '▶️', 'Completed': '✅' };
const typeAccent = { Movie: 'card-purple', 'TV Show': 'card-blue', Anime: 'card-red', Manga: 'card-orange', YouTube: 'card-red', Podcast: 'card-cyan', Other: 'card-blue' };

const empty = { title: '', type: 'Movie', status: 'Want to', rating: '', notes: '' };

export default function Entertainment() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [typeFilter, setTypeFilter] = useState('All');

  const load = () => db.entertainment.toArray().then(setItems);
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const data = { ...form, rating: form.rating ? Number(form.rating) : null };
    if (editId) {
      await db.entertainment.update(editId, data);
      setEditId(null);
    } else {
      await db.entertainment.add(data);
    }
    setForm(empty);
    load();
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setForm({ title: item.title, type: item.type, status: item.status, rating: item.rating ?? '', notes: item.notes ?? '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => { setEditId(null); setForm(empty); };
  const remove = async (id) => { await db.entertainment.delete(id); if (editId === id) cancelEdit(); load(); };

  const byType = typeFilter === 'All' ? items : items.filter(i => i.type === typeFilter);

  return (
    <div className="page">
      <h1 className="page-title">Entertainment</h1>

      {/* Add / Edit form */}
      <div className="card-flat" style={{ padding: '16px 18px', marginBottom: 18, borderLeft: editId ? '3px solid var(--orange)' : undefined }}>
        {editId && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--orange)' }}>Editing entry</span>
            <button onClick={cancelEdit} className="btn-icon"><X size={13} /></button>
          </div>
        )}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" className="input" />
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input">
              {types.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input">
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
            <input type="number" min={1} max={10} value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} placeholder="Rating /10" className="input" style={{ width: 110 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optional)" className="input" style={{ flex: 1 }} />
            <button type="submit" className="btn btn-primary" style={{ flexShrink: 0, minWidth: 80 }}>
              {editId ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>

      {/* Type filter */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}>
        {['All', ...types].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`chip${typeFilter === t ? ' active' : ''}`}>{t}</button>
        ))}
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {statuses.map(status => {
          const sectionItems = byType.filter(i => i.status === status);
          const color = statusColors[status];
          const bg = statusBg[status];
          const icon = statusIcons[status];

          return (
            <div key={status}>
              {/* Section header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
                paddingBottom: 10, borderBottom: '1px solid var(--border)'
              }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <h2 style={{ fontSize: 14, fontWeight: 700, color, margin: 0 }}>{status}</h2>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 8px',
                  borderRadius: 6, background: bg, color,
                  border: `1px solid ${color}30`
                }}>
                  {sectionItems.length}
                </span>
              </div>

              {sectionItems.length === 0 ? (
                <div style={{
                  padding: '20px', textAlign: 'center', color: 'var(--text-3)',
                  fontSize: 12, fontStyle: 'italic',
                  background: 'var(--surface)', borderRadius: 'var(--radius-sm)',
                  border: '1px dashed var(--border-strong)'
                }}>
                  Nothing {status === 'Want to' ? 'in your watchlist' : status === 'In Progress' ? 'in progress' : 'completed'} yet.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                  {sectionItems.map(item => {
                    const cls = typeAccent[item.type] || 'card-blue';
                    return (
                      <div key={item.id} className={`card ${cls}`} style={{ padding: '16px 18px', outline: editId === item.id ? '2px solid var(--orange)' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text)', flex: 1, paddingRight: 8 }}>{item.title}</p>
                          <div style={{ display: 'flex', gap: 2 }}>
                            <button onClick={() => startEdit(item)} className="btn-icon"><Edit2 size={12} /></button>
                            <button onClick={() => remove(item.id)} className="btn-icon"><Trash2 size={12} /></button>
                          </div>
                        </div>
                        <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-2)', borderColor: 'var(--border-strong)', fontSize: 10 }}>{item.type}</span>
                        {item.notes && <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--text-3)' }}>{item.notes}</p>}
                        {item.rating && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 10 }}>
                            {Array.from({ length: 10 }, (_, i) => (
                              <div key={i} style={{ width: 5, height: 5, borderRadius: 1, background: i < item.rating ? 'var(--orange)' : 'var(--surface-3)' }} />
                            ))}
                            <span style={{ fontSize: 11, color: 'var(--orange)', fontWeight: 700, marginLeft: 5 }}>{item.rating}/10</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
