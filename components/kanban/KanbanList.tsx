'use client';

import { useState } from 'react';
import { List, Card } from '@/types/board';
import { Droppable, DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import KanbanCard from './KanbanCard';

interface KanbanListProps {
  list: List;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  onAddCard: (listId: string) => void;
  onCardClick: (card: Card) => void;
  onDeleteList: (listId: string) => void;
  onUpdateListTitle: (listId: string, title: string) => void;
}

// Column accent color based on title keywords
function getColumnAccent(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('done') || t.includes('complete') || t.includes('success')) return '#2d6a4f';
  if (t.includes('progress') || t.includes('doing') || t.includes('review')) return '#0036ad';
  if (t.includes('backlog')) return '#515f74';
  if (t.includes('urgent') || t.includes('block')) return '#ba1a1a';
  return '#7c3aed';
}

export default function KanbanList({
  list,
  dragHandleProps,
  onAddCard,
  onCardClick,
  onDeleteList,
  onUpdateListTitle,
}: KanbanListProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);

  const accent = getColumnAccent(list.title);

  const handleTitleSubmit = () => {
    if (title.trim() && title !== list.title) {
      onUpdateListTitle(list.id, title.trim());
    } else {
      setTitle(list.title);
    }
    setIsEditingTitle(false);
  };

  return (
    <div style={{
      flexShrink: 0,
      width: '288px',
      background: 'var(--surface-container-low)',
      borderRadius: '1rem',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: 'calc(100vh - 180px)',
    }}>
      {/* ── Column Header ── */}
      <div
        {...dragHandleProps}
        style={{
          padding: '1rem 1rem 0.75rem',
          cursor: dragHandleProps ? 'grab' : 'default',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
            {/* Accent dot */}
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: accent, flexShrink: 0 }} />

            {/* Editable title */}
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleTitleSubmit();
                  if (e.key === 'Escape') { setTitle(list.title); setIsEditingTitle(false); }
                }}
                autoFocus
                style={{
                  flex: 1, fontSize: '0.75rem', fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: 'var(--on-surface)', background: '#fff',
                  border: 'none', outline: 'none', borderRadius: '0.375rem',
                  padding: '0.25rem 0.5rem',
                  boxShadow: '0 0 0 2px rgba(0,54,173,0.2)',
                  fontFamily: "'Inter', sans-serif",
                }}
              />
            ) : (
              <h3
                onClick={() => setIsEditingTitle(true)}
                style={{
                  fontSize: '0.75rem', fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: 'var(--on-surface-variant)',
                  cursor: 'pointer', flex: 1,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
              >
                {list.title}
              </h3>
            )}

            {/* Card count badge */}
            <span style={{
              fontSize: '0.6875rem', fontWeight: 700,
              padding: '0.125rem 0.5rem', borderRadius: '9999px',
              background: '#fff', color: 'var(--secondary)',
              flexShrink: 0,
            }}>{list.cards.length}</span>
          </div>

          {/* Kebab menu */}
          <div style={{ position: 'relative', marginLeft: '0.5rem' }}>
            <button
              onClick={() => setShowMenu(v => !v)}
              style={{
                width: '1.75rem', height: '1.75rem', borderRadius: '0.375rem',
                border: 'none', background: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--secondary)', transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-container)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
            {showMenu && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setShowMenu(false)} />
                <div style={{
                  position: 'absolute', top: '100%', right: 0, zIndex: 20,
                  background: '#fff', borderRadius: '0.75rem',
                  boxShadow: '0 8px 32px rgba(11,28,48,0.12)',
                  minWidth: '140px', padding: '0.375rem',
                }}>
                  <button
                    onClick={() => { setIsEditingTitle(true); setShowMenu(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                      border: 'none', background: 'none', cursor: 'pointer',
                      fontSize: '0.8125rem', fontWeight: 500, color: 'var(--on-surface)',
                      fontFamily: "'Inter', sans-serif", textAlign: 'left',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-container-low)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    Rename
                  </button>
                  <button
                    onClick={() => { onDeleteList(list.id); setShowMenu(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                      border: 'none', background: 'none', cursor: 'pointer',
                      fontSize: '0.8125rem', fontWeight: 500, color: 'var(--error)',
                      fontFamily: "'Inter', sans-serif", textAlign: 'left',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--error-container)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                    Delete List
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Cards Droppable ── */}
      <Droppable droppableId={list.id} type="card">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0 0.75rem',
              minHeight: '80px',
              borderRadius: '0 0 0.5rem 0.5rem',
              background: snapshot.isDraggingOver
                ? 'rgba(0,54,173,0.04)'
                : 'transparent',
              transition: 'background 0.2s',
            }}
          >
            {list.cards.map((card, index) => (
              <KanbanCard
                key={card.id}
                card={card}
                index={index}
                onClick={onCardClick}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* ── Add Task dashed button ── */}
      <div style={{ padding: '0.625rem 0.75rem 0.875rem' }}>
        <button
          onClick={() => onAddCard(list.id)}
          style={{
            width: '100%', padding: '0.625rem',
            borderRadius: '0.625rem',
            border: '1.5px dashed rgba(0,54,173,0.2)',
            background: 'transparent',
            color: 'var(--secondary)',
            fontSize: '0.8125rem', fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = '#fff';
            (e.currentTarget as HTMLElement).style.color = 'var(--primary)';
            (e.currentTarget as HTMLElement).style.border = '1.5px dashed var(--primary)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--secondary)';
            (e.currentTarget as HTMLElement).style.border = '1.5px dashed rgba(0,54,173,0.2)';
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Task
        </button>
      </div>
    </div>
  );
}
