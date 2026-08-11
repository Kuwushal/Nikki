import { useEffect, useState } from 'react';
import { db } from '../db/db';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { dateConfigMap } from 'nepali-date-converter';

const BS_MONTHS_NP = ['बैशाख','जेठ','असार','श्रावण','भाद्र','आश्विन','कार्तिक','मंसिर','पौष','माघ','फाल्गुन','चैत्र'];
const DN = ['०','१','२','३','४','५','६','७','८','९'];
const toDevanagari = (n) => String(n).replace(/\d/g, d => DN[d]);

function adToBS(adDate) {
  const refAD = new Date(1943, 3, 14);
  const diffDays = Math.floor((adDate - refAD) / 86400000);
  let remaining = diffDays;
  for (let y = 2000; y <= 2090; y++) {
    const months = Object.values(dateConfigMap[y] || {});
    for (let m = 0; m < 12; m++) {
      if (remaining < months[m]) return { year: y, month: m, day: 1 + remaining };
      remaining -= months[m];
    }
  }
  return { year: 2090, month: 0, day: 1 };
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const [todos, setTodos] = useState([]);
  const [events, setEvents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [habits, setHabits] = useState([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    db.todos.where('done').equals(0).limit(5).toArray().then(setTodos);
    db.events.where('date').aboveOrEqual(today).limit(4).toArray().then(setEvents);
    db.notes.orderBy('updatedAt').reverse().limit(3).toArray().then(setNotes);
    db.habits.toArray().then(setHabits);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const doneHabits = habits.filter(h => (h.completedDates || []).includes(todayStr)).length;
  const habitPct = habits.length ? Math.round((doneHabits / habits.length) * 100) : 0;

  return (
    <div className="page" style={{ maxWidth: 960 }}>

      {/* Hero — split layout, no rounded corners on left edge */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto',
        background: 'var(--surface)',
        border: '1px solid var(--border-strong)',
        borderLeft: '4px solid var(--blue)',
        borderRadius: '0 var(--radius) var(--radius) 0',
        boxShadow: 'var(--shadow-card)',
        marginBottom: 28, overflow: 'hidden',
      }}>
        <div style={{ padding: '28px 32px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-3)', margin: '0 0 2px' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          {(() => { const bs = adToBS(new Date()); return (
            <p style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600, margin: '0 0 6px', letterSpacing: '0.2px' }}>
              {BS_MONTHS_NP[bs.month]} {toDevanagari(bs.day)}, {toDevanagari(bs.year)} BS
            </p>
          ); })()}
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)', margin: '0 0 4px' }}>{greeting()}</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
            {todos.length} task{todos.length !== 1 ? 's' : ''} pending · {habits.length} habits tracked
          </p>
        </div>
        {/* Time block — dark inset panel */}
        <div style={{
          padding: '28px 36px',
          background: 'var(--surface-2)',
          borderLeft: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 38, fontWeight: 200, letterSpacing: '-2px', color: 'var(--text)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, fontWeight: 500 }}>
            {time.toLocaleTimeString('en-US', { second: '2-digit' }).split(':')[2]} sec
          </span>
        </div>
      </div>

      {/* Stat strip — 3 inline counters, no cards, just ruled columns */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        background: 'var(--surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-card)',
        marginBottom: 24, overflow: 'hidden',
      }}>
        {[
          { label: 'Pending Tasks', value: todos.length, color: 'var(--blue)' },
          { label: 'Upcoming Events', value: events.length, color: 'var(--purple)' },
          { label: 'Habit Progress', value: `${habitPct}%`, color: 'var(--green)' },
        ].map((s, i) => (
          <div key={s.label} style={{
            padding: '18px 22px',
            borderRight: i < 2 ? '1px solid var(--border)' : 'none',
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-3)', margin: '0 0 6px' }}>{s.label}</p>
            <p style={{ fontSize: 30, fontWeight: 700, color: s.color, margin: 0, letterSpacing: '-0.5px' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main 2×2 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <DashCard title="Today's Tasks" link="/todo" accent="var(--blue)" accentClass="card-blue">
          {todos.length === 0 ? <Empty text="All clear." /> : todos.map((t, i) => (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 0',
              borderBottom: i < todos.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ width: 5, height: 5, borderRadius: 1, background: 'var(--blue)', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--text)', flex: 1 }}>{t.title}</span>
              {t.dueDate && <span style={{ fontSize: 11, color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>{t.dueDate}</span>}
            </div>
          ))}
        </DashCard>

        <DashCard title="Upcoming Events" link="/calendar" accent="var(--purple)" accentClass="card-purple">
          {events.length === 0 ? <Empty text="Nothing scheduled." /> : events.map((e, i) => (
            <div key={e.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 0',
              borderBottom: i < events.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ width: 5, height: 5, borderRadius: 1, background: 'var(--purple)', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--text)', flex: 1 }}>{e.title}</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{e.date}</span>
            </div>
          ))}
        </DashCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <DashCard title="Recent Notes" link="/notes" accent="var(--orange)" accentClass="card-orange">
          {notes.length === 0 ? <Empty text="No notes yet." /> : notes.map((n, i) => (
            <div key={n.id} style={{ padding: '7px 0', borderBottom: i < notes.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{n.title}</p>
              {n.content && <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.content}</p>}
            </div>
          ))}
        </DashCard>

        <DashCard title="Habit Progress" link="/habits" accent="var(--green)" accentClass="card-green">
          {habits.length === 0 ? <Empty text="No habits tracked." /> : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{doneHabits} / {habits.length} today</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--green)', letterSpacing: '-0.5px' }}>{habitPct}%</span>
              </div>
              <div className="progress-track" style={{ marginBottom: 12 }}>
                <div className="progress-fill" style={{ width: `${habitPct}%`, background: 'var(--green)' }} />
              </div>
              {habits.slice(0, 4).map(h => {
                const done = (h.completedDates || []).includes(todayStr);
                return (
                  <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                    <div style={{ width: 5, height: 5, borderRadius: 1, background: done ? 'var(--green)' : 'var(--surface-3)', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: done ? 'var(--text)' : 'var(--text-3)' }}>{h.title}</span>
                  </div>
                );
              })}
            </>
          )}
        </DashCard>
      </div>
    </div>
  );
}

function DashCard({ title, link, accentClass, children }) {
  return (
    <div className={`card ${accentClass}`} style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-2)' }}>{title}</span>
        <Link to={link} style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11, color: 'var(--text-3)', textDecoration: 'none', fontWeight: 600 }}>
          All <ArrowUpRight size={11} />
        </Link>
      </div>
      {children}
    </div>
  );
}

function Empty({ text }) {
  return <p style={{ fontSize: 12, color: 'var(--text-3)', padding: '6px 0', fontStyle: 'italic' }}>{text}</p>;
}
