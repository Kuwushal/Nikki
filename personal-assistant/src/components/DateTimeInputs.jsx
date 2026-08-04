import { Calendar, Clock } from 'lucide-react';

const baseStyle = {
  background: 'var(--surface-2)',
  border: '1px solid var(--border-strong)',
  borderRadius: 'var(--radius-sm)',
  padding: '9px 13px',
  fontSize: 13,
  color: 'var(--text)',
  fontFamily: 'inherit',
  outline: 'none',
  cursor: 'pointer',
  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
  colorScheme: 'dark light',
  width: '100%',
};

export function DateInput({ value, onChange, style = {} }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', ...style }}>
      <Calendar size={13} style={{
        position: 'absolute', left: 13, color: 'var(--text-3)',
        pointerEvents: 'none', zIndex: 1, flexShrink: 0,
      }} />
      <input
        type="date"
        value={value}
        onChange={onChange}
        style={{ ...baseStyle, paddingLeft: 34 }}
      />
    </div>
  );
}

export function TimeInput({ value, onChange, style = {} }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', ...style }}>
      <Clock size={13} style={{
        position: 'absolute', left: 13, color: 'var(--text-3)',
        pointerEvents: 'none', zIndex: 1, flexShrink: 0,
      }} />
      <input
        type="time"
        value={value}
        onChange={onChange}
        style={{ ...baseStyle, paddingLeft: 34 }}
      />
    </div>
  );
}
