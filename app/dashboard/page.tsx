'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Board } from '@/types/board';
import Sidebar from '@/components/layout/Sidebar';

// ── Types ─────────────────────────────────────────────────────────────────────
interface DashboardStats {
  totalBoards: number;
  totalCards: number;
  inProgressCards: number;
  doneCards: number;
  overdueCards: number;
  totalMembers: number;
}

interface DeadlineItem {
  id: string;
  title: string;
  boardTitle: string;
  dueDate: Date;
  isUrgent: boolean;
}

interface ActivityItem {
  id: string;
  type: 'board_created' | 'member_joined' | 'card_completed';
  text: string;
  highlight: string;
  time: string;
  icon: string;
  iconBg: string;
}

// ── Mini bar chart ────────────────────────────────────────────────────────────
function WeeklyChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '120px', padding: '0 0.5rem' }}>
      {data.map((val, i) => {
        const height = Math.max((val / max) * 100, 4);
        const isToday = i === new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{
              width: '100%',
              height: `${height}%`,
              borderRadius: '0.375rem 0.375rem 0 0',
              background: i === isToday
                ? 'linear-gradient(180deg, #0036ad, #1b4dd7)'
                : 'var(--surface-container)',
              transition: 'height 0.4s ease',
              position: 'relative',
              cursor: 'default',
            }}
              title={`${val} tasks`}
            />
            <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--secondary)', letterSpacing: '0.06em' }}>{days[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, badge, iconBg }: {
  icon: React.ReactNode; label: string; value: number; badge?: string; iconBg: string;
}) {
  return (
    <div style={{
      background: 'var(--surface-container-lowest)',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 4px 16px rgba(11,28,48,0.05)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'default',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(11,28,48,0.08)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(11,28,48,0.05)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{
          width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem',
          background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{icon}</div>
        {badge && (
          <span style={{
            fontSize: '0.6875rem', fontWeight: 700, padding: '0.25rem 0.5rem',
            borderRadius: '9999px', background: '#dcfce7', color: '#166534',
          }}>{badge}</span>
        )}
      </div>
      <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--on-surface)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '0.375rem' }}>
        {String(value).padStart(2, '0')}
      </p>
      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
    </div>
  );
}

