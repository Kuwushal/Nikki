import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PasswordGate from './components/PasswordGate';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import Todo from './pages/Todo';
import Notes from './pages/Notes';
import Journal from './pages/Journal';
import Goals from './pages/Goals';
import Habits from './pages/Habits';
import Finance from './pages/Finance';
import Learning from './pages/Learning';
import Bookmarks from './pages/Bookmarks';
import Wiki from './pages/Wiki';
import Entertainment from './pages/Entertainment';
import Analytics from './pages/Analytics';
import TimeTools from './pages/TimeTools';
import Settings from './pages/Settings';

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;

  return (
    <BrowserRouter>
      <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
        <Sidebar dark={dark} setDark={setDark} />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/todo" element={<Todo />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/learning" element={<Learning />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/wiki" element={<Wiki />} />
            <Route path="/entertainment" element={<Entertainment />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/time-tools" element={<TimeTools />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
