import { useEffect, useState } from 'react';
import { db } from '../db/db';
import { Trash2, Plus, Search } from 'lucide-react';

export default function Wiki() {
  const [pages, setPages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [search, setSearch] = useState('');

  const load = () => db.wiki.orderBy('updatedAt').reverse().toArray().then(setPages);
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!title.trim()) return;
    if (selected) {
      await db.wiki.update(selected, { title, content, updatedAt: Date.now() });
    } else {
      const id = await db.wiki.add({ title, content, updatedAt: Date.now() });
      setSelected(id);
    }
    load();
  };

  const newPage = () => { setSelected(null); setTitle(''); setContent(''); };
  const open = (p) => { setSelected(p.id); setTitle(p.title); setContent(p.content); };
  const remove = async (id) => { await db.wiki.delete(id); if (selected === id) newPage(); load(); };

  const filtered = pages.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div style={{ width: 260, borderRight: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', padding: '20px 12px', gap: 8, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', marginBottom: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Wiki</span>
          <button onClick={newPage} className="btn-icon"><Plus size={15} /></button>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pages..." className="input" style={{ paddingLeft: 30, fontSize: 13 }} />
        </div>
        {filtered.map(p => (
          <div key={p.id} onClick={() => open(p)} style={{
            padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
            background: selected === p.id ? 'var(--blue-soft)' : 'transparent',
            transition: 'background 0.15s ease',
          }}
            onMouseEnter={e => { if (selected !== p.id) e.currentTarget.style.background = 'var(--surface-2)'; }}
            onMouseLeave={e => { if (selected !== p.id) e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: selected === p.id ? 'var(--blue)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{p.title}</p>
              <button onClick={e => { e.stopPropagation(); remove(p.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '0 0 0 6px' }}><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 40px', background: 'var(--bg)', overflow: 'auto' }}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Page title"
          style={{ fontSize: 26, fontWeight: 700, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text)', marginBottom: 16, fontFamily: 'inherit', letterSpacing: '-0.3px' }} />
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write your wiki content..."
          style={{ flex: 1, border: 'none', outline: 'none', resize: 'none', background: 'transparent', color: 'var(--text)', fontSize: 15, lineHeight: 1.7, fontFamily: 'monospace' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <button onClick={save} className="btn btn-primary btn-sm">Save Page</button>
        </div>
      </div>
    </div>
  );
}
