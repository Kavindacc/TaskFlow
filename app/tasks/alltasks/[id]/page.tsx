'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Board } from '@/types/board';
import Sidebar from '@/components/layout/Sidebar';

// ── Label colour map ───────────────────────────────────────────────────────────
const LABEL_MAP: Record<string, { bg: string; text: string }> = {
  design:         { bg: '#dbeafe', text: '#1e40af' },
  frontend:       { bg: '#dbeafe', text: '#1e40af' },
  backend:        { bg: '#dcfce7', text: '#166534' },
  research:       { bg: '#f3e8ff', text: '#6b21a8' },
  planning:       { bg: '#fef9c3', text: '#854d0e' },
  legal:          { bg: '#fee2e2', text: '#991b1b' },
  urgent:         { bg: '#ffdad6', text: '#ba1a1a' },
  bug:            { bg: '#ffdad6', text: '#ba1a1a' },
  critical:       { bg: '#ffdad6', text: '#ba1a1a' },
  security:       { bg: '#fef3c7', text: '#b45309' },
  feature:        { bg: '#dbeafe', text: '#1e40af' },
  devops:         { bg: '#dcfce7', text: '#166534' },
  marketing:      { bg: '#f3e8ff', text: '#6b21a8' },
  analytics:      { bg: '#fef9c3', text: '#854d0e' },
  content:        { bg: '#e0f2fe', text: '#0369a1' },
  performance:    { bg: '#fef9c3', text: '#854d0e' },
  'high priority':{ bg: '#fef3c7', text: '#b45309' },
  ux:             { bg: '#f0fdf4', text: '#166534' },
  seo:            { bg: '#ede9fe', text: '#6d28d9' },
  email:          { bg: '#e0f2fe', text: '#0369a1' },
};

function getLabelStyle(label: string) {
  return LABEL_MAP[label.toLowerCase()] ?? { bg: 'var(--surface-container-low)', text: 'var(--primary)' };
}

const LIST_ACCENT_COLORS = [
  '#0036ad', '#7c3aed', '#0f766e', '#b45309', '#be185d', '#0369a1', '#15803d',
];

