'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Board, Card } from '@/types/board';
import KanbanList from '@/components/kanban/KanbanList';
import AddListButton from '@/components/kanban/AddListButton';
import CreateCardModal from '@/components/kanban/CreateCardModal';
import CardDetailModal from '@/components/kanban/CardDetailModal';
import ManageMembersModal from '@/components/mytasks/ManageMembersModal';
import { useBoardSocket } from '@/hooks/useBoardSocket';
import Sidebar from '@/components/layout/Sidebar';

// ── Toast helper ──────────────────────────────────────────────────────────────
function showToast(message: string, type: 'success' | 'error') {
  const existing = document.getElementById('tf-toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.id = 'tf-toast';
  Object.assign(el.style, {
    position: 'fixed', top: '1.25rem', right: '1.5rem', zIndex: '9999',
    padding: '0.75rem 1.25rem', borderRadius: '0.75rem',
    background: type === 'success' ? '#2d6a4f' : '#ba1a1a',
    color: '#fff', fontSize: '0.875rem', fontWeight: '600',
    boxShadow: '0 8px 24px rgba(11,28,48,0.18)',
    fontFamily: "'Inter', sans-serif",
    animation: 'slide-in 0.3s ease-out',
  });
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

export default function BoardPage() {
  const { token, isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const boardId = params.id as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateCardModal, setShowCreateCardModal] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [selectedListTitle, setSelectedListTitle] = useState<string>('');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  const isOwner = board?.ownerId === user?.id;

  useBoardSocket({ boardId, board, setBoard, selectedCard, setSelectedCard });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/sign-in');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (token && boardId) fetchBoard();
  }, [token, boardId]);

  const fetchBoard = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await api.boards.getById(token, boardId);
      setBoard(data);
    } catch {
      showToast('Failed to load board', 'error');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // ── List handlers ───────────────────────────────────────────────────────────
  const handleCreateList = async (title: string) => {
    if (!token || !board) return;
    try {
      const response = await api.lists.create(token, board.id, title);
      setBoard({ ...board, lists: [...(board.lists || []), { ...response.list, cards: [] }] });
      showToast('List created!', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to create list', 'error');
      throw e;
    }
  };

  const handleUpdateListTitle = async (listId: string, title: string) => {
    if (!token || !board) return;
    try {
      await api.lists.update(token, listId, title);
      setBoard({ ...board, lists: board.lists?.map(l => l.id === listId ? { ...l, title } : l) });
    } catch (e: any) { showToast(e.message || 'Failed to update list', 'error'); }
  };

  const handleDeleteList = async (listId: string) => {
    if (!token || !board) return;
    if (!confirm('Delete this list and all its cards?')) return;
    try {
      await api.lists.delete(token, listId);
      setBoard({ ...board, lists: board.lists?.filter(l => l.id !== listId) });
      showToast('List deleted', 'success');
    } catch (e: any) { showToast(e.message || 'Failed to delete list', 'error'); }
  };

  // ── Card handlers ───────────────────────────────────────────────────────────
  const handleAddCard = (listId: string) => {
    const list = board?.lists?.find(l => l.id === listId);
    if (list) { setSelectedListId(listId); setSelectedListTitle(list.title); setShowCreateCardModal(true); }
  };

  const handleCreateCard = async (listId: string, title: string) => {
    if (!token || !board) return;
    try {
      const response = await api.cards.create(token, listId, title);
      setBoard({ ...board, lists: board.lists?.map(l => l.id === listId ? { ...l, cards: [...l.cards, response.card] } : l) });
      showToast('Task created!', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to create card', 'error');
      throw e;
    }
  };

  const handleUpdateCard = async (cardId: string, data: Partial<Card>) => {
    if (!token || !board) return;
    try {
      const response = await api.cards.update(token, cardId, {
        title: data.title, description: data.description ?? undefined,
        labels: data.labels, dueDate: data.dueDate ?? null,
        isComplete: data.isComplete, assigneeId: data.assigneeId,
      });
      setBoard({ ...board, lists: board.lists?.map(l => ({ ...l, cards: l.cards.map(c => c.id === cardId ? { ...c, ...response.card } : c) })) });
      showToast('Task updated!', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to update card', 'error');
      throw e;
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!token || !board) return;
    try {
      await api.cards.delete(token, cardId);
      setBoard({ ...board, lists: board.lists?.map(l => ({ ...l, cards: l.cards.filter(c => c.id !== cardId) })) });
      showToast('Task deleted', 'success');
    } catch (e: any) { showToast(e.message || 'Failed to delete card', 'error'); throw e; }
  };

  const handleInviteMember = async (email: string) => {
    if (!token || !board) return;
    const response = await api.boards.inviteMember(token, board.id, email);
    setBoard({ ...board, members: [...board.members, response.member] });
  };

  const handleRemoveMember = async (userId: string) => {
    if (!token || !board) return;
    await api.boards.removeMember(token, board.id, userId);
    setBoard({ ...board, members: board.members.filter(m => m.user.id !== userId) });
  };

  // ── Drag & Drop ─────────────────────────────────────────────────────────────
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, type } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    if (type === 'list') await handleListDrag(result);
    else if (type === 'card') await handleCardDrag(result);
  };

  const handleListDrag = async (result: DropResult) => {
    if (!token || !board || !result.destination) return;
    const newLists = Array.from(board.lists || []);
    const [moved] = newLists.splice(result.source.index, 1);
    newLists.splice(result.destination.index, 0, moved);
    const reordered = newLists.map((l, i) => ({ ...l, order: i }));
    setBoard({ ...board, lists: reordered });
    try {
      await api.lists.reorder(token, reordered.map(({ id, order }) => ({ id, order })));
    } catch { fetchBoard(); showToast('Failed to reorder lists', 'error'); }
  };

  const handleCardDrag = async (result: DropResult) => {
    if (!token || !board || !result.destination) return;
    const { source, destination, draggableId } = result;
    const newLists = Array.from(board.lists || []);
    const srcList = newLists.find(l => l.id === source.droppableId);
    const dstList = newLists.find(l => l.id === destination.droppableId);
    if (!srcList || !dstList) return;
    const [movedCard] = srcList.cards.splice(source.index, 1);
    dstList.cards.splice(destination.index, 0, movedCard);
    setBoard({ ...board, lists: newLists });
    try {
      await api.cards.move(token, draggableId, destination.droppableId, destination.index);
    } catch { fetchBoard(); showToast('Failed to move card', 'error'); }
  };

  // ── Quick create board ──────────────────────────────────────────────────────
  const handleCreateNewBoard = async () => {
    if (!token || !newBoardTitle.trim()) return;
    try {
      const res = await api.boards.create(token, newBoardTitle.trim());
      const newBoard = res.board || res;
      setShowCreateBoard(false);
      setNewBoardTitle('');
      router.push(`/boards/${newBoard.id}`);
    } catch (e: any) { showToast(e.message || 'Failed to create board', 'error'); }
  };

  // ── Loading / Error states ───────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)', fontFamily: "'Inter', sans-serif" }}>
        <Sidebar onNewBoard={() => setShowCreateBoard(true)} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '3px solid var(--surface-container)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)', fontFamily: "'Inter', sans-serif" }}>
        <Sidebar onNewBoard={() => setShowCreateBoard(true)} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--on-surface)' }}>Board not found</p>
          <Link href="/dashboard" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const totalCards = board.lists?.reduce((acc, l) => acc + l.cards.length, 0) ?? 0;

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--surface)', fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <Sidebar onNewBoard={() => setShowCreateBoard(true)} />

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* ── Top bar ─────────────────────────────────────────────────── */}
        <header style={{
          height: '64px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 2rem',
          background: 'var(--surface-container-lowest)',
          boxShadow: '0 1px 0 0 var(--surface-container)',
        }}>
          {/* Left — workspace label */}
          <p style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)' }}>
            TASKFLOW WORKSPACE
          </p>

          {/* Center — search */}
          <div style={{ position: 'relative', maxWidth: '300px', flex: 1, margin: '0 2rem' }}>
            <svg style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text" placeholder="Search tasks..."
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <button style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', border: 'none', background: 'var(--surface-container-low)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
            </button>
            <button style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', border: 'none', background: 'var(--surface-container-low)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
            </button>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: 'linear-gradient(135deg, #0036ad, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* ── Board header ─────────────────────────────────────────────── */}
        <div style={{
          padding: '1.25rem 2rem 0',
          background: 'var(--surface-container-lowest)',
          flexShrink: 0,
        }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
            <Link href="/dashboard" style={{ fontSize: '0.8125rem', color: 'var(--secondary)', textDecoration: 'none' }}>Projects</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface)', fontWeight: 500 }}>{board.title}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--on-surface)', letterSpacing: '-0.03em' }}>
              Project Board
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Member avatars */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {board.members.slice(0, 4).map((m, i) => (
                  <div key={m.id} title={m.user.name || m.user.email} style={{
                    width: '2rem', height: '2rem', borderRadius: '50%',
                    background: ['#0036ad','#7c3aed','#2d6a4f','#b45309'][i % 4],
                    border: '2px solid #fff',
                    marginLeft: i === 0 ? 0 : '-0.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '0.6875rem', fontWeight: 700, zIndex: 4 - i,
                  }}>
                    {(m.user.name || m.user.email)[0].toUpperCase()}
                  </div>
                ))}
                {board.members.length > 4 && (
                  <div style={{
                    width: '2rem', height: '2rem', borderRadius: '50%',
                    background: 'var(--surface-container)', border: '2px solid #fff',
                    marginLeft: '-0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6875rem', fontWeight: 700, color: 'var(--secondary)',
                  }}>+{board.members.length - 4}</div>
                )}
              </div>

              {/* Stats chips */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'var(--surface-container-low)', color: 'var(--secondary)' }}>
                  {totalCards} tasks
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'var(--surface-container-low)', color: 'var(--secondary)' }}>
                  {board.lists?.length || 0} lists
                </span>
              </div>

              {/* Filters */}
              <button style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.5rem 0.875rem', borderRadius: '0.5rem', border: 'none',
                background: 'var(--surface-container-low)', cursor: 'pointer',
                fontSize: '0.8125rem', fontWeight: 600, color: 'var(--secondary)',
                fontFamily: "'Inter', sans-serif",
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></svg>
                Filters
              </button>

              {/* Manage Members */}
              <button
                onClick={() => setShowMembersModal(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.5rem 0.875rem', borderRadius: '0.5rem', border: 'none',
                  background: 'linear-gradient(135deg, #0036ad, #1b4dd7)', cursor: 'pointer',
                  fontSize: '0.8125rem', fontWeight: 700, color: '#fff',
                  fontFamily: "'Inter', sans-serif",
                  boxShadow: '0 4px 12px rgba(0,54,173,0.25)',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
                {isOwner ? 'Manage Members' : 'Members'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Kanban Board ─────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowX: 'auto', padding: '1.5rem 2rem', minHeight: 0 }}>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="board" type="list" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', minWidth: 'max-content', height: '100%' }}
                >
                  {board.lists && board.lists.length > 0 ? (
                    board.lists.map((list, index) => (
                      <Draggable key={list.id} draggableId={list.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{
                              ...provided.draggableProps.style,
                              transition: snapshot.isDragging ? 'none' : 'transform 0.2s',
                              opacity: snapshot.isDragging ? 0.95 : 1,
                              transform: snapshot.isDragging
                                ? `${provided.draggableProps.style?.transform} rotate(1.5deg)`
                                : provided.draggableProps.style?.transform,
                            }}
                          >
                            <KanbanList
                              list={list}
                              dragHandleProps={provided.dragHandleProps}
                              onAddCard={handleAddCard}
                              onCardClick={setSelectedCard}
                              onDeleteList={handleDeleteList}
                              onUpdateListTitle={handleUpdateListTitle}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <div style={{
                      width: '288px', borderRadius: '1rem', padding: '2rem',
                      background: 'var(--surface-container-low)', textAlign: 'center',
                    }}>
                      <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📋</p>
                      <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.375rem' }}>No lists yet</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--secondary)' }}>Add your first list to get started</p>
                    </div>
                  )}

                  <AddListButton onCreateList={handleCreateList} />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <CreateCardModal
        isOpen={showCreateCardModal}
        listId={selectedListId}
        listTitle={selectedListTitle}
        onClose={() => setShowCreateCardModal(false)}
        onCreate={handleCreateCard}
      />

      <CardDetailModal
        card={selectedCard}
        isOpen={!!selectedCard}
        members={board?.members ?? []}
        onClose={() => setSelectedCard(null)}
        onUpdate={handleUpdateCard}
        onDelete={handleDeleteCard}
      />

      {board && (
        <ManageMembersModal
          board={board}
          isOpen={showMembersModal}
          isOwner={isOwner}
          onClose={() => setShowMembersModal(false)}
          onInvite={handleInviteMember}
          onRemove={handleRemoveMember}
        />
      )}

      {/* Quick Create Board Modal */}
      {showCreateBoard && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,28,48,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowCreateBoard(false)} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: '1.25rem', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 24px 64px rgba(11,28,48,0.15)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '1.5rem' }}>Create New Board</h2>
            <input
              type="text" value={newBoardTitle} onChange={e => setNewBoardTitle(e.target.value)}
              placeholder="e.g. Product Roadmap"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleCreateNewBoard()}
              style={{
                width: '100%', padding: '0.875rem 1rem', borderRadius: '0.625rem',
                border: 'none', background: 'var(--surface-container-low)',
                fontSize: '0.9375rem', color: 'var(--on-surface)',
                fontFamily: "'Inter', sans-serif", outline: 'none', marginBottom: '1rem',
                boxShadow: '0 0 0 2px rgba(0,54,173,0.15)',
              }}
            />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setShowCreateBoard(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.625rem', border: 'none', background: 'var(--surface-container-low)', color: 'var(--secondary)', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreateNewBoard} disabled={!newBoardTitle.trim()} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.625rem', border: 'none', background: 'linear-gradient(135deg, #0036ad, #1b4dd7)', color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 700, cursor: !newBoardTitle.trim() ? 'not-allowed' : 'pointer', opacity: !newBoardTitle.trim() ? 0.6 : 1 }}>Create Board</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
