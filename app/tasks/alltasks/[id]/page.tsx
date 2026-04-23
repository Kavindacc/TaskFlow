'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Board } from '@/types/board';
import Sidebar from '@/components/layout/Sidebar';

// Utility for label colors
const LABEL_STYLES: Record<string, { bg: string; text: string }> = {
  design:      { bg: '#dbeafe', text: '#1e40af' },
  frontend:    { bg: '#dbeafe', text: '#1e40af' },
  backend:     { bg: '#dcfce7', text: '#166534' },
  research:    { bg: '#f3e8ff', text: '#6b21a8' },
  planning:    { bg: '#fef9c3', text: '#854d0e' },
  legal:       { bg: '#fee2e2', text: '#991b1b' },
  urgent:      { bg: '#ffdad6', text: '#ba1a1a' },
  'high priority': { bg: '#fef3c7', text: '#b45309' },
  success:     { bg: '#dcfce7', text: '#166534' },
  feature:     { bg: '#dbeafe', text: '#1e40af' },
  bug:         { bg: '#ffdad6', text: '#ba1a1a' },
};

function getLabelStyle(label: string) {
  const key = label.toLowerCase();
  return LABEL_STYLES[key] || { bg: 'var(--surface-container-low)', text: 'var(--primary)' };
}

export default function AllTasksPage() {
  const router = useRouter();
  const params = useParams();
  const boardId = params.id as string;
  
  const { token, user, isAuthenticated, loading: authLoading } = useAuth();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleListUpdate = async (listId: string, data: { isComplete?: boolean, assigneeId?: string | null }) => {
    if (!token || !board) return;
    
    // Optimistic update
    setBoard({
      ...board,
      lists: board.lists.map(l => l.id === listId ? { ...l, ...data } : l)
    });

    try {
      await api.lists.update(token, listId, data);
    } catch (e) {
      console.error('Failed to update list', e);
    }
  };

  if (authLoading || (!isAuthenticated && loading)) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '3px solid var(--surface-container)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)', fontFamily: "'Inter', sans-serif" }}>

      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Top bar */}
        <header style={{
          height: '64px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 2rem', background: '#ffffff',
          borderBottom: '1px solid var(--surface-container-low)', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)' }}>
            Architect Workspace
          </p>

          <div style={{ position: 'relative', width: '400px', margin: '0 2rem' }}>
            <svg style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text" placeholder="Search across lists..."
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
          
          {loading ? (
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--secondary)', paddingTop: '2rem' }}>
                <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', border: '2px solid var(--surface-container)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
                Loading comprehensive tasks...
             </div>
          ) : !board ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--on-surface)' }}>Workplace not found</h2>
              <Link href="/tasks" style={{ color: 'var(--primary)', marginTop: '1rem', display: 'inline-block', fontWeight: 600, textDecoration: 'none' }}>← Back to Workspaces</Link>
            </div>
          ) : (
            <>
              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Link href="/tasks" style={{ fontSize: '0.8125rem', color: 'var(--secondary)', textDecoration: 'none', fontWeight: 500 }}>Workspaces</Link>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                <span style={{ fontSize: '0.8125rem', color: 'var(--secondary)', fontWeight: 500 }}>{board.title}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface)', fontWeight: 700 }}>All Tasks</span>
              </div>

              {/* Page header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                <div>
                  <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0b1c30', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '0.5rem' }}>
                    All Tasks
                  </h1>
                  <p style={{ fontSize: '1rem', color: 'var(--secondary)' }}>
                    Viewing all categorized tasks within <strong>{board.title}</strong>
                  </p>
                </div>
              </div>

              {/* Lists / Task Categories */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                {board.lists && board.lists.length > 0 ? (
                  board.lists.map(list => (
                    <div key={list.id} style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--surface-container)', overflow: 'hidden', boxShadow: '0 4px 16px rgba(7, 18, 30, 0.02)' }}>
                      
                      {/* List Header */}
                      <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', background: '#d2e1ffff', borderBottom: '1px solid var(--surface-container)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                          <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: list.isComplete ? 'var(--secondary)' : '#0b1c30', letterSpacing: '0.05em', textTransform: 'uppercase', textDecoration: list.isComplete ? 'line-through' : 'none' }}>
                            {list.title}
                          </h3>
                          <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '9999px', background: '#fff', color: 'var(--secondary)', border: '1px solid var(--surface-container-low)' }}>
                            {list.cards.length}
                          </span>
                        </div>

                        {/* List Status & Assignee Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <div style={{
                              width: '1.25rem', height: '1.25rem', borderRadius: '0.25rem', 
                              border: list.isComplete ? '2px solid #0284c7' : '2px solid #94a3b8',
                              background: list.isComplete ? '#0284c7' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {list.isComplete && <svg width="12" height="12" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <input 
                              type="checkbox" 
                              style={{ display: 'none' }} 
                              checked={list.isComplete ?? false}
                              onChange={(e) => handleListUpdate(list.id, { isComplete: e.target.checked })}
                            />
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: list.isComplete ? 'var(--secondary)' : '#0b1c30' }}>
                              Mark Complete
                            </span>
                          </label>

                          <select
                            value={list.assigneeId || ''}
                            onChange={(e) => handleListUpdate(list.id, { assigneeId: e.target.value || null })}
                            style={{
                              fontSize: '0.75rem', fontWeight: 600, color: '#0b1c30', 
                              background: '#fff', border: '1px solid #cbd5e1', 
                              borderRadius: '0.5rem', padding: '0.25rem 0.5rem', outline: 'none', cursor: 'pointer'
                            }}
                          >
                            <option value="">Unassigned</option>
                            {board.members?.map(member => (
                              <option key={member.user.id} value={member.user.id}>
                                {member.user.name || member.user.email}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Cards within List */}
                      <div style={{ padding: '0.75rem' }}>
                        {list.cards.length === 0 ? (
                          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary)', fontSize: '0.875rem' }}>
                            No tasks in this category.
                          </div>
                        ) : (
                          list.cards.map((card, idx) => (
                            <Link 
                              key={card.id} 
                              href={`/tasks/task-detailview?boardId=${boardId}&listId=${list.id}`} 
                              style={{ 
                                textDecoration: 'none', display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', 
                                marginBottom: idx !== list.cards.length - 1 ? '0.5rem' : '0',
                                background: card.isComplete ? '#f0fdf4' : '#ffffffff', borderRadius: '0.75rem',
                                border: card.isComplete ? '1px solid #bbf7d0' : '1px solid #15202fff',
                                transition: 'all 0.2s', cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(11,28,48,0.02)',
                                opacity: card.isComplete ? 0.8 : 1
                              }}
                              onMouseEnter={e => { 
                                (e.currentTarget as HTMLElement).style.background = card.isComplete ? '#dcfce7' : '#f8fafc';
                                (e.currentTarget as HTMLElement).style.transform = 'translateX(2px)';
                              }}
                              onMouseLeave={e => { 
                                (e.currentTarget as HTMLElement).style.background = card.isComplete ? '#f0fdf4' : '#fff';
                                (e.currentTarget as HTMLElement).style.transform = 'none';
                              }}
                            >
                              <div style={{ flex: 3, display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                {/* Checkbox / Status Indicator */}
                                <div style={{ marginTop: '0.125rem', width: '1.25rem', height: '1.25rem', borderRadius: '50%', border: card.isComplete ? '2px solid #16a34a' : '2px solid #cbd5e1', background: card.isComplete ? '#16a34a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  {card.isComplete && <svg width="10" height="10" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                
                                <div>
                                  <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: card.isComplete ? '#94a3b8' : '#0b1c30', marginBottom: '0.375rem', lineHeight: 1.3, textDecoration: card.isComplete ? 'line-through' : 'none' }}>
                                    {card.title}
                                  </div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                                    {card.labels && card.labels.length > 0 ? (
                                      card.labels.map((lbl, i) => {
                                        const style = getLabelStyle(lbl);
                                        return (
                                          <span key={i} style={{ fontSize: '0.625rem', fontWeight: 700, padding: '0.1875rem 0.625rem', borderRadius: '9999px', background: style.bg, color: style.text, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                            {lbl}
                                          </span>
                                        );
                                      })
                                    ) : (
                                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No tags available</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: card.dueDate ? '#334155' : 'var(--secondary)' }}>
                                  {card.dueDate ? new Date(card.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date set'}
                                </span>
                              </div>

                              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
                                <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', background: 'linear-gradient(135deg, #0b1c30, #1e3a8a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.625rem', fontWeight: 700 }}>
                                  {card.title[0]?.toUpperCase() || 'T'}
                                </div>
                                <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', transition: 'background 0.2s' }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"/></svg>
                                </div>
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '4rem', textAlign: 'center', background: '#fff', borderRadius: '1rem', border: '1px dashed var(--surface-container)' }}>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>No lists found</p>
                    <p style={{ color: 'var(--secondary)' }}>This project does not have any categorized lists yet.</p>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
