'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const LABEL_COLORS: Record<string, { bg: string; text: string }> = {
  default: { bg: '#eff6ff', text: '#0036ad' },
  high:    { bg: '#fef2f2', text: '#dc2626' },
  medium:  { bg: '#fffbeb', text: '#d97706' },
  low:     { bg: '#f0fdf4', text: '#16a34a' },
};

function getEventColor(labels: string[]) {
  if (!labels?.length) return LABEL_COLORS.default;
  const l = labels[0].toLowerCase();
  if (l.includes('high') || l.includes('urgent') || l.includes('critical')) return LABEL_COLORS.high;
  if (l.includes('medium') || l.includes('mid')) return LABEL_COLORS.medium;
  if (l.includes('low')) return LABEL_COLORS.low;
  return LABEL_COLORS.default;
}

interface CalEvent {
  id: string; title: string; date: Date;
  labels: string[]; boardTitle: string; listTitle: string; isComplete: boolean;
}

interface DayPopover { events: CalEvent[]; dateStr: string; x: number; y: number; }

export default function CalendarPage() {
  const { token } = useAuth();
  const today = new Date();

  const [year, setYear]       = useState(today.getFullYear());
  const [month, setMonth]     = useState(today.getMonth());
  const [events, setEvents]   = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [popover, setPopover] = useState<DayPopover | null>(null);
  const [view, setView]       = useState<'month' | 'list'>('month');

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        // Step 1: get all board IDs
        const data = await api.boards.getAll(token);
        const summaries: any[] = data.boards || data || [];

        // Step 2: fetch each board fully (includes lists → cards with dueDate)
        const fullBoards = await Promise.all(
          summaries.map(b => api.boards.getById(token, b.id).catch(() => null))
        );

        const evts: CalEvent[] = [];
        fullBoards.forEach(board => {
          if (!board) return;
          board.lists?.forEach((list: any) => {
            list.cards?.forEach((card: any) => {
              if (card.dueDate) {
                evts.push({
                  id: card.id,
                  title: card.title,
                  date: new Date(card.dueDate),
                  labels: card.labels || [],
                  boardTitle: board.title,
                  listTitle: list.title,
                  isComplete: card.isComplete ?? false,
                });
              }
            });
          });
        });

        evts.sort((a, b) => a.date.getTime() - b.date.getTime());
        setEvents(evts);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [token]);

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsForDay = (d: number) => events.filter(e =>
    e.date.getFullYear() === year && e.date.getMonth() === month && e.date.getDate() === d
  );

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  // Upcoming events (next 30 days from today)
  const upcoming = events.filter(e => {
    const diff = e.date.getTime() - today.getTime();
    return diff >= -86400000 && diff <= 30 * 86400000;
  });

  const overdue = events.filter(e => e.date < today && !e.isComplete);

  const handleDayClick = (d: number, e: React.MouseEvent) => {
    const dayEvents = eventsForDay(d);
    if (!dayEvents.length) { setPopover(null); return; }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopover({ events: dayEvents, dateStr: `${MONTHS[month]} ${d}, ${year}`, x: rect.left, y: rect.bottom + 8 });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8f9ff', fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{ height: '64px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', background: '#fff', borderBottom: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)' }}>Architect Workspace</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['month', 'list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: '0.375rem 0.875rem', borderRadius: '0.5rem', border: 'none', background: view === v ? '#0036ad' : '#f1f5f9', color: view === v ? '#fff' : '#475569', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                {v === 'month' ? 'Month' : 'List'}
              </button>
            ))}
          </div>
        </header>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Main area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }} onClick={() => setPopover(null)}>

            {/* Nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <button onClick={prevMonth} style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0b1c30', minWidth: '220px', textAlign: 'center' }}>{MONTHS[month]} {year}</h2>
              <button onClick={nextMonth} style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }} style={{ marginLeft: '0.5rem', padding: '0.375rem 0.875rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>Today</button>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem', fontSize: '0.75rem', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><span style={{ width: '0.625rem', height: '0.625rem', borderRadius: '50%', background: '#0036ad', display: 'inline-block' }} />Task</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><span style={{ width: '0.625rem', height: '0.625rem', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />Done</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><span style={{ width: '0.625rem', height: '0.625rem', borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />Overdue</span>
              </div>
            </div>

            {view === 'month' ? (
              <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                {/* Day headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #f1f5f9' }}>
                  {DAYS.map(d => (
                    <div key={d} style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.6875rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em' }}>{d}</div>
                  ))}
                </div>

                {/* Calendar cells */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                  {cells.map((day, i) => {
                    if (day === null) return (
                      <div key={`empty-${i}`} style={{
                        height: '120px',
                        borderRight: i % 7 !== 6 ? '1px solid #f1f5f9' : 'none',
                        borderBottom: '1px solid #f1f5f9',
                        background: '#fafbff'
                      }} />
                    );
                    const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                    const dayEvts = eventsForDay(day);
                    const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    const MAX_VISIBLE = 3;
                    const visibleEvts = dayEvts.slice(0, MAX_VISIBLE);
                    const hiddenCount = dayEvts.length - MAX_VISIBLE;
                    return (
                      <div key={day}
                        onClick={e => { e.stopPropagation(); handleDayClick(day, e); }}
                        style={{
                          height: '120px',
                          padding: '0.5rem',
                          borderRight: (i + 1) % 7 !== 0 ? '1px solid #f1f5f9' : 'none',
                          borderBottom: '1px solid #f1f5f9',
                          cursor: dayEvts.length ? 'pointer' : 'default',
                          background: isToday ? '#eff6ff' : '#fff',
                          transition: 'background 0.15s',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                        onMouseEnter={e => { if (!isToday) (e.currentTarget as HTMLElement).style.background = '#fafbff'; }}
                        onMouseLeave={e => { if (!isToday) (e.currentTarget as HTMLElement).style.background = '#fff'; }}
                      >
                        {/* Date number */}
                        <div style={{ flexShrink: 0, width: '1.625rem', height: '1.625rem', borderRadius: '50%', background: isToday ? '#0036ad' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.3rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: isToday ? 800 : 500, color: isToday ? '#fff' : isPast ? '#cbd5e1' : '#0b1c30' }}>{day}</span>
                        </div>

                        {/* Task chips — fixed single line, truncated */}
                        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          {visibleEvts.map(ev => {
                            const col = getEventColor(ev.labels);
                            const isOverdue = !ev.isComplete && new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                            return (
                              <div key={ev.id} style={{
                                fontSize: '0.6rem',
                                fontWeight: 600,
                                padding: '0.15rem 0.375rem',
                                borderRadius: '0.25rem',
                                background: ev.isComplete ? '#f0fdf4' : isOverdue ? '#fef2f2' : col.bg,
                                color: ev.isComplete ? '#16a34a' : isOverdue ? '#dc2626' : col.text,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                textDecoration: ev.isComplete ? 'line-through' : 'none',
                                flexShrink: 0,
                                minWidth: 0,
                                maxWidth: '100%',
                                lineHeight: '1.4',
                              }}>
                                {ev.title}
                              </div>
                            );
                          })}
                        </div>

                        {/* +N more */}
                        {hiddenCount > 0 && (
                          <div style={{ flexShrink: 0, fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', marginTop: '0.1rem', lineHeight: 1 }}>
                            +{hiddenCount} more
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // List view
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#0036ad', animation: 'spin 0.8s linear infinite' }} /></div>
                ) : events.length === 0 ? (
                  <div style={{ background: '#fff', borderRadius: '1rem', padding: '4rem', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ marginBottom: '1rem' }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <p style={{ color: '#94a3b8', fontWeight: 600 }}>No tasks with due dates yet</p>
                  </div>
                ) : events.map(ev => {
                  const col = getEventColor(ev.labels);
                  const isOverdue = !ev.isComplete && ev.date < today;
                  return (
                    <div key={ev.id} style={{ background: '#fff', borderRadius: '0.875rem', padding: '1rem 1.25rem', border: `1px solid ${isOverdue ? '#fecaca' : '#f1f5f9'}`, display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                      <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '0.75rem', background: isOverdue ? '#fef2f2' : ev.isComplete ? '#f0fdf4' : col.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: isOverdue ? '#dc2626' : ev.isComplete ? '#16a34a' : col.text, lineHeight: 1 }}>{ev.date.getDate()}</span>
                        <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: isOverdue ? '#dc2626' : ev.isComplete ? '#16a34a' : col.text, textTransform: 'uppercase' }}>{MONTHS[ev.date.getMonth()].slice(0, 3)}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0b1c30', textDecoration: ev.isComplete ? 'line-through' : 'none', color: ev.isComplete ? '#94a3b8' : '#0b1c30' }}>{ev.title}</p>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.125rem' }}>{ev.boardTitle} → {ev.listTitle}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem' }}>
                        {ev.isComplete && <span style={{ fontSize: '0.625rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '9999px', background: '#f0fdf4', color: '#16a34a' }}>DONE</span>}
                        {isOverdue && <span style={{ fontSize: '0.625rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '9999px', background: '#fef2f2', color: '#dc2626' }}>OVERDUE</span>}
                        {ev.labels?.slice(0, 2).map(l => <span key={l} style={{ fontSize: '0.625rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '9999px', background: col.bg, color: col.text }}>{l}</span>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ width: '280px', flexShrink: 0, borderLeft: '1px solid #f1f5f9', background: '#fff', overflowY: 'auto', padding: '1.5rem' }}>
            {/* Stats */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em', marginBottom: '0.875rem' }}>OVERVIEW</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  { label: 'Total Tasks', value: events.length, color: '#0036ad', bg: '#eff6ff' },
                  { label: 'Completed', value: events.filter(e => e.isComplete).length, color: '#16a34a', bg: '#f0fdf4' },
                  { label: 'Overdue', value: overdue.length, color: '#dc2626', bg: '#fef2f2' },
                  { label: 'This Month', value: events.filter(e => e.date.getMonth() === month && e.date.getFullYear() === year).length, color: '#7c3aed', bg: '#f5f3ff' },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.875rem', borderRadius: '0.625rem', background: s.bg }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: s.color }}>{s.label}</span>
                    <span style={{ fontSize: '1.125rem', fontWeight: 900, color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming */}
            <div>
              <h4 style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em', marginBottom: '0.875rem' }}>UPCOMING (30 DAYS)</h4>
              {upcoming.length === 0 ? (
                <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', textAlign: 'center', padding: '1rem 0' }}>No upcoming tasks</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {upcoming.slice(0, 8).map(ev => {
                    const col = getEventColor(ev.labels);
                    const daysLeft = Math.ceil((ev.date.getTime() - today.getTime()) / 86400000);
                    return (
                      <div key={ev.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <div style={{ width: '0.25rem', borderRadius: '9999px', background: ev.isComplete ? '#16a34a' : col.text, alignSelf: 'stretch', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: ev.isComplete ? '#94a3b8' : '#0b1c30', textDecoration: ev.isComplete ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</p>
                          <p style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.125rem' }}>
                            {daysLeft <= 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `In ${daysLeft} days`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {upcoming.length > 8 && <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>+{upcoming.length - 8} more</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Day popover */}
      {popover && (
        <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', top: Math.min(popover.y, window.innerHeight - 300), left: Math.min(popover.x, window.innerWidth - 280), zIndex: 50, background: '#fff', borderRadius: '1rem', padding: '1rem', boxShadow: '0 16px 48px rgba(0,0,0,0.15)', border: '1px solid #f1f5f9', width: '260px', maxHeight: '280px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0b1c30' }}>{popover.dateStr}</h4>
            <button onClick={() => setPopover(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}>✕</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {popover.events.map(ev => {
              const col = getEventColor(ev.labels);
              return (
                <div key={ev.id} style={{ padding: '0.625rem 0.875rem', borderRadius: '0.625rem', background: ev.isComplete ? '#f0fdf4' : col.bg, border: `1px solid ${ev.isComplete ? '#bbf7d0' : '#e2e8f0'}` }}>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: ev.isComplete ? '#16a34a' : col.text, textDecoration: ev.isComplete ? 'line-through' : 'none', marginBottom: '0.25rem' }}>{ev.title}</p>
                  <p style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>{ev.boardTitle} → {ev.listTitle}</p>
                  {ev.isComplete && <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#16a34a' }}>✓ Complete</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
