'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Board } from '@/types/board';
import Sidebar from '@/components/layout/Sidebar';

const BOARD_COLORS = [
  'linear-gradient(135deg, #0036ad, #1b4dd7)',
  'linear-gradient(135deg, #7c3aed, #a855f7)',
  'linear-gradient(135deg, #2d6a4f, #40916c)',
  'linear-gradient(135deg, #b45309, #d97706)',
  'linear-gradient(135deg, #be123c, #e11d48)',
  'linear-gradient(135deg, #0369a1, #0ea5e9)',
];

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
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,28,48,0.4)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: '1.25rem', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 24px 64px rgba(11,28,48,0.15)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.375rem' }}>New Board</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--secondary)', marginBottom: '1.5rem' }}>Give your project board a name to get started.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Product Roadmap, Sprint 24..."
            autoFocus
            style={{
              width: '100%', padding: '0.875rem 1rem', borderRadius: '0.625rem',
              border: 'none', background: 'var(--surface-container-low)',
              fontSize: '0.9375rem', color: 'var(--on-surface)',
              fontFamily: "'Inter', sans-serif", outline: 'none', marginBottom: '1rem',
              boxShadow: '0 0 0 2px rgba(0,54,173,0.15)',
            }}
          />
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.625rem', border: 'none', background: 'var(--surface-container-low)', color: 'var(--secondary)', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading || !title.trim()} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.625rem', border: 'none', background: 'linear-gradient(135deg, #0036ad, #1b4dd7)', color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 700, cursor: loading || !title.trim() ? 'not-allowed' : 'pointer', opacity: loading || !title.trim() ? 0.6 : 1 }}>
              {loading ? 'Creating...' : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BoardsPage() {
  const router = useRouter();
  const { token, user, isAuthenticated, loading: authLoading } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/sign-in');
  }, [authLoading, isAuthenticated, router]);

  const fetchBoards = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.boards.getAll(token);
      setBoards(data.boards || data || []);
    } catch (err) {
      console.error('Failed to fetch boards:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchBoards(); }, [fetchBoards]);

  const handleCreate = async (title: string) => {
    if (!token) return;
    const res = await api.boards.create(token, title);
    const newBoard = res.board || res;
    setBoards(prev => [newBoard, ...prev]);
    router.push(`/boards/${newBoard.id}`);
  };

  const filtered = boards.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));

  if (authLoading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '3px solid var(--surface-container)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)', fontFamily: "'Inter', sans-serif" }}>

      <Sidebar onNewBoard={() => setShowCreate(true)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar */}
        <header style={{
          height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 2rem', background: 'var(--surface-container-lowest)',
          boxShadow: '0 1px 0 0 var(--surface-container)', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)' }}>
            TASKFLOW WORKSPACE
          </p>

          <div style={{ position: 'relative', maxWidth: '300px', flex: 1, margin: '0 2rem' }}>
            <svg style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search boards..."
              style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.375rem', borderRadius: '0.625rem', border: 'none', background: 'var(--surface-container-low)', fontSize: '0.875rem', color: 'var(--on-surface)', fontFamily: "'Inter', sans-serif", outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: 'linear-gradient(135deg, #0036ad, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, padding: '2rem' }}>

          {/* Page header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.375rem' }}>PROJECT BOARDS</p>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--on-surface)', letterSpacing: '-0.03em', marginBottom: '0.375rem' }}>
                All Boards
              </h1>
              <p style={{ fontSize: '0.9375rem', color: 'var(--secondary)' }}>
                {boards.length === 0 ? 'No boards yet — create your first one.' : `${boards.length} board${boards.length > 1 ? 's' : ''} across your workspace`}
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              style={{
                padding: '0.75rem 1.5rem', borderRadius: '0.625rem', border: 'none',
                background: 'linear-gradient(135deg, #0036ad, #1b4dd7)', color: '#fff',
                fontSize: '0.875rem', fontWeight: 700, fontFamily: "'Inter', sans-serif",
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                boxShadow: '0 4px 16px rgba(0,54,173,0.25)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              New Board
            </button>
          </div>

          {/* Loading */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ height: '160px', borderRadius: '1rem', background: 'var(--surface-container-low)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            /* Empty state */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>📋</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>
                {search ? 'No boards match your search' : 'No boards yet'}
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--secondary)', marginBottom: '2rem', maxWidth: '24rem' }}>
                {search ? 'Try a different search term.' : 'Create your first board to start organising your projects.'}
              </p>
              {!search && (
                <button
                  onClick={() => setShowCreate(true)}
                  style={{
                    padding: '0.75rem 2rem', borderRadius: '0.625rem', border: 'none',
                    background: 'linear-gradient(135deg, #0036ad, #1b4dd7)', color: '#fff',
                    fontSize: '0.9375rem', fontWeight: 700, fontFamily: "'Inter', sans-serif",
                    cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,54,173,0.25)',
                  }}
                >
                  + Create First Board
                </button>
              )}
            </div>
          ) : (
            /* Board grid */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {filtered.map((board: any, i) => {
                const listCount = board._count?.lists ?? board.lists?.length ?? 0;
                const totalCards = board.lists
                  ? board.lists.reduce((acc: number, l: any) => acc + (l._count?.cards ?? l.cards?.length ?? 0), 0)
                  : 0;
                return (
                  <Link key={board.id} href={`/boards/${board.id}`} style={{ textDecoration: 'none' }}>
                    <div
                      style={{
                        borderRadius: '1rem', overflow: 'hidden',
                        boxShadow: '0 4px 16px rgba(11,28,48,0.06)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        cursor: 'pointer', background: '#fff',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(11,28,48,0.12)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(11,28,48,0.06)'; }}
                    >
                      {/* Color band */}
                      <div style={{ height: '6px', background: BOARD_COLORS[i % BOARD_COLORS.length] }} />

                      {/* Card body */}
                      <div style={{ padding: '1.25rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {board.title}
                        </h3>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--secondary)', marginBottom: '1.25rem' }}>
                          {listCount} lists · {totalCards} tasks
                        </p>

                        {/* Member avatars */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex' }}>
                            {(board.members || []).slice(0, 3).map((m, mi) => (
                              <div key={m.id} title={m.user.name || m.user.email} style={{
                                width: '1.75rem', height: '1.75rem', borderRadius: '50%',
                                background: ['#0036ad','#7c3aed','#2d6a4f'][mi % 3],
                                border: '2px solid #fff', marginLeft: mi === 0 ? 0 : '-0.5rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontSize: '0.5625rem', fontWeight: 700,
                              }}>
                                {(m.user.name || m.user.email)[0].toUpperCase()}
                              </div>
                            ))}
                            {(board.members?.length ?? 0) > 3 && (
                              <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', background: 'var(--surface-container)', border: '2px solid #fff', marginLeft: '-0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5625rem', fontWeight: 700, color: 'var(--secondary)' }}>
                                +{(board.members?.length ?? 0) - 3}
                              </div>
                            )}
                          </div>

                          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--primary)', background: 'var(--surface-container-low)', padding: '0.25rem 0.625rem', borderRadius: '9999px' }}>
                            Open →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* Create new board card */}
              <button
                onClick={() => setShowCreate(true)}
                style={{
                  borderRadius: '1rem', border: '2px dashed rgba(0,54,173,0.2)',
                  background: 'transparent', cursor: 'pointer', padding: '1.5rem',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '0.625rem', minHeight: '140px', transition: 'all 0.2s',
                  fontFamily: "'Inter', sans-serif",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-container-low)'; (e.currentTarget as HTMLElement).style.border = '2px dashed var(--primary)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.border = '2px dashed rgba(0,54,173,0.2)'; }}
              >
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'var(--surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>New Board</p>
              </button>
            </div>
          )}
        </div>
      </div>

      {showCreate && <CreateBoardModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
    </div>
  );
}
