import { useEffect, useState } from 'react';
import { db } from '../db/db';
import { Trash2, Plus } from 'lucide-react';
import { DateInput, TimeInput } from '../components/DateTimeInputs';

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: '', date: '', time: '', description: '' });

  const load = () => db.events.orderBy('date').toArray().then(setEvents);
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    await db.events.add({ ...form });
    setForm({ title: '', date: '', time: '', description: '' });
    load();
  };

  const remove = async (id) => { await db.events.delete(id); load(); };

  const today = new Date().toISOString().split('T')[0];
  const upcoming = events.filter(e => e.date >= today);
  const past = events.filter(e => e.date < today);

  const urgencyColor = (date) => {
    const diff = Math.ceil((new Date(date) - new Date(today)) / 86400000);
    if (diff === 0) return 'var(--blue)';
    if (diff <= 3) return 'var(--orange)';
    return 'var(--green)';
  };
  const urgencyClass = (date) => {
    const diff = Math.ceil((new Date(date) - new Date(today)) / 86400000);
    if (diff === 0) return 'card-blue';
    if (diff <= 3) return 'card-orange';
    return 'card-green';
  };

  return (
    <div className="page">
      <h1 className="page-title">Calendar</h1>
      <div className="card-flat" style={{ padding: '18px 20px', marginBottom: 22 }}>
        <form onSubmit={add} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Event title" className="input" style={{ fontSize: 14 }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <DateInput value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <TimeInput value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)" className="input" style={{ flex: 1 }} />
            <button type="submit" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}><Plus size={13} style={{ pointerEvents: 'none' }} /> Add</button>
          </div>
        </form>
      </div>

      {upcoming.length > 0 && (
        <>
          <p className="section-label">Upcoming</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {upcoming.map(e => (
              <div key={e.id} className={`card ${urgencyClass(e.date)}`} style={{ padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 3, height: 36, borderRadius: 2, background: urgencyColor(e.date), flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{e.title}</p>
                  {e.description && <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-3)' }}>{e.description}</p>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: urgencyColor(e.date), fontVariantNumeric: 'tabular-nums' }}>{e.date}</p>
                  {e.time && <p style={{ margin: '1px 0 0', fontSize: 11, color: 'var(--text-3)' }}>{e.time}</p>}
                </div>
                <button onClick={() => remove(e.id)} className="btn-icon"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <p className="section-label">Past</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {past.map(e => (
              <div key={e.id} className="card" style={{ padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 14, opacity: 0.45 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{e.title}</p>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{e.date}</span>
                <button onClick={() => remove(e.id)} className="btn-icon"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </>
      )}

      {events.length === 0 && (
        <div className="card-flat" style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)', fontSize: 13, fontStyle: 'italic' }}>No events yet.</div>
      )}
    </div>
  );
}
