import { useEffect, useState } from 'react';
import { db } from '../db/db';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';

const COLORS = ['#007AFF', '#AF52DE', '#34C759', '#FF9500', '#FF3B30', '#32ADE6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 14px', boxShadow: 'var(--shadow-md)', fontSize: 13 }}>
      {label && <p style={{ margin: '0 0 4px', color: 'var(--text-2)', fontWeight: 500 }}>{label}</p>}
      {payload.map((p, i) => <p key={i} style={{ margin: 0, color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function Analytics() {
  const [financeData, setFinanceData] = useState([]);
  const [habitData, setHabitData] = useState([]);
  const [goalData, setGoalData] = useState([]);
  const [financeTimeline, setFinanceTimeline] = useState([]);

  useEffect(() => {
    db.finance.toArray().then(records => {
      const byCategory = {};
      records.filter(r => r.type === 'expense').forEach(r => {
        byCategory[r.category] = (byCategory[r.category] || 0) + r.amount;
      });
      setFinanceData(Object.entries(byCategory).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) })));

      const byDate = {};
      records.forEach(r => {
        if (!byDate[r.date]) byDate[r.date] = { date: r.date, income: 0, expense: 0 };
        byDate[r.date][r.type] += r.amount;
      });
      setFinanceTimeline(Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)).slice(-14));
    });

    db.habits.toArray().then(habits => {
      setHabitData(habits.map(h => ({
        name: h.title.length > 10 ? h.title.slice(0, 10) + '…' : h.title,
        streak: (() => {
          let count = 0;
          const d = new Date();
          while ((h.completedDates || []).includes(d.toISOString().split('T')[0])) { count++; d.setDate(d.getDate() - 1); }
          return count;
        })(),
      })));
    });

    db.goals.toArray().then(goals => {
      setGoalData(goals.map(g => ({ name: g.title.length > 12 ? g.title.slice(0, 12) + '…' : g.title, progress: g.progress })));
    });
  }, []);

  return (
    <div className="page" style={{ maxWidth: 960 }}>
      <h1 className="page-title">Analytics</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <ChartCard title="Expenses by Category">
          {financeData.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={financeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={35}>
                  {financeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Habit Streaks">
          {habitData.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={habitData} barSize={20}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="streak" fill="#007AFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <ChartCard title="Goal Progress">
          {goalData.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={goalData} barSize={20}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="progress" fill="#34C759" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Income vs Expenses (14 days)">
          {financeTimeline.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={financeTimeline}>
                <defs>
                  <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34C759" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34C759" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF3B30" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" stroke="#34C759" fill="url(#income)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" stroke="#FF3B30" fill="url(#expense)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{title}</p>
      {children}
    </div>
  );
}

function Empty() {
  return <p style={{ fontSize: 13, color: 'var(--text-3)', padding: '40px 0', textAlign: 'center' }}>No data yet.</p>;
}