// ── Create Board Modal ────────────────────────────────────────────────────────
function CreateBoardModal({ onClose, onCreate }: { onClose: () => void; onCreate: (title: string) => Promise<void> }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await onCreate(title.trim());
    setLoading(false);
    onClose();
  };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,28,48,0.4)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: '1.25rem', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 24px 64px rgba(11,28,48,0.15)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.375rem' }}>Create New Board</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--secondary)', marginBottom: '1.5rem' }}>Give your board a name to get started.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Product Roadmap"
            autoFocus
            style={{
              width: '100%', padding: '0.875rem 1rem', borderRadius: '0.625rem', border: 'none',
              background: 'var(--surface-container-low)', fontSize: '0.9375rem',
              color: 'var(--on-surface)', fontFamily: "'Inter', sans-serif",
              outline: 'none', marginBottom: '1rem',
              boxShadow: '0 0 0 2px rgba(0,54,173,0.15)',
            }}
          />
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '0.75rem', borderRadius: '0.625rem', border: 'none',
              background: 'var(--surface-container-low)', color: 'var(--secondary)',
              fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
            }}>Cancel</button>
            <button type="submit" disabled={loading || !title.trim()} style={{
              flex: 1, padding: '0.75rem', borderRadius: '0.625rem', border: 'none',
              background: 'linear-gradient(135deg, #0036ad, #1b4dd7)', color: '#fff',
              fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 700,
              cursor: loading || !title.trim() ? 'not-allowed' : 'pointer', opacity: loading || !title.trim() ? 0.6 : 1,
            }}>{loading ? 'Creating...' : 'Create Board'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { token, user, isAuthenticated, loading: authLoading } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalBoards: 0, totalCards: 0, inProgressCards: 0,
    doneCards: 0, overdueCards: 0, totalMembers: 0,
  });
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [weeklyData, setWeeklyData] = useState([3, 7, 5, 9, 4, 2, 6]);

  // Redirect if not authed
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/sign-in');
  }, [authLoading, isAuthenticated, router]);

  // Fetch boards + compute stats from real data
  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Step 1: get board list
      const data = await api.boards.getAll(token);
      const summaries: any[] = data.boards || data || [];
      setBoards(summaries);

      // Step 2: fetch each board fully to get real cards/lists
      const fullBoards = await Promise.all(
        summaries.map(b => api.boards.getById(token, b.id).catch(() => null))
      );

      let totalCards = 0, inProgress = 0, done = 0, overdue = 0;
      const memberIds = new Set<string>();
      const deadlineItems: DeadlineItem[] = [];
      const now = new Date();

      // Weekly buckets: index 0 = Mon … 6 = Sun
      const weeklyBuckets = [0, 0, 0, 0, 0, 0, 0];
      const weekAgo = new Date(now.getTime() - 7 * 86400000);

      fullBoards.forEach(board => {
        if (!board) return;

        // Unique members
        board.members?.forEach((m: any) => memberIds.add(m.user.id));
        if (board.owner) memberIds.add(board.owner.id ?? board.ownerId);

        board.lists?.forEach((list: any) => {
          const t = (list.title ?? '').toLowerCase();
          const isDoneList     = t.includes('done') || t.includes('complete');
          const isProgressList = t.includes('progress') || t.includes('doing') || t.includes('review');

          list.cards?.forEach((card: any) => {
            totalCards++;
            if (card.isComplete) done++;
            else if (isDoneList) done++;
            if (isProgressList && !card.isComplete) inProgress++;

            // Due date logic
            if (card.dueDate) {
              const due = new Date(card.dueDate);
              if (due < now && !card.isComplete) overdue++;

              const diffDays = (due.getTime() - now.getTime()) / 86400000;
              if (diffDays >= -1 && diffDays <= 7) {
                deadlineItems.push({
                  id: card.id,
                  title: card.title,
                  boardTitle: board.title,
                  dueDate: due,
                  isUrgent: diffDays < 1,
                });
              }
            }

            // Weekly completed tasks chart
            if (card.isComplete && card.updatedAt) {
              const updated = new Date(card.updatedAt);
              if (updated >= weekAgo) {
                // 0=Sun,1=Mon…6=Sat → remap to Mon=0…Sun=6
                const dow = updated.getDay();
                const idx = dow === 0 ? 6 : dow - 1;
                weeklyBuckets[idx]++;
              }
            }
          });
        });
      });

      deadlineItems.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

      setStats({
        totalBoards: summaries.length,
        totalCards,
        inProgressCards: inProgress,
        doneCards: done,
        overdueCards: overdue,
        totalMembers: memberIds.size,
      });
      setDeadlines(deadlineItems.slice(0, 3));
      setWeeklyData(weeklyBuckets);

    } catch (err) {
      console.error('Dashboard fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);


  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreateBoard = async (title: string) => {
    if (!token) return;
    try {
      const res = await api.boards.create(token, title);
      const newBoard = res.board || res;
      setBoards(prev => [newBoard, ...prev]);
      setStats(prev => ({ ...prev, totalBoards: prev.totalBoards + 1 }));
    } catch (err) {
      console.error('Create board failed:', err);
    }
  };

  const filteredBoards = boards.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDeadlineTime = (date: Date) => {
    const now = new Date();
    const diff = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diff < 0) return 'Overdue';
    if (diff < 24) return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    if (diff < 48) return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const efficiency = stats.totalCards > 0
    ? Math.round((stats.doneCards / stats.totalCards) * 100)
    : 0;

  if (authLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--surface)' }}>
      <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '3px solid var(--surface-container)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  // ── Recent activity from real board data
  const formatTimeAgo = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const recentActivity: ActivityItem[] = boards.slice(0, 3).map((board: any, i) => ({
    id: board.id,
    type: 'board_created' as const,
    text: i === 0 ? 'You created board ' : `Board active with ${board.members?.length || board._count?.members || 0} members: `,
    highlight: board.title,
    time: board.createdAt ? formatTimeAgo(board.createdAt) : 'Recently',
    icon: i === 0 ? '📋' : i === 1 ? '✅' : '👥',
    iconBg: i === 0 ? 'var(--surface-container-low)' : i === 1 ? '#dcfce7' : '#ede9fe',
  }));


  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)', fontFamily: "'Inter', sans-serif" }}>

      {/* Sidebar */}
      <Sidebar onNewBoard={() => setShowCreateModal(true)} />

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* ── Top Bar ──────────────────────────────────────────────────── */}
        <header style={{
          height: '64px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 2rem',
          background: 'var(--surface-container-lowest)',
          boxShadow: '0 1px 0 0 var(--surface-container)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          {/* Breadcrumb */}
          <div>
            <p style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)' }}>
              TASKFLOW WORKSPACE
            </p>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: '320px', flex: 1, margin: '0 2rem' }}>
            <svg style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search boards..."
              style={{
                width: '100%', padding: '0.5rem 1rem 0.5rem 2.375rem',
                borderRadius: '0.625rem', border: 'none',
                background: 'var(--surface-container-low)',
                fontSize: '0.875rem', color: 'var(--on-surface)',
                fontFamily: "'Inter', sans-serif", outline: 'none',
              }}
            />
          </div>

          {/* Right icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Notif bell */}
            <button style={{
              position: 'relative', width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem',
              border: 'none', background: 'var(--surface-container-low)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)',
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              {stats.overdueCards > 0 && (
                <div style={{
                  position: 'absolute', top: '-3px', right: '-3px',
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: 'var(--error)', border: '2px solid #fff',
                  fontSize: '0.5rem', color: '#fff', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{stats.overdueCards}</div>
              )}
            </button>

            {/* Settings */}
            <button style={{
              width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem',
              border: 'none', background: 'var(--surface-container-low)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)',
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 00-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </button>

            {/* Avatar */}
            <div style={{
              width: '2.25rem', height: '2.25rem', borderRadius: '50%',
              background: 'linear-gradient(135deg, #0036ad, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
            }}>
              {user?.name ? user.name[0].toUpperCase() : user?.email[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* ── Content ──────────────────────────────────────────────────── */}
        <div style={{ flex: 1, padding: '2rem', display: 'flex', gap: '1.5rem', minHeight: 0 }}>

          {/* ── Left/Main Column ─────────────────────────────────────── */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--on-surface)', letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>
                  Precision Dashboard
                </h1>
                <p style={{ fontSize: '0.9375rem', color: 'var(--secondary)' }}>
                  {getGreeting()}, <strong style={{ color: 'var(--on-surface)' }}>{user?.name?.split(' ')[0] || 'there'}</strong>.
                  {stats.overdueCards > 0
                    ? ` You have ${stats.overdueCards} task${stats.overdueCards > 1 ? 's' : ''} past due.`
                    : stats.totalCards > 0
                      ? ` You have ${stats.totalCards} active task${stats.totalCards > 1 ? 's' : ''} across ${stats.totalBoards} board${stats.totalBoards > 1 ? 's' : ''}.`
                      : ' Create your first board to get started.'}
                </p>
              </div>
              <div style={{
                textAlign: 'right', background: 'var(--surface-container-lowest)',
                borderRadius: '0.875rem', padding: '0.75rem 1.25rem',
                boxShadow: '0 4px 16px rgba(11,28,48,0.05)',
              }}>
                <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {efficiency}%
                </p>
                <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--secondary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Completion Rate
                </p>
              </div>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <StatCard
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0036ad" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
                label="Total Active Tasks"
                value={stats.totalCards}
                badge={stats.totalCards > 0 ? `${stats.totalBoards} boards` : undefined}
                iconBg="var(--surface-container-low)"
              />
              <StatCard
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
                label="In Execution"
                value={stats.inProgressCards}
                iconBg="#ede9fe"
              />
              <StatCard
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>}
                label="Milestones Completed"
                value={stats.doneCards}
                iconBg="#dcfce7"
              />
            </div>

            {/* Weekly chart */}
            <div style={{
              background: 'var(--surface-container-lowest)',
              borderRadius: '1rem', padding: '1.5rem',
              boxShadow: '0 4px 16px rgba(11,28,48,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)' }}>Weekly Productivity Output</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0036ad' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 500 }}>Tasks Done</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--surface-container)' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 500 }}>Time Spent</span>
                  </div>
                </div>
              </div>
              <WeeklyChart data={weeklyData} />
            </div>

            {/* Recent Activity */}
            <div style={{
              background: 'var(--surface-container-lowest)',
              borderRadius: '1rem', padding: '1.5rem',
              boxShadow: '0 4px 16px rgba(11,28,48,0.05)',
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '1.25rem' }}>Recent Activity</h3>
              {recentActivity.length === 0 ? (
                <p style={{ fontSize: '0.875rem', color: 'var(--secondary)', textAlign: 'center', padding: '1.5rem 0' }}>
                  No activity yet — create your first board!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {recentActivity.map((item, i) => (
                    <div key={item.id} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
                      padding: '0.875rem 0',
                      borderBottom: i < recentActivity.length - 1 ? '1px solid var(--surface-container-low)' : 'none',
                    }}>
                      <div style={{
                        width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem', flexShrink: 0,
                        background: item.iconBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                      }}>{item.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
                          {item.text}
                          <Link href={`/boards`} style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                            {item.highlight}
                          </Link>
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.125rem' }}>{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Boards grid */}
            {filteredBoards.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)' }}>Your Boards</h3>
                  <Link href="/boards" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>View all →</Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.875rem' }}>
                  {filteredBoards.slice(0, 6).map((board, i) => {
                    const colors = ['#0036ad','#7c3aed','#2d6a4f','#b45309','#be123c','#0369a1'];
                    return (
                      <Link key={board.id} href={`/boards/${board.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{
                          background: 'var(--surface-container-lowest)',
                          borderRadius: '0.875rem', padding: '1.25rem',
                          boxShadow: '0 2px 8px rgba(11,28,48,0.05)',
                          transition: 'all 0.2s', cursor: 'pointer',
                          borderTop: `3px solid ${colors[i % colors.length]}`,
                        }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(11,28,48,0.1)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(11,28,48,0.05)'; }}
                        >
                          <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{board.title}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                            {board._count?.lists || board.lists?.length || 0} lists · {board.members?.length || 0} members
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Right Sidebar Column ────────────────────────────────── */}
          <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Critical Deadlines */}
            <div style={{
              background: 'var(--surface-container-lowest)',
              borderRadius: '1rem', padding: '1.5rem',
              boxShadow: '0 4px 16px rgba(11,28,48,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem', background: '#ffdad6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ba1a1a" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                </div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--on-surface)' }}>Critical Deadlines</h3>
              </div>

              {deadlines.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎉</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--secondary)' }}>No upcoming deadlines!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {deadlines.map((item, i) => (
                    <div key={item.id} style={{
                      paddingBottom: i < deadlines.length - 1 ? '1rem' : 0,
                      borderBottom: i < deadlines.length - 1 ? '1px solid var(--surface-container-low)' : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                        <span style={{
                          fontSize: '0.625rem', fontWeight: 700, padding: '0.125rem 0.5rem',
                          borderRadius: '9999px', letterSpacing: '0.06em',
                          background: item.isUrgent ? '#ffdad6' : 'var(--surface-container-low)',
                          color: item.isUrgent ? '#ba1a1a' : 'var(--primary)',
                        }}>{item.isUrgent ? 'URGENT' : 'UPCOMING'}</span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--secondary)', fontWeight: 500 }}>
                          {formatDeadlineTime(item.dueDate)}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.25rem' }}>{item.title}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', lineHeight: 1.5 }}>From board: {item.boardTitle}</p>
                    </div>
                  ))}
                </div>
              )}

              <Link href="/boards" style={{
                display: 'block', textAlign: 'center', marginTop: '1.25rem',
                padding: '0.625rem', borderRadius: '0.625rem',
                background: 'var(--surface-container-low)',
                fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)',
                textDecoration: 'none', transition: 'all 0.2s',
              }}>VIEW ALL BOARDS</Link>
            </div>

            {/* Team Members */}
            <div style={{
              background: 'var(--surface-container-lowest)',
              borderRadius: '1rem', padding: '1.5rem',
              boxShadow: '0 4px 16px rgba(11,28,48,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--secondary)' }}>TEAM MEMBERS</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#40916c' }} />
                  <span style={{ fontSize: '0.6875rem', color: '#40916c', fontWeight: 600 }}>Active</span>
                </div>
              </div>

              {boards.length === 0 ? (
                <p style={{ fontSize: '0.8125rem', color: 'var(--secondary)', textAlign: 'center', padding: '1rem 0' }}>No team members yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {Array.from(
                    new Map(
                      (boards as any[]).flatMap(b => b.members || []).map((m: any) => [m.user.id, m])
                    ).values()
                  ).slice(0, 5).map((member: any, i) => {
                    const colors = ['#0036ad','#7c3aed','#2d6a4f','#b45309','#be123c'];
                    return (
                      <div key={member.user.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '2rem', height: '2rem', borderRadius: '50%',
                          background: colors[i % colors.length],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0,
                        }}>
                          {(member.user.name || member.user.email)[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {member.user.name || member.user.email.split('@')[0]}
                          </p>
                          <p style={{ fontSize: '0.6875rem', color: 'var(--secondary)', marginTop: '0.1rem' }}>{member.role}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quick stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1.25rem' }}>
                <div style={{ background: 'var(--surface-container-low)', borderRadius: '0.625rem', padding: '0.625rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary)' }}>{stats.totalBoards}</p>
                  <p style={{ fontSize: '0.625rem', color: 'var(--secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Boards</p>
                </div>
                <div style={{ background: 'var(--surface-container-low)', borderRadius: '0.625rem', padding: '0.625rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary)' }}>{stats.totalMembers}</p>
                  <p style={{ fontSize: '0.625rem', color: 'var(--secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Members</p>
                </div>
              </div>
            </div>


            {/* Quick actions */}
            <div style={{
              background: 'var(--surface-container-lowest)',
              borderRadius: '1rem', padding: '1.25rem',
              boxShadow: '0 4px 16px rgba(11,28,48,0.05)',
            }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--secondary)', marginBottom: '0.875rem' }}>Quick Actions</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { label: '+ New Board', action: () => setShowCreateModal(true), primary: true },
                  { label: '📋 View All Boards', href: '/boards' },
                  { label: '✅ My Tasks', href: '/mytasks' },
                ].map((item, i) => (
                  item.href ? (
                    <Link key={i} href={item.href} style={{
                      display: 'block', padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
                      fontSize: '0.8125rem', fontWeight: 600,
                      color: 'var(--on-surface)', textDecoration: 'none',
                      background: 'var(--surface-container-low)',
                      transition: 'all 0.15s',
                    }}>
                      {item.label}
                    </Link>
                  ) : (
                    <button key={i} onClick={item.action} style={{
                      display: 'block', width: '100%', padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
                      fontSize: '0.8125rem', fontWeight: 700, textAlign: 'left',
                      color: '#fff', border: 'none', fontFamily: "'Inter', sans-serif",
                      background: 'linear-gradient(135deg, #0036ad, #1b4dd7)',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                      {item.label}
                    </button>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Board Modal */}
      {showCreateModal && (
        <CreateBoardModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateBoard}
        />
      )}
    </div>
  );
}
