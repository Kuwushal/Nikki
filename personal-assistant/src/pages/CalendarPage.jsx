import { useEffect, useMemo, useState } from 'react';
import { db } from '../db/db';
import { Trash2, Plus, ChevronLeft, ChevronRight, X, Clock, CalendarDays } from 'lucide-react';
import { dateConfigMap } from 'nepali-date-converter';

// ─── Calendar constants ───────────────────────────────────────────────────────
const BS_MONTHS = [
  'Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Aswin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra',
];

const BS_MONTHS_NP = [
  'बैशाख', 'जेठ', 'असार', 'श्रावण', 'भाद्र', 'आश्विन',
  'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र',
];

const AD_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_NP = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि'];

const DN = ['०','१','२','३','४','५','६','७','८','९'];
const toDevanagari = (n) => String(n).replace(/\d/g, d => DN[d]);

// ─── Real Nepal BS 2083 public holidays ───────────────────────────────────────
// Dates are kept in BS so the BS calendar does not depend on an external
// holiday service. AD equivalents are generated through the existing BS table.
const BS_HOLIDAYS_2083 = [
  [0, 1, 'Nepali New Year'],
  [0, 18, 'Labour Day / Buddha Jayanti / Ubhauli Parva'],
  [2, 15, 'Republic Day'],
  [4, 12, 'Janai Purnima / Raksha Bandhan'],
  [4, 13, 'Gai Jatra (Kathmandu Valley)'],
  [4, 19, 'Krishna Janmashtami / Gaura Parva'],
  [5, 3, 'Constitution Day'],
  [5, 25, 'Ghatasthapana'],
  [5, 31, 'Dashain – Fulpati'],
  [5, 32, 'Dashain'],
  [5, 33, 'Dashain'],
  [5, 34, 'Dashain'],
  [5, 35, 'Dashain – Vijaya Dashami'],
  [5, 36, 'Dashain'],
  [5, 37, 'Dashain – Dwadashi'],
  [6, 22, 'Tihar – Laxmi Puja'],
  [6, 23, 'Tihar'],
  [6, 24, 'Tihar – Govardhan Puja / Mha Puja'],
  [6, 25, 'Tihar – Bhai Tika'],
  [6, 26, 'Tihar'],
  [6, 29, 'Chhath Parva'],
  [8, 9, 'Udhauli Parva / Yomari Punhi / Jyapu Diwas'],
  [8, 10, 'Christmas Day'],
  [8, 15, 'Tamu Lhosar'],
  [8, 27, 'Prithvi Jayanti / National Unity Day'],
  [9, 1, 'Maghe Sankranti / Maghi Parva'],
  [9, 16, "Martyrs' Day"],
  [9, 24, 'Sonam Lhosar'],
  [10, 7, 'Democracy Day'],
  [10, 22, 'Maha Shivaratri'],
  [10, 24, "International Women's Day"],
  [10, 25, 'Gyalpo Lhosar'],
  [11, 7, 'Fagu Purnima / Holi (Hilly districts)'],
  [11, 8, 'Fagu Purnima / Holi (Terai districts)'],
];

// ─── BS helpers ───────────────────────────────────────────────────────────────
function adToBS(adDate) {
  const refAD = new Date(1943, 3, 14);
  const diffDays = Math.floor((adDate - refAD) / 86400000);

  let bsYear = 2000;
  let bsMonth = 0;
  let bsDay = 1;
  let remaining = diffDays;

  outer:
  for (let y = 2000; y <= 2090; y++) {
    const months = Object.values(dateConfigMap[y] || {});
    for (let m = 0; m < 12; m++) {
      const days = months[m];
      if (remaining < days) {
        bsYear = y;
        bsMonth = m;
        bsDay = 1 + remaining;
        break outer;
      }
      remaining -= days;
    }
  }

  return { year: bsYear, month: bsMonth, day: bsDay };
}

function bsToAD(bsYear, bsMonth, bsDay) {
  const refAD = new Date(1943, 3, 14);
  let totalDays = 0;

  for (let y = 2000; y < bsYear; y++) {
    totalDays += Object.values(dateConfigMap[y] || {}).reduce((a, b) => a + b, 0);
  }

  const months = Object.values(dateConfigMap[bsYear] || {});
  for (let m = 0; m < bsMonth; m++) totalDays += months[m];
  totalDays += bsDay - 1;

  return new Date(refAD.getTime() + totalDays * 86400000);
}

function bsDaysInMonth(y, m) {
  return Object.values(dateConfigMap[y] || {})[m] || 30;
}