// ── Component ──────────────────────────────────────────────────────────────────
export default function AllTasksPage() {
  const router   = useRouter();
  const params   = useParams();
  const boardId  = params.id as string;
  const { token, user, isAuthenticated, loading: authLoading } = useAuth();

  const [board, setBoard]   = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/sign-in');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchBoard = async () => {
      if (!token || !boardId) return;
      try {
        const data = await api.boards.getById(token, boardId);
        setBoard(data);
      } catch (err) {
        console.error('Failed to fetch board details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, [token, boardId]);

  const handleListUpdate = async (listId: string, data: { isComplete?: boolean; assigneeId?: string | null }) => {
    if (!token || !board) return;
    setBoard({ ...board, lists: board.lists.map(l => l.id === listId ? { ...l, ...data } : l) });
    try { await api.lists.update(token, listId, data); }
    catch (e) { console.error('Failed to update list', e); }
  };

  // Spinner
  if (authLoading || (!isAuthenticated && loading)) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '3px solid var(--surface-container)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  const totalCards     = board?.lists?.reduce((a, l) => a + l.cards.length, 0) ?? 0;
  const completedCards = board?.lists?.reduce((a, l) => a + l.cards.filter(c => c.isComplete).length, 0) ?? 0;
  const completedLists = board?.lists?.filter(l => l.isComplete).length ?? 0;

  // Filter cards by search
  const filteredLists = board?.lists?.map(list => ({
    ...list,
    cards: list.cards.filter(c =>
      !search || c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.labels?.some(lb => lb.toLowerCase().includes(search.toLowerCase()))
    ),
  })) ?? [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* ── Top bar ───────────────────────────────────────────────────── */}
        <header style={{
          height: '64px', flexShrink: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 2rem',
          background: 'var(--surface-container-lowest)',
          boxShadow: '0 1px 0 0 var(--surface-container)', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)' }}>
            Architect Workspace
          </p>

          <div style={{ position: 'relative', width: '360px', margin: '0 2rem' }}>
            <svg style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text" placeholder="Search tasks or labels…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.375rem', borderRadius: '0.625rem', border: 'none', background: 'var(--surface-container-low)', fontSize: '0.875rem', color: 'var(--on-surface)', fontFamily: "'Inter', sans-serif", outline: 'none' }}
            />
          </div>

          <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: 'linear-gradient(135deg, #0036ad, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
          </div>
        </header>

        {/* ── Content ───────────────────────────────────────────────────── */}
        <div style={{ flex: 1, padding: '2rem 2.5rem', overflowY: 'auto' }}>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--secondary)', paddingTop: '4rem', justifyContent: 'center' }}>
              <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', border: '2px solid var(--surface-container)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
              Loading tasks…
            </div>
          ) : !board ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--on-surface)' }}>Board not found</h2>
              <Link href="/tasks" style={{ color: 'var(--primary)', marginTop: '1rem', display: 'inline-block', fontWeight: 600, textDecoration: 'none' }}>← Back to Workspaces</Link>
            </div>
          ) : (
            <>
              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Link href="/tasks" style={{ fontSize: '0.8125rem', color: 'var(--secondary)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s' }}>Workspaces</Link>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                <span style={{ fontSize: '0.8125rem', color: 'var(--secondary)', fontWeight: 500 }}>{board.title}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface)', fontWeight: 700 }}>All Tasks</span>
              </div>

              {/* Page header + stats */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--on-surface)', letterSpacing: '-0.03em', marginBottom: '0.375rem' }}>
                    {board.title}
                  </h1>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--secondary)' }}>
                    {board.lists?.length ?? 0} lists · {totalCards} tasks · {completedCards} completed
                  </p>
                </div>

                {/* Mini stat pills */}
                <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Total', value: totalCards, bg: '#eff6ff', color: '#0036ad' },
                    { label: 'Done', value: completedCards, bg: '#f0fdf4', color: '#16a34a' },
                    { label: 'Lists Done', value: completedLists, bg: '#f5f3ff', color: '#7c3aed' },
                  ].map(s => (
                    <div key={s.label} style={{ background: s.bg, borderRadius: '0.75rem', padding: '0.625rem 1rem', textAlign: 'center', minWidth: '72px' }}>
                      <p style={{ fontSize: '1.25rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
                      <p style={{ fontSize: '0.625rem', fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.125rem' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lists */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {filteredLists.length === 0 ? (
                  <div style={{ padding: '4rem', textAlign: 'center', background: 'var(--surface-container-lowest)', borderRadius: '1rem', border: '1px dashed var(--surface-container)' }}>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.375rem' }}>No lists found</p>
                    <p style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>This board has no lists yet.</p>
                  </div>
                ) : filteredLists.map((list, li) => {
                  const accent  = LIST_ACCENT_COLORS[li % LIST_ACCENT_COLORS.length];
                  const isDone  = list.isComplete;

                  return (
                    <div key={list.id} style={{
                      background: 'var(--surface-container-lowest)',
                      borderRadius: '1rem',
                      border: `1px solid ${isDone ? '#bbf7d0' : 'var(--surface-container)'}`,
                      overflow: 'hidden',
                      boxShadow: '0 2px 12px rgba(11,28,48,0.04)',
                      opacity: isDone ? 0.85 : 1,
                      transition: 'opacity 0.2s',
                    }}>

                      {/* Accent line */}
                      <div style={{ height: '3px', background: isDone ? '#16a34a' : accent }} />

                      {/* List header */}
                      <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--surface-container-low)', background: isDone ? '#f0fdf4' : 'var(--surface-container-lowest)', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: isDone ? '#16a34a' : 'var(--on-surface)', letterSpacing: '0.05em', textTransform: 'uppercase', textDecoration: isDone ? 'line-through' : 'none' }}>
                            {list.title}
                          </h3>
                          <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '9999px', background: 'var(--surface-container-low)', color: 'var(--secondary)', border: '1px solid var(--surface-container)' }}>
                            {list.cards.length}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                          {/* Mark complete toggle */}
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <div style={{ width: '1.125rem', height: '1.125rem', borderRadius: '0.25rem', border: isDone ? '2px solid #16a34a' : '2px solid var(--secondary)', background: isDone ? '#16a34a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                              {isDone && <svg width="10" height="10" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <input type="checkbox" style={{ display: 'none' }} checked={isDone ?? false} onChange={e => handleListUpdate(list.id, { isComplete: e.target.checked })} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isDone ? '#16a34a' : 'var(--secondary)' }}>
                              {isDone ? 'Completed' : 'Mark Complete'}
                            </span>
                          </label>

                          {/* Assignee */}
                          <select
                            value={(list as any).assigneeId || ''}
                            onChange={e => handleListUpdate(list.id, { assigneeId: e.target.value || null })}
                            style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface)', background: 'var(--surface-container-low)', border: '1px solid var(--surface-container)', borderRadius: '0.5rem', padding: '0.25rem 0.5rem', outline: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
                          >
                            <option value="">Unassigned</option>
                            {board.members?.map(m => (
                              <option key={m.user.id} value={m.user.id}>{m.user.name || m.user.email}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Cards */}
                      <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {list.cards.length === 0 ? (
                          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--secondary)', fontSize: '0.875rem' }}>
                            No tasks in this list{search ? ' matching your search' : ''}.
                          </div>
                        ) : list.cards.map(card => {
                          const isOverdue = card.dueDate && !card.isComplete && new Date(card.dueDate) < new Date();
                          return (
                            <Link
                              key={card.id}
                              href={`/tasks/task-detailview?boardId=${boardId}&listId=${list.id}`}
                              style={{
                                textDecoration: 'none', display: 'flex', alignItems: 'center',
                                padding: '0.75rem 1rem', borderRadius: '0.75rem',
                                background: card.isComplete ? '#f0fdf4' : isOverdue ? '#fef2f2' : 'var(--surface)',
                                border: `1px solid ${card.isComplete ? '#bbf7d0' : isOverdue ? '#fecaca' : 'var(--surface-container)'}`,
                                transition: 'all 0.2s', gap: '0.875rem',
                                boxShadow: '0 1px 4px rgba(11,28,48,0.03)',
                              }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateX(3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(11,28,48,0.08)'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(11,28,48,0.03)'; }}
                            >
                              {/* Status dot */}
                              <div style={{ width: '1.125rem', height: '1.125rem', borderRadius: '50%', border: card.isComplete ? '2px solid #16a34a' : isOverdue ? '2px solid #dc2626' : '2px solid var(--secondary)', background: card.isComplete ? '#16a34a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                                {card.isComplete && <svg width="9" height="9" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                              </div>

                              {/* Title + labels */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: card.isComplete ? 'var(--secondary)' : 'var(--on-surface)', textDecoration: card.isComplete ? 'line-through' : 'none', marginBottom: card.labels?.length ? '0.375rem' : 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {card.title}
                                </p>
                                {card.labels && card.labels.length > 0 && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                                    {card.labels.slice(0, 4).map((lbl, i) => {
                                      const s = getLabelStyle(lbl);
                                      return <span key={i} style={{ fontSize: '0.5625rem', fontWeight: 700, padding: '0.1875rem 0.5rem', borderRadius: '9999px', background: s.bg, color: s.text, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{lbl}</span>;
                                    })}
                                    {card.labels.length > 4 && <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--secondary)' }}>+{card.labels.length - 4}</span>}
                                  </div>
                                )}
                              </div>

                              {/* Due date */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isOverdue ? '#dc2626' : 'var(--secondary)'} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isOverdue ? '#dc2626' : card.dueDate ? 'var(--on-surface-variant)' : 'var(--secondary)' }}>
                                  {card.dueDate ? new Date(card.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                                </span>
                                {isOverdue && <span style={{ fontSize: '0.5625rem', fontWeight: 700, padding: '0.125rem 0.375rem', borderRadius: '9999px', background: '#fef2f2', color: '#dc2626' }}>OVERDUE</span>}
                              </div>

                              {/* Arrow */}
                              <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', background: 'var(--surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
