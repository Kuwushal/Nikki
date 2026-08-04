import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, CheckSquare, FileText, BookOpen,
  Target, Activity, DollarSign, GraduationCap, Bookmark,
  Globe, Tv, BarChart2, Settings, Clock, Sun, Moon, Menu, X,
} from 'lucide-react';
import { useState } from 'react';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/todo', icon: CheckSquare, label: 'Tasks' },
  { to: '/notes', icon: FileText, label: 'Notes' },
  { to: '/journal', icon: BookOpen, label: 'Journal' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/habits', icon: Activity, label: 'Habits' },
  { to: '/finance', icon: DollarSign, label: 'Finance' },
  { to: '/learning', icon: GraduationCap, label: 'Learning' },
  { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { to: '/wiki', icon: Globe, label: 'Wiki' },
  { to: '/entertainment', icon: Tv, label: 'Entertainment' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/time-tools', icon: Clock, label: 'Time Tools' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

// Bottom nav shows only the most used 5 links
const bottomLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/todo', icon: CheckSquare, label: 'Tasks' },
  { to: '/journal', icon: BookOpen, label: 'Journal' },
  { to: '/finance', icon: DollarSign, label: 'Finance' },
  { to: '/settings', icon: Settings, label: 'More' },
];

export default function Sidebar({ dark, setDark }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="sidebar-desktop" style={{
        width: 210,
        minHeight: '100vh',
        background: dark ? '#111113' : '#F0F0F3',
        borderRight: '1px solid var(--border-strong)',
        display: 'flex',
        flexDirection: 'column',
        padding: '18px 10px 18px',
        gap: 1,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        flexShrink: 0,
      }}>
        <div style={{ padding: '2px 8px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative', width: 24, height: 24, flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 14, height: 14, background: 'var(--blue)', borderRadius: 3 }} />
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, background: dark ? '#3F3F46' : '#C4C4CC', borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>Nikki</span>
          </div>
          <button onClick={() => setDark(d => !d)} className="btn-icon" style={{ padding: 5 }}>
            {dark ? <Sun size={13} /> : <Moon size={13} />}
          </button>
        </div>
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-3)', padding: '0 10px', marginBottom: 6 }}>Menu</p>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Icon size={14} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="mobile-topbar" style={{
        display: 'none',
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 52,
        background: dark ? '#111113' : '#F0F0F3',
        borderBottom: '1px solid var(--border-strong)',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative', width: 20, height: 20, flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 12, height: 12, background: 'var(--blue)', borderRadius: 2 }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, background: dark ? '#3F3F46' : '#C4C4CC', borderRadius: 2 }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>Nikki</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setDark(d => !d)} className="btn-icon">{dark ? <Sun size={14} /> : <Moon size={14} />}</button>
          <button onClick={() => setMobileOpen(o => !o)} className="btn-icon">{mobileOpen ? <X size={16} /> : <Menu size={16} />}</button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="mobile-drawer" style={{
          display: 'none',
          position: 'fixed', top: 52, left: 0, right: 0, bottom: 0,
          background: dark ? '#111113' : '#F0F0F3',
          zIndex: 99, overflowY: 'auto',
          padding: '12px 10px 100px',
          flexDirection: 'column', gap: 1,
        }}>
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={14} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </div>
      )}

      {/* ── Mobile bottom nav ── */}
      <nav className="mobile-bottomnav" style={{
        display: 'none',
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        height: 60,
        background: dark ? '#111113' : '#F0F0F3',
        borderTop: '1px solid var(--border-strong)',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 8px',
      }}>
        {bottomLinks.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, padding: '6px 12px', borderRadius: 8,
              color: isActive ? 'var(--blue)' : 'var(--text-3)',
              textDecoration: 'none', fontSize: 10, fontWeight: 600,
              background: isActive ? 'var(--blue-soft)' : 'transparent',
              transition: 'all 0.12s ease',
            })}
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
