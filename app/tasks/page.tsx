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

export default function WorkspacesPage() {
  const router = useRouter();
  const { token, user, isAuthenticated, loading: authLoading } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
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

  const filtered = boards.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));

  if (authLoading || (!isAuthenticated && loading)) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '3px solid var(--surface-container)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)', fontFamily: "'Inter', sans-serif" }}>

      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Top bar */}
        <header style={{
          height: '64px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 2rem', background: 'var(--surface-container-lowest)',
          boxShadow: '0 1px 0 0 var(--surface-container)', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)' }}>
            Architect Workspace
          </p>

          <div style={{ position: 'relative', width: '400px', margin: '0 2rem' }}>
            <svg style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
              style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.375rem', borderRadius: '0.625rem', border: 'none', background: 'var(--surface-container-low)', fontSize: '0.875rem', color: 'var(--on-surface)', fontFamily: "'Inter', sans-serif", outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: 'linear-gradient(135deg, #0369a1, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, padding: '2.5rem 3.5rem', overflowY: 'auto' }}>

          {/* Page header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
            <div>
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.5rem' }}>PROJECT OVERVIEW</p>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--on-surface)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Workspaces
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff', padding: '0.5rem', borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', border: '1px solid var(--surface-container)' }}>
              <button style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>List View</button>
              <button style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: 'transparent', color: 'var(--secondary)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>Board View</button>
            </div>
          </div>

          {/* List View Container */}
          <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--surface-container)', overflow: 'hidden', boxShadow: '0 4px 16px rgba(11,28,48,0.02)' }}>
            
            {/* List Header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', background: '#f8f9ff', borderBottom: '1px solid var(--surface-container)' }}>
              <div style={{ flex: 3, fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Project Name</div>
              <div style={{ flex: 1, fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Status</div>
              <div style={{ flex: 1.5, fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Volume</div>
              <div style={{ flex: 1.5, fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'right', paddingRight: '1rem' }}>Team</div>
            </div>

            {/* List Body */}
            <div>
              {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--secondary)' }}>Loading workspaces...</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>No Workspaces Found</p>
                  <p style={{ color: 'var(--secondary)' }}>Create a new board or adjust your search.</p>
                </div>
              ) : (
                filtered.map((board, i) => {
                  const totalCards = board.lists?.reduce((acc, l) => acc + (l.cards?.length ?? 0), 0) ?? 0;
                  const totalLists = board.lists?.length ?? 0;
                  
                  return (
                    <Link key={board.id} href={`/tasks/alltasks/${board.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: '#fff', transition: 'background 0.2s', cursor: 'pointer' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
                    >
                      {/* Name & Color */}
                      <div style={{ flex: 3, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '0.375rem', height: '2.5rem', borderRadius: '0.25rem', background: BOARD_COLORS[i % BOARD_COLORS.length] }} />
                        <div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.25rem' }}>{board.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Created: {new Date(board.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>

                      {/* Status */}
                      <div style={{ flex: 1 }}>
                        <span style={{ padding: '0.25rem 0.625rem', background: '#dcfce7', color: '#166534', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.05em' }}>ACTIVE</span>
                      </div>

                      {/* Volume */}
                      <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--on-surface)' }}>{totalLists} Lists</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--on-surface)' }}>{totalCards} Tasks</span>
                        </div>
                      </div>

                      {/* Team & Action */}
                      <div style={{ flex: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', paddingRight: '1rem' }}>
                          {(board.members || []).slice(0, 3).map((m, mi) => (
                            <div key={m.id} title={m.user.name || m.user.email} style={{
                              width: '1.75rem', height: '1.75rem', borderRadius: '50%',
                              background: ['#0036ad','#7c3aed','#2d6a4f'][mi % 3], border: '2px solid #fff',
                              marginLeft: mi === 0 ? 0 : '-0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontSize: '0.625rem', fontWeight: 700,
                            }}>
                              {(m.user.name || m.user.email)[0].toUpperCase()}
                            </div>
                          ))}
                          {(board.members?.length ?? 0) > 3 && (
                            <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', background: 'var(--surface-container)', border: '2px solid #fff', marginLeft: '-0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: 700, color: 'var(--secondary)' }}>
                              +{(board.members?.length ?? 0) - 3}
                            </div>
                          )}
                        </div>
                        <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'var(--surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
