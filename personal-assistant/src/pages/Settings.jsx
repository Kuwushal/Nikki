import { useState } from 'react';
import { db } from '../db/db';
import { Download, Upload, Trash2 } from 'lucide-react';

export default function Settings() {
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');

  const notify = (text, type = 'success') => { setMsg(text); setMsgType(type); setTimeout(() => setMsg(''), 3000); };

  const clearAll = async () => {
    if (!confirm('Permanently delete ALL data?')) return;
    await Promise.all([
      db.todos.clear(), db.events.clear(), db.notes.clear(), db.journal.clear(),
      db.goals.clear(), db.habits.clear(), db.finance.clear(), db.bookmarks.clear(),
      db.wiki.clear(), db.learning.clear(), db.entertainment.clear(),
    ]);
    notify('All data cleared.');
  };

  const exportData = async () => {
    const data = {
      todos: await db.todos.toArray(), events: await db.events.toArray(),
      notes: await db.notes.toArray(), journal: await db.journal.toArray(),
      goals: await db.goals.toArray(), habits: await db.habits.toArray(),
      finance: await db.finance.toArray(), bookmarks: await db.bookmarks.toArray(),
      wiki: await db.wiki.toArray(), learning: await db.learning.toArray(),
      entertainment: await db.entertainment.toArray(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `assistant-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    notify('Exported successfully.');
  };

  const importData = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      for (const [table, rows] of Object.entries(data)) {
        if (db[table]) for (const row of rows) { const { id, ...rest } = row; await db[table].add(rest); }
      }
      notify('Imported successfully.');
    } catch { notify('Import failed.', 'error'); }
  };

  const rows = [
    { icon: <Download size={14} />, label: 'Export Data', desc: 'Download JSON backup', color: 'var(--blue)', action: <button onClick={exportData} className="btn btn-primary btn-xs">Export</button> },
    { icon: <Upload size={14} />, label: 'Import Data', desc: 'Restore from JSON', color: 'var(--green)', action: <label className="btn btn-xs" style={{ background: 'var(--green-soft)', color: 'var(--green)', border: '1px solid rgba(22,163,74,0.2)', cursor: 'pointer' }}>Import<input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} /></label> },
    { icon: <Trash2 size={14} />, label: 'Clear All Data', desc: 'Permanently delete everything', color: 'var(--red)', action: <button onClick={clearAll} className="btn btn-danger btn-xs">Clear</button> },
  ];

  return (
    <div className="page" style={{ maxWidth: 520 }}>
      <h1 className="page-title">Settings</h1>

      {msg && (
        <div style={{
          padding: '10px 16px', borderRadius: 'var(--radius-xs)', marginBottom: 18,
          fontSize: 13, fontWeight: 600,
          background: msgType === 'success' ? 'var(--green-soft)' : 'var(--red-soft)',
          color: msgType === 'success' ? 'var(--green)' : 'var(--red)',
          border: `1px solid ${msgType === 'success' ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'}`,
          animation: 'fadeIn 0.2s ease',
        }}>{msg}</div>
      )}

      <p className="section-label" style={{ marginBottom: 10 }}>Data Management</p>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-card)', overflow: 'hidden', marginBottom: 20 }}>
        {rows.map((r, i) => (
          <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ width: 30, height: 30, borderRadius: 'var(--radius-xs)', background: `${r.color}15`, border: `1px solid ${r.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: r.color, flexShrink: 0 }}>
              {r.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{r.label}</p>
              <p style={{ margin: '1px 0 0', fontSize: 11, color: 'var(--text-3)' }}>{r.desc}</p>
            </div>
            {r.action}
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ position: 'relative', width: 28, height: 28, flexShrink: 0, marginTop: 2 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 16, height: 16, background: 'var(--blue)', borderRadius: 3 }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, background: 'var(--surface-3)', borderRadius: 3 }} />
          </div>
          <div>
            <p style={{ margin: '0 0 3px', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Personal Assistant</p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
              IndexedDB · Offline-first · No account · No data leaves your device
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
