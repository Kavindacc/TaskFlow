'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';

// ── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(name?: string, email?: string) {
  if (name) return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  if (email) return email[0].toUpperCase();
  return '?';
}

const AVATAR_COLORS = [
  '#0369a1', '#7c3aed', '#0f766e', '#b45309', '#be185d',
  '#1d4ed8', '#15803d', '#b91c1c', '#6d28d9', '#0e7490',
];
function avatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface Member { user: { id: string; name?: string; email: string }; role: string; }
interface Board  { id: string; title: string; members: Member[]; ownerId: string; }

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '160px' }}>
      <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0b1c30', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginTop: '0.25rem' }}>{label}</div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TeamManagementPage() {
  const { user, token } = useAuth();

  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await api.boards.getAll(token);
        const list: Board[] = data.boards || data || [];
        setBoards(list);
        if (list.length > 0) setSelectedBoardId(list[0].id);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [token]);

  const selectedBoard = boards.find(b => b.id === selectedBoardId);

  // Aggregate all unique members across all boards
  const allMembersMap = new Map<string, { user: { id: string; name?: string; email: string }; role: string; boards: string[] }>();
  boards.forEach(board => {
    board.members?.forEach(m => {
      if (allMembersMap.has(m.user.id)) {
        allMembersMap.get(m.user.id)!.boards.push(board.title);
      } else {
        allMembersMap.set(m.user.id, { ...m, boards: [board.title] });
      }
    });
  });
  const allMembers = Array.from(allMembersMap.values());

  const displayMembers = (selectedBoardId ? selectedBoard?.members ?? [] : allMembers)
    .filter(m => {
      const q = searchQuery.toLowerCase();
      return !q || m.user.name?.toLowerCase().includes(q) || m.user.email.toLowerCase().includes(q);
    });

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !token || !selectedBoardId) return;
    setInviting(true); setInviteError(''); setInviteSuccess('');
    try {
      await api.boards.inviteMember(token, selectedBoardId, inviteEmail.trim());
      setInviteSuccess(`${inviteEmail} invited successfully!`);
      setInviteEmail('');
      const data = await api.boards.getAll(token);
      setBoards(data.boards || data || []);
    } catch (e: any) {
      setInviteError(e.message || 'Failed to invite member');
    } finally { setInviting(false); }
  };

  const handleRemove = async (userId: string) => {
    if (!token || !selectedBoardId) return;
    setRemovingId(userId);
    try {
      await api.boards.removeMember(token, selectedBoardId, userId);
      setBoards(prev => prev.map(b => b.id === selectedBoardId
        ? {...b, members: b.members.filter(m => m.user.id !== userId) }
        : b));
    } catch (e) { console.error(e); }
    finally { setRemovingId(null); }
  };

  const isOwner = selectedBoard?.ownerId === user?.id;
  const totalTasks = boards.reduce((a, b) => a + (b.members?.length ?? 0), 0);

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8f9ff', fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Top bar */}
        <header style={{ height: '64px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', background: '#fff', borderBottom: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)' }}>
            Architect Workspace
          </p>
          <div style={{ position: 'relative', width: '320px' }}>
            <svg style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text" placeholder="Search members..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.375rem', borderRadius: '0.625rem', border: 'none', background: '#f1f5f9', fontSize: '0.875rem', color: '#0b1c30', outline: 'none' }}
            />
          </div>
          <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: avatarColor(user?.id || 'u'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
            {getInitials(user?.name, user?.email)}
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.5rem' }}>

          {/* Page header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: '#0b1c30', letterSpacing: '-0.03em', marginBottom: '0.375rem' }}>Team Management</h1>
            <p style={{ fontSize: '0.9375rem', color: '#64748b' }}>Manage members and collaborators across your boards.</p>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <StatCard label="Total Members" value={allMembers.length} color="#0369a1" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>} />
            <StatCard label="Boards" value={boards.length} color="#7c3aed" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>} />
            <StatCard label="Memberships" value={totalTasks} color="#0f766e" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>} />
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* Left — Board selector + Invite */}
            <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Board selector */}
              <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
                <h4 style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.1em', marginBottom: '0.875rem' }}>SELECT BOARD</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <button
                    onClick={() => setSelectedBoardId('')}
                    style={{ width: '100%', textAlign: 'left', padding: '0.625rem 0.875rem', borderRadius: '0.625rem', border: 'none', background: selectedBoardId === '' ? '#eff6ff' : 'transparent', color: selectedBoardId === '' ? '#0036ad' : '#475569', fontWeight: selectedBoardId === '' ? 700 : 500, fontSize: '0.875rem', cursor: 'pointer', transition: 'background 0.15s' }}
                  >
                    All Boards
                  </button>
                  {boards.map(board => (
                    <button
                      key={board.id}
                      onClick={() => setSelectedBoardId(board.id)}
                      style={{ width: '100%', textAlign: 'left', padding: '0.625rem 0.875rem', borderRadius: '0.625rem', border: 'none', background: selectedBoardId === board.id ? '#eff6ff' : 'transparent', color: selectedBoardId === board.id ? '#0036ad' : '#475569', fontWeight: selectedBoardId === board.id ? 700 : 500, fontSize: '0.875rem', cursor: 'pointer', transition: 'background 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>{board.title}</span>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '9999px', background: selectedBoardId === board.id ? '#dbeafe' : '#f1f5f9', color: selectedBoardId === board.id ? '#1d4ed8' : '#94a3b8', flexShrink: 0, marginLeft: '0.5rem' }}>{board.members?.length ?? 0}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Invite card */}
              {selectedBoardId && (
                <div style={{ background: 'linear-gradient(135deg, #0036ad, #1b4dd7)', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,54,173,0.25)' }}>
                  <h4 style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', marginBottom: '0.875rem' }}>INVITE TO BOARD</h4>
                  <input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={e => { setInviteEmail(e.target.value); setInviteError(''); setInviteSuccess(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleInvite()}
                    style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.625rem', border: '1.5px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.875rem', outline: 'none', marginBottom: '0.75rem', boxSizing: 'border-box' }}
                  />
                  {inviteError && <p style={{ fontSize: '0.75rem', color: '#fca5a5', marginBottom: '0.5rem' }}>{inviteError}</p>}
                  {inviteSuccess && <p style={{ fontSize: '0.75rem', color: '#86efac', marginBottom: '0.5rem' }}>{inviteSuccess}</p>}
                  <button
                    onClick={handleInvite}
                    disabled={inviting || !inviteEmail.trim()}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: '0.625rem', border: 'none', background: '#fff', color: '#0036ad', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', opacity: (inviting || !inviteEmail.trim()) ? 0.5 : 1, transition: 'opacity 0.2s' }}
                  >
                    {inviting ? 'Inviting…' : 'Send Invite'}
                  </button>
                  {!isOwner && <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.625rem', textAlign: 'center' }}>Only the board owner can remove members.</p>}
                </div>
              )}
            </div>

            {/* Right — Members grid */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1c30' }}>
                  {selectedBoardId ? `${selectedBoard?.title} — Members` : 'All Members'}
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '9999px', background: '#dbeafe', color: '#1d4ed8' }}>{displayMembers.length}</span>
                </h3>
              </div>

              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                  <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#0036ad', animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : displayMembers.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '1rem', padding: '3rem', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ marginBottom: '1rem' }}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                  <p style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.9375rem' }}>No members found</p>
                  <p style={{ color: '#cbd5e1', fontSize: '0.8125rem', marginTop: '0.25rem' }}>Invite someone to get started</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {displayMembers.map(m => {
                    const isMe = m.user.id === user?.id;
                    const isCurrentOwner = selectedBoard?.ownerId === m.user.id;
                    const bg = avatarColor(m.user.id);
                    const memberBoards = (allMembersMap.get(m.user.id)?.boards ?? [selectedBoard?.title ?? '']).filter(Boolean);
                    return (
                      <div key={m.user.id} style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s, transform 0.2s', position: 'relative', overflow: 'hidden' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
                      >
                        {/* Accent bar */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: bg }} />

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                          {/* Avatar */}
                          <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1rem', fontWeight: 700, flexShrink: 0 }}>
                            {getInitials(m.user.name, m.user.email)}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0b1c30', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                                {m.user.name || m.user.email.split('@')[0]}
                              </span>
                              {isMe && <span style={{ fontSize: '0.625rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '9999px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>YOU</span>}
                              {isCurrentOwner && <span style={{ fontSize: '0.625rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '9999px', background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>OWNER</span>}
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.user.email}</p>

                            {/* Role badge */}
                            <span style={{ display: 'inline-block', marginTop: '0.625rem', fontSize: '0.625rem', fontWeight: 700, padding: '0.1875rem 0.625rem', borderRadius: '9999px', background: '#eff6ff', color: '#0036ad', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                              {m.role}
                            </span>
                          </div>
                        </div>

                        {/* Boards list */}
                        {!selectedBoardId && memberBoards.length > 0 && (
                          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f8fafc' }}>
                            <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>BOARDS</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                              {memberBoards.slice(0, 3).map(bname => (
                                <span key={bname} style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '0.125rem 0.5rem', borderRadius: '9999px', background: '#f1f5f9', color: '#475569' }}>{bname}</span>
                              ))}
                              {memberBoards.length > 3 && <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '0.125rem 0.5rem', borderRadius: '9999px', background: '#f1f5f9', color: '#94a3b8' }}>+{memberBoards.length - 3}</span>}
                            </div>
                          </div>
                        )}

                        {/* Remove button */}
                        {selectedBoardId && isOwner && !isCurrentOwner && (
                          <button
                            onClick={() => handleRemove(m.user.id)}
                            disabled={removingId === m.user.id}
                            style={{ marginTop: '1rem', width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #fecaca', background: '#fff5f5', color: '#ef4444', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', opacity: removingId === m.user.id ? 0.6 : 1, transition: 'all 0.15s' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#fee2e2')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#fff5f5')}
                          >
                            {removingId === m.user.id ? 'Removing…' : 'Remove from Board'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
