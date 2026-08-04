import { useEffect, useState } from 'react';
import { db } from '../db/db';
import { Trash2, Plus, Search } from 'lucide-react';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [search, setSearch] = useState('');

  const load = () => db.notes.orderBy('updatedAt').reverse().toArray().then(setNotes);
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!title.trim()) return;
    if (selected) {
      await db.notes.update(selected, { title, content, updatedAt: Date.now() });
    } else {
      const id = await db.notes.add({ title, content, updatedAt: Date.now() });
      setSelected(id);
    }
    load();
  };

  const newNote = () => { setSelected(null); setTitle(''); setContent(''); };
  const open = (n) => { setSelected(n.id); setTitle(n.title); setContent(n.content); };
  const remove = async (id) => { await db.notes.delete(id); if (selected === id) newNote(); load(); };

  const filtered = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || (n.content || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar panel */}
      <div style={{
        width: 260, borderRight: '1px solid var(--border)',
        background: 'var(--surface)', display: 'flex', flexDirection: 'column',
        padding: '20px 12px', gap: 8, overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', marginBottom: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Notes</span>
          <button onClick={newNote} className="btn-icon"><Plus size={15} /></button>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." className="input" style={{ paddingLeft: 30, fontSize: 13 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
          {filtered.map(n => (
            <div key={n.id} onClick={() => open(n)} style={{
              padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
              background: selected === n.id ? 'var(--blue-soft)' : 'transparent',
              transition: 'background 0.15s ease',
            }}
              onMouseEnter={e => { if (selected !== n.id) e.currentTarget.style.background = 'var(--surface-2)'; }}
              onMouseLeave={e => { if (selected !== n.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: selected === n.id ? 'var(--blue)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{n.title || 'Untitled'}</p>
                <button onClick={e => { e.stopPropagation(); remove(n.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '0 0 0 6px', flexShrink: 0 }}><Trash2 size={12} /></button>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {n.content ? n.content.slice(0, 50) : 'No content'}
              </p>
            </div>
          ))}
          {filtered.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-3)', padding: '12px 4px' }}>No notes found.</p>}
        </div>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 40px', background: 'var(--bg)', overflow: 'auto' }}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Note title"
          style={{
            fontSize: 26, fontWeight: 700, border: 'none', outline: 'none',
            background: 'transparent', color: 'var(--text)', marginBottom: 16,
            fontFamily: 'inherit', letterSpacing: '-0.3px',
          }}
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Start writing..."
          style={{
            flex: 1, border: 'none', outline: 'none', resize: 'none',
            background: 'transparent', color: 'var(--text)', fontSize: 15,
            lineHeight: 1.7, fontFamily: 'inherit',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <button onClick={save} className="btn btn-primary btn-sm">Save Note</button>
        </div>
      </div>
    </div>
  );
}
