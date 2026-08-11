import { useEffect, useState } from 'react';
import { db } from '../db/db';
import { Trash2, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { DateInput } from '../components/DateTimeInputs';

const categories = ['Food', 'Transport', 'Health', 'Entertainment', 'Shopping', 'Income', 'Other'];

export default function Finance() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ type: 'expense', amount: '', category: 'Food', description: '', date: new Date().toISOString().split('T')[0] });

  const load = () => db.finance.orderBy('date').reverse().toArray().then(setRecords);
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.amount) return;
    await db.finance.add({ ...form, amount: parseFloat(form.amount) });
    setForm({ ...form, amount: '', description: '' });
    load();
  };

  const remove = async (id) => { await db.finance.delete(id); load(); };

  const total = (type) => records.filter(r => r.type === type).reduce((s, r) => s + r.amount, 0);
  const income = total('income');
  const expenses = total('expense');
  const balance = income - expenses;

  return (
    <div className="page">
      <h1 className="page-title">Finance</h1>

      {/* Balance strip — 3 ruled columns */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        background: 'var(--surface)',
        border: '1px solid var(--border-strong)',
        borderLeft: '4px solid var(--blue)',
        borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
        boxShadow: 'var(--shadow-card)',
        marginBottom: 22, overflow: 'hidden',
      }}>
        {[
          { label: 'Balance', value: balance, color: balance >= 0 ? 'var(--green)' : 'var(--red)', prefix: balance < 0 ? '-Rs. ' : 'Rs. ' },
          { label: 'Income', value: income, color: 'var(--green)', prefix: '+Rs. ' },
          { label: 'Expenses', value: expenses, color: 'var(--red)', prefix: '-Rs. ' },
        ].map((s, i) => (
          <div key={s.label} style={{ padding: '18px 22px', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
            <p style={{ margin: '0 0 5px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-3)' }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: s.color, letterSpacing: '-0.5px' }}>
              {s.prefix}{Math.abs(s.value).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Add form */}
      <div className="card-flat" style={{ padding: '16px 18px', marginBottom: 18 }}>
        <form onSubmit={add} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 'var(--radius-xs)', padding: 3, gap: 2, border: '1px solid var(--border-strong)' }}>
              {['expense', 'income'].map(t => (
                <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                  style={{
                    padding: '5px 14px', borderRadius: 5, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, transition: 'all 0.12s ease', fontFamily: 'inherit',
                    background: form.type === t ? (t === 'income' ? 'var(--green)' : 'var(--red)') : 'transparent',
                    color: form.type === t ? 'white' : 'var(--text-2)',
                    textTransform: 'capitalize',
                  }}>
                  {t}
                </button>
              ))}
            </div>
            <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="Amount" className="input" style={{ flex: 1 }} />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input" style={{ flex: 1 }}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className="input" style={{ flex: 2 }} />
            <DateInput value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={{ flex: 1 }} />
            <button type="submit" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}><Plus size={13} style={{ pointerEvents: 'none' }} /></button>
          </div>
        </form>
      </div>

      <p className="section-label">Transactions</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {records.map(r => (
          <div key={r.id} className={`card ${r.type === 'income' ? 'card-green' : 'card-red'}`} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--radius-xs)', flexShrink: 0,
              background: r.type === 'income' ? 'var(--green-soft)' : 'var(--red-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${r.type === 'income' ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'}`,
            }}>
              {r.type === 'income' ? <TrendingUp size={14} color="var(--green)" /> : <TrendingDown size={14} color="var(--red)" />}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{r.description || r.category}</p>
              <p style={{ margin: '1px 0 0', fontSize: 11, color: 'var(--text-3)' }}>{r.category} · {r.date}</p>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: r.type === 'income' ? 'var(--green)' : 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>
              {r.type === 'income' ? '+' : '-'}Rs. {r.amount.toFixed(2)}
            </span>
            <button onClick={() => remove(r.id)} className="btn-icon"><Trash2 size={13} /></button>
          </div>
        ))}
        {records.length === 0 && (
          <div className="card-flat" style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)', fontSize: 13, fontStyle: 'italic' }}>
            No transactions yet.
          </div>
        )}
      </div>
    </div>
  );
}