function bsToIso(y, m, d) {
  const ad = bsToAD(y, m, d);
  return `${ad.getFullYear()}-${String(ad.getMonth()+1).padStart(2,'0')}-${String(ad.getDate()).padStart(2,'0')}`;
}

// ─── AD helpers ───────────────────────────────────────────────────────────────
function adDaysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}

function adFirstWeekday(y, m) {
  return new Date(y, m, 1).getDay();
}

function adToIso(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// ─── BS holiday map ──────────────────────────────────────────────────────────
function buildBsHolidayMap(year) {
  if (year !== 2083) return {};
  return BS_HOLIDAYS_2083.reduce((map, [month, day, name]) => {
    const iso = bsToIso(year, month, day);
    (map[iso] ||= []).push({
      name,
      source: 'Nepal BS 2083',
    });
    return map;
  }, {});
}

// ─── Wikimedia / Wikipedia AD holidays ────────────────────────────────────────
// Wikimedia's MediaWiki API exposes the live "Holidays" section of the
// "YYYY in Nepal" article. The app parses that section instead of maintaining
// a second hardcoded AD holiday list.
async function fetchWikimediaAdHolidays(year, signal) {
  const safeYear = Math.trunc(year);
  if (!Number.isFinite(safeYear) || safeYear < 1900 || safeYear > 2200) return {};

  const params = new URLSearchParams({
    action: 'parse',
    prop: 'wikitext',
    page: `${safeYear}_in_Nepal`,
    format: 'json',
    formatversion: '2',
    origin: '*',
  });

  const response = await fetch(
    `https://en.wikipedia.org/w/api.php?${params.toString()}`,
    {
      signal,
      headers: {
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Wikimedia request failed: ${response.status}`);
  }

  const data = await response.json();
  const wikitext = data?.parse?.wikitext;

  if (!wikitext) throw new Error('Wikimedia returned no wikitext');

  const holidaysStart = wikitext.indexOf('==Holidays==');
  if (holidaysStart === -1) return {};

  const afterStart = wikitext.slice(holidaysStart + '==Holidays=='.length);
  const holidaysEnd = afterStart.search(/\n==[^=].*==\s*$/m);
  const section = holidaysEnd === -1 ? afterStart : afterStart.slice(0, holidaysEnd);

  const monthMap = Object.fromEntries(
    AD_MONTHS.map((month, index) => [month.toLowerCase(), index]),
  );

  const holidayMap = {};
  let currentDate = null;

  const cleanWikiText = (value) =>
    value
      .replace(/<ref[\s\S]*?<\/ref>/gi, '')
      .replace(/<ref[^>]*\/>/gi, '')
      .replace(/\{\{[^{}]*\}\}/g, '')
      .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$2')
      .replace(/\[\[([^\]]+)\]\]/g, '$1')
      .replace(/'''?/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();

  for (const rawLine of section.split('\n')) {
    const line = rawLine.trim();

    // A holiday entry begins with "* DD Month –".
    // Wikimedia's pages occasionally contain a date before the nested
    // holiday names, e.g. "1 May –" followed by two "*"-indented names.
    const dateMatch = line.match(
      /^\*\s*(\d{1,2})\s+([A-Za-z]+)\s*[–-]\s*(.*)$/,
    );

    if (dateMatch) {
      const day = Number(dateMatch[1]);
      const monthIndex = monthMap[dateMatch[2].toLowerCase()];

      if (monthIndex === undefined) {
        currentDate = null;
        continue;
      }

      currentDate = adToIso(year, monthIndex, day);

      const remainder = cleanWikiText(dateMatch[3]);
      if (remainder) {
        const name = remainder.replace(/^\s*[\t ]*$/, '').trim();
        if (name) {
          (holidayMap[currentDate] ||= []).push({
            name,
            source: 'Wikimedia',
          });
        }
      }

      continue;
    }

    // Nested Wikimedia holiday names belong to the most recent date.
    const nestedMatch = line.match(/^\*\*\s*(.+)$/);
    if (nestedMatch && currentDate) {
      const name = cleanWikiText(nestedMatch[1]);
      if (name) {
        (holidayMap[currentDate] ||= []).push({
          name,
          source: 'Wikimedia',
        });
      }
    }
  }

  return holidayMap;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CalendarPage() {
  const [mode, setMode] = useState('BS');
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', time: '', description: '' });

  const [adHolidays, setAdHolidays] = useState({});
  const [holidayStatus, setHolidayStatus] = useState('idle');

  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const todayBS = adToBS(now);

  const [bsView, setBsView] = useState({
    year: todayBS.year,
    month: todayBS.month,
  });

  const [adView, setAdView] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });

  const load = () => db.events.orderBy('date').toArray().then(setEvents);

  useEffect(() => {
    load();
  }, []);

  // Fetch the AD holidays for whichever Gregorian year is being viewed.
  useEffect(() => {
    const controller = new AbortController();

    setHolidayStatus('loading');

    fetchWikimediaAdHolidays(adView.year, controller.signal)
      .then((holidayMap) => {
        setAdHolidays(holidayMap);
        setHolidayStatus('loaded');
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        console.error('Unable to load Wikimedia holidays:', error);
        setAdHolidays({});
        setHolidayStatus('error');
      });

    return () => controller.abort();
  }, [adView.year]);

  const eventMap = useMemo(() => {
    const m = {};
    events.forEach((e) => {
      (m[e.date] ||= []).push(e);
    });
    return m;
  }, [events]);

  const bsHolidayMap = useMemo(
    () => buildBsHolidayMap(bsView.year),
    [bsView.year],
  );

  const holidayMap = mode === 'BS' ? bsHolidayMap : adHolidays;
  const selectedEvents = selectedDate ? (eventMap[selectedDate] || []) : [];
  const selectedHolidays = selectedDate ? (holidayMap[selectedDate] || []) : [];

  const addEvent = async (e) => {
    e.preventDefault();
    if (!form.title || !selectedDate) return;

    await db.events.add({
      title: form.title,
      date: selectedDate,
      time: form.time,
      description: form.description,
    });

    setForm({ title: '', time: '', description: '' });
    load();
  };

  const removeEvent = async (id) => {
    await db.events.delete(id);
    load();
  };

  const openDay = (iso) => {
    setSelectedDate(iso);
    setShowModal(true);
  };

  const upcoming = events
    .filter((e) => e.date >= todayIso)
    .slice(0, 8);

  return (
    <div className="page">
      <h1 className="page-title">Calendar</h1>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: 'var(--surface-2)', padding: 4, borderRadius: 'var(--radius-sm)', width: 'fit-content', border: '1px solid var(--border)' }}>
        {['BS', 'AD'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: '6px 22px',
              borderRadius: 'calc(var(--radius-sm) - 2px)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: 600,
              transition: 'all 0.15s ease',
              background: mode === m ? 'var(--blue)' : 'transparent',
              color: mode === m ? 'white' : 'var(--text-3)',
              boxShadow: mode === m ? '0 1px 4px rgba(37,99,235,0.3)' : 'none',
            }}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="card-flat" style={{ padding: '20px 20px 16px', marginBottom: 20 }}>
        {mode === 'BS' ? (
          <BSGrid
            bsView={bsView} setBsView={setBsView}
            todayIso={todayIso} eventMap={eventMap}
            bsHolidayMap={bsHolidayMap} openDay={openDay}
          />
        ) : (
          <ADGrid
            adView={adView} setAdView={setAdView}
            todayIso={todayIso} eventMap={eventMap}
            adHolidays={adHolidays} holidayStatus={holidayStatus} openDay={openDay}
          />
        )}
      </div>

      {upcoming.length > 0 && (
        <>
          <p className="section-label" style={{ marginBottom: 10 }}>
            Upcoming Events
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {upcoming.map((e) => {
              const diff = Math.ceil(
                (new Date(e.date) - new Date(todayIso)) / 86400000,
              );

              const color =
                diff === 0
                  ? 'var(--blue)'
                  : diff <= 3
                    ? 'var(--orange)'
                    : 'var(--green)';

              const cls =
                diff === 0
                  ? 'card card-blue'
                  : diff <= 3
                    ? 'card card-orange'
                    : 'card card-green';

              return (
                <div
                  key={e.id}
                  className={cls}
                  style={{
                    padding: '11px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div style={{ width: 3, height: 32, borderRadius: 2, background: color, flexShrink: 0 }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {e.title}
                    </p>

                    {e.description && (
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {e.description}
                      </p>
                    )}
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color }}>
                      {diff === 0 ? 'Today' : `+${diff}d`}
                    </p>
                    {e.time && (
                      <p style={{ margin: '1px 0 0', fontSize: 11, color: 'var(--text-3)' }}>
                        {e.time}
                      </p>
                    )}
                  </div>

                  <button onClick={() => removeEvent(e.id)} className="btn-icon">
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {events.length === 0 && (
        <div className="card-flat" style={{ padding: 28, textAlign: 'center', color: 'var(--text-3)', fontSize: 13, fontStyle: 'italic' }}>
          Tap any date to add events.
        </div>
      )}

      {showModal && (
        <DayModal
          date={selectedDate}
          events={selectedEvents}
          holidays={selectedHolidays}
          form={form}
          setForm={setForm}
          onAdd={addEvent}
          onRemove={removeEvent}
          onClose={() => setShowModal(false)}
          todayIso={todayIso}
        />
      )}
    </div>
  );
}

// ─── BS Calendar grid ────────────────────────────────────────────────────────
function BSGrid({ bsView, setBsView, todayIso, eventMap, bsHolidayMap, openDay }) {
  const { year, month } = bsView;
  const daysInMonth = bsDaysInMonth(year, month);
  const firstAD = bsToAD(year, month, 1);
  const startWeekday = firstAD.getDay();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const prevMonth = () => setBsView((v) => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 });
  const nextMonth = () => setBsView((v) => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 });
  const midAD = bsToAD(year, month, Math.ceil(daysInMonth / 2));
  const adLabel = `${AD_MONTHS[midAD.getMonth()]} ${midAD.getFullYear()}`;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={prevMonth} className="btn-icon" style={{ padding: 8 }}><ChevronLeft size={16} /></button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>{BS_MONTHS_NP[month]} {toDevanagari(year)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{BS_MONTHS[month]} · {adLabel}</div>
        </div>
        <button onClick={nextMonth} className="btn-icon" style={{ padding: 8 }}><ChevronRight size={16} /></button>
      </div>
      <CalGrid cells={cells} getIso={(d) => bsToIso(year, month, d)} todayIso={todayIso} eventMap={eventMap} holidayMap={bsHolidayMap} onDayClick={openDay} devanagari />
    </div>
  );
}

// ─── AD Calendar grid ────────────────────────────────────────────────────────
function ADGrid({ adView, setAdView, todayIso, eventMap, adHolidays, holidayStatus, openDay }) {
  const { year, month } = adView;
  const daysInMonth = adDaysInMonth(year, month);
  const startWeekday = adFirstWeekday(year, month);
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const prevMonth = () => setAdView((v) => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 });
  const nextMonth = () => setAdView((v) => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 });
  const midBS = adToBS(new Date(year, month, 15));
  const bsLabel = `${BS_MONTHS_NP[midBS.month]} ${midBS.year}`;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={prevMonth} className="btn-icon" style={{ padding: 8 }}><ChevronLeft size={16} /></button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>{AD_MONTHS[month]} {year}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{bsLabel}</div>
        </div>
        <button onClick={nextMonth} className="btn-icon" style={{ padding: 8 }}><ChevronRight size={16} /></button>
      </div>
      <CalGrid cells={cells} getIso={(d) => adToIso(year, month, d)} todayIso={todayIso} eventMap={eventMap} holidayMap={adHolidays} onDayClick={openDay} />
      <div style={{ marginTop: 10, fontSize: 10, color: 'var(--text-3)', textAlign: 'center' }}>
        {holidayStatus === 'loading' && 'Loading holidays…'}
        {holidayStatus === 'loaded' && 'Holidays from Wikimedia'}
        {holidayStatus === 'error' && 'Could not load holidays'}
      </div>
    </div>
  );
}

// ─── Shared calendar grid ─────────────────────────────────────────────────────
function CalGrid({
  cells,
  getIso,
  todayIso,
  eventMap,
  holidayMap,
  onDayClick,
  devanagari = false,
}) {
  const dayLabels = devanagari ? DAYS_NP : DAYS;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {dayLabels.map((d) => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--text-3)',
              padding: '4px 0',
              letterSpacing: '0.3px',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;

          const iso = getIso(day);
          const isToday = iso === todayIso;
          const hasEvents = !!eventMap[iso]?.length;
          const eventCount = eventMap[iso]?.length || 0;
          const holidays = holidayMap[iso] || [];
          const hasHoliday = holidays.length > 0;
          const isPast = iso < todayIso;

          return (
            <button
              key={iso}
              onClick={() => onDayClick(iso)}
              title={holidays.map((h) => h.name).join(', ')}
              style={{
                aspectRatio: '1',
                border: isToday
                  ? '2px solid var(--blue)'
                  : hasHoliday
                    ? '1px solid var(--orange)'
                    : '1px solid var(--border)',
                borderRadius: 'var(--radius-xs)',
                background: isToday
                  ? 'var(--blue-soft)'
                  : hasHoliday
                    ? 'var(--orange-soft, var(--surface-2))'
                    : hasEvents
                      ? 'var(--surface-2)'
                      : 'var(--surface)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                transition: 'all 0.12s ease',
                opacity: isPast ? 0.45 : 1,
                position: 'relative',
                fontFamily: 'inherit',
                minWidth: 0,
              }}
              onMouseEnter={(e) => {
                if (!isToday) e.currentTarget.style.background = 'var(--surface-2)';
                e.currentTarget.style.transform = 'scale(1.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isToday
                  ? 'var(--blue-soft)'
                  : hasHoliday
                    ? 'var(--orange-soft, var(--surface-2))'
                    : hasEvents
                      ? 'var(--surface-2)'
                      : 'var(--surface)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: isToday ? 700 : 500,
                  color: isToday ? 'var(--blue)' : 'var(--text)',
                  lineHeight: 1,
                }}
              >
                {devanagari ? toDevanagari(day) : day}
              </span>

              {(hasHoliday || hasEvents) && (
                <div style={{ display: 'flex', gap: 2, alignItems: 'center', maxWidth: '90%' }}>
                  {hasHoliday && (
                    <div
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: 'var(--orange)',
                        flexShrink: 0,
                      }}
                    />
                  )}

                  {hasEvents &&
                    Array.from({ length: Math.min(eventCount, 3) }).map((_, di) => (
                      <div
                        key={di}
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          background: 'var(--blue)',
                          opacity: 0.8,
                        }}
                      />
                    ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Day event / holiday modal ────────────────────────────────────────────────
function DayModal({
  date,
  events,
  holidays,
  form,
  setForm,
  onAdd,
  onRemove,
  onClose,
  todayIso,
}) {
  const adDate = new Date(`${date}T00:00:00`);
  const bs = adToBS(adDate);

  const adLabel = `${AD_MONTHS[adDate.getMonth()]} ${adDate.getDate()}, ${adDate.getFullYear()}`;
  const bsLabel = `${BS_MONTHS_NP[bs.month]} ${toDevanagari(bs.day)}, ${toDevanagari(bs.year)}`;

  const isToday = date === todayIso;
  const isPast = date < todayIso;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius) var(--radius) 0 0',
          width: '100%',
          maxWidth: 520,
          padding: '20px 20px 32px',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
          border: '1px solid var(--border)',
          animation: 'slideUp 0.22s cubic-bezier(0.16,1,0.3,1)',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                {bsLabel}
              </span>

              {isToday && (
                <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--blue)', color: 'white', padding: '2px 7px', borderRadius: 20 }}>
                  TODAY
                </span>
              )}
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>
              {adLabel}
            </div>
          </div>

          <button onClick={onClose} className="btn-icon">
            <X size={16} />
          </button>
        </div>

        {holidays.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                color: 'var(--orange)',
                margin: '0 0 7px',
              }}
            >
              <CalendarDays size={12} />
              Holidays
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {holidays.map((holiday, index) => (
                <div
                  key={`${holiday.name}-${index}`}
                  className="card card-orange"
                  style={{ padding: '10px 14px' }}
                >
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                    {holiday.name}
                  </p>

                  <p style={{ margin: '2px 0 0', fontSize: 10, color: 'var(--text-3)' }}>
                    {holiday.source}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {events.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
            {events.map((e) => (
              <div
                key={e.id}
                className="card card-blue"
                style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                    {e.title}
                  </p>

                  {e.description && (
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-3)' }}>
                      {e.description}
                    </p>
                  )}

                  {e.time && (
                    <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={10} /> {e.time}
                    </p>
                  )}
                </div>

                <button onClick={() => onRemove(e.id)} className="btn-icon">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {events.length === 0 && holidays.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic', marginBottom: 14 }}>
            No holidays or events on this day.
          </p>
        )}

        {!isPast && (
          <form
            onSubmit={onAdd}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              borderTop: '1px solid var(--border)',
              paddingTop: 14,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                color: 'var(--text-3)',
                margin: 0,
              }}
            >
              Add Event
            </p>

            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Event title"
              className="input"
              style={{ fontSize: 13 }}
            />

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="input"
                style={{ fontSize: 13, flex: '0 0 130px' }}
              />

              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description (optional)"
                className="input"
                style={{ fontSize: 13 }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ alignSelf: 'flex-end' }}
            >
              <Plus size={13} /> Add Event
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
