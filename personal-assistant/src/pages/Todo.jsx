import { useEffect, useState } from 'react';
import { db } from '../db/db';
import { Trash2, Plus, Edit2, X } from 'lucide-react';
import { DateInput } from '../components/DateTimeInputs';

const priorities = [
  { label: 'Low', color: 'var(--green)', bg: 'var(--green-soft)' },
  { label: 'Medium', color: 'var(--orange)', bg: 'var(--orange-soft)' },
  { label: 'High', color: 'var(--red)', bg: 'var(--red-soft)' },
];

const empty = { title: '', dueDate: '', priority: 'Medium' };

export default function Todo() {
  const [todos, setTodos] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState('active');

  const load = () => db.todos.orderBy('createdAt').reverse().toArray().then(setTodos);
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editId) {
      await db.todos.update(editId, { title: form.title, dueDate: form.dueDate, priority: form.priority });
      setEditId(null);
    } else {
      await db.todos.add({ title: form.title, done: 0, dueDate: form.dueDate, priority: form.priority, createdAt: Date.now() });
    }
    setForm(empty);
    load();
  };

  const startEdit = (t) => {
    setEditId(t.id);
    setForm({ title: t.title, dueDate: t.dueDate || '', priority: t.priority || 'Medium' });
  };

  const cancelEdit = () => { setEditId(null); setForm(empty); };
  const toggle = async (todo) => { await db.todos.update(todo.id, { done: todo.done ? 0 : 1 }); load(); };
  const remove = async (id) => { await db.todos.delete(id); if (editId === id) cancelEdit(); load(); };

  const filtered = todos.filter(t => filter === 'all' ? true : filter === 'active' ? !t.done : t.done);
  const doneCount = todos.filter(t => t.done).length;

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Tasks</h1>
        <div style={{ display: 'flex', gap: 6 }}>
          {['active', 'done', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`chip${filter === f ? ' active' : ''}`} style={{ textTransform: 'capitalize' }}>{f}</button>
          ))}
        </div>
      </div>

      {todos.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-3)' }}>Progress</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{doneCount} / {todos.length}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${(doneCount / todos.length) * 100}%`, background: 'var(--blue)' }} />
          </div>
        </div>
      )}

      <div className="card-flat" style={{ padding: '16px 18px', marginBottom: 18, borderLeft: editId ? '3px solid var(--orange)' : undefined }}>
        {editId && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--orange)' }}>Editing task</span>
            <button onClick={cancelEdit} className="btn-icon"><X size={13} /></button>
          </div>
        )}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="What needs to be done?" className="input" style={{ fontSize: 14 }} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <DateInput value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} style={{ flex: 1 }} />
            <div style={{ display: 'flex', gap: 5 }}>
              {priorities.map(p => (
                <button type="button" key={p.label} onClick={() => setForm({ ...form, priority: p.label })}
                  className={`chip${form.priority === p.label ? ' active' : ''}`}
                  style={form.priority === p.label ? { background: p.color, borderColor: 'transparent' } : {}}>
                  {p.label}
                </button>
              ))}
            </div>
            <button type="submit" className="btn btn-primary btn-sm">{editId ? 'Update' : <><Plus size={13} style={{ pointerEvents: 'none' }} /> Add</>}</button>
          </div>
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {filtered.map(t => {
          const p = priorities.find(p => p.label === t.priority) || priorities[1];
          return (
            <div key={t.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, opacity: t.done ? 0.55 : 1, borderLeftColor: p.color, outline: editId === t.id ? '2px solid var(--orange)' : 'none' }}>
              <button onClick={() => toggle(t)} className={`check-circle${t.done ? ' checked' : ''}`} style={{ borderColor: t.done ? 'var(--green)' : p.color }}>
                {t.done && <span style={{ color: 'white', fontSize: 10, fontWeight: 800 }}>✓</span>}
              </button>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'var(--text)', textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</p>
                {t.dueDate && <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-3)' }}>Due {t.dueDate}</p>}
              </div>
              <span className="badge" style={{ background: p.bg, color: p.color, borderColor: `${p.color}30` }}>{t.priority || 'Medium'}</span>
              <button onClick={() => startEdit(t)} className="btn-icon"><Edit2 size={12} /></button>
              <button onClick={() => remove(t.id)} className="btn-icon"><Trash2 size={13} /></button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="card-flat" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13, fontStyle: 'italic' }}>
            {filter === 'active' ? 'All done — nothing pending.' : 'Nothing here.'}
          </div>
        )}
      </div>
    </div>
  );
}
