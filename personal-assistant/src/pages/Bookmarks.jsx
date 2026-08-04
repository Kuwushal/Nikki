import { useEffect, useState } from 'react';
import { db } from '../db/db';
import { Trash2, Plus, ExternalLink, Search } from 'lucide-react';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [form, setForm] = useState({ title: '', url: '', tags: '' });
  const [search, setSearch] = useState('');

  const load = () => db.bookmarks.toArray().then(setBookmarks);
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.url.trim()) return;
    await db.bookmarks.add({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) });
    setForm({ title: '', url: '', tags: '' });
    load();
  };

  const remove = async (id) => { await db.bookmarks.delete(id); load(); };

  const filtered = bookmarks.filter(b =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.url?.toLowerCase().includes(search.toLowerCase()) ||
    (b.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page">
      <h1 className="page-title">Bookmarks</h1>
      <div className="card" style={{ padding: '20px 24px', marginBottom: 20 }}>
        <form onSubmit={add} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" className="input" />
            <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="URL" className="input" style={{ flex: 2 }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma separated)" className="input" />
            <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}><Plus size={15} /> Add</button>
          </div>
        </form>
      </div>

      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bookmarks..." className="input" style={{ paddingLeft: 34 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {filtered.map(b => (
          <div key={b.id} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <a href={b.url} target="_blank" rel="noreferrer" style={{ fontSize: 14, fontWeight: 600, color: 'var(--blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, flex: 1 }}>
                {b.title || b.url} <ExternalLink size={12} />
              </a>
              <button onClick={() => remove(b.id)} className="btn-icon" style={{ color: 'var(--text-3)', marginLeft: 6 }}><Trash2 size={13} /></button>
            </div>
            <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.url}</p>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {(b.tags || []).map(t => (
                <span key={t} className="badge" style={{ background: 'var(--blue-soft)', color: 'var(--blue)', fontSize: 11 }}>{t}</span>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)', fontSize: 14, gridColumn: '1/-1' }}>
            No bookmarks yet. Save your first link 🔖
          </div>
        )}
      </div>
    </div>
  );
}
