'use client';

import { Card } from '@/types/board';
import { Draggable } from '@hello-pangea/dnd';

interface KanbanCardProps {
  card: Card;
  index: number;
  onClick: (card: Card) => void;
}

// Label chip colors by keyword
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

export default function KanbanCard({ card, index, onClick }: KanbanCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const isToday = date.toDateString() === new Date().toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = card.dueDate ? new Date(card.dueDate) < new Date() : false;

  // Get avatar initials from title (simulated assignee)
  const avatarLetter = card.title[0]?.toUpperCase() || '?';
  const avatarColors = ['#0036ad', '#7c3aed', '#2d6a4f', '#b45309', '#be123c'];
  const avatarColor = avatarColors[card.title.charCodeAt(0) % avatarColors.length];

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(card)}
          style={{
            ...provided.draggableProps.style,
            background: '#ffffff',
            borderRadius: '0.875rem',
            padding: '1rem',
            marginBottom: '0.625rem',
            boxShadow: snapshot.isDragging
              ? '0 16px 40px rgba(11,28,48,0.14)'
              : '0 2px 8px rgba(11,28,48,0.05)',
            border: snapshot.isDragging
              ? '2px solid rgba(0,54,173,0.2)'
              : '2px solid transparent',
            cursor: 'grab',
            transition: 'box-shadow 0.2s, border 0.2s',
            transform: snapshot.isDragging
              ? `${provided.draggableProps.style?.transform} rotate(2deg)`
              : provided.draggableProps.style?.transform,
          }}
          onMouseEnter={e => {
            if (!snapshot.isDragging) {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(11,28,48,0.1)';
              (e.currentTarget as HTMLElement).style.border = '2px solid rgba(0,54,173,0.12)';
            }
          }}
          onMouseLeave={e => {
            if (!snapshot.isDragging) {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(11,28,48,0.05)';
              (e.currentTarget as HTMLElement).style.border = '2px solid transparent';
            }
          }}
        >
          {/* Labels */}
          {card.labels && card.labels.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.625rem' }}>
              {card.labels.slice(0, 3).map((label, idx) => {
                const style = getLabelStyle(label);
                return (
                  <span key={idx} style={{
                    fontSize: '0.625rem', fontWeight: 700,
                    padding: '0.1875rem 0.5rem', borderRadius: '9999px',
                    background: style.bg, color: style.text,
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                  }}>{label}</span>
                );
              })}
            </div>
          )}

          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '1rem', height: '1rem', borderRadius: '0.25rem', marginTop: '0.125rem', flexShrink: 0,
              background: card.isComplete ? '#0036ad' : 'transparent',
              border: card.isComplete ? 'none' : '2px solid #cbd5e1',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {card.isComplete && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
            </div>
            <p style={{
              fontSize: '0.875rem', fontWeight: 600, color: card.isComplete ? '#94a3b8' : 'var(--on-surface)',
              lineHeight: 1.45,
              textDecoration: card.isComplete || (card.dueDate && isOverdue) ? 'line-through' : 'none',
              opacity: card.isComplete || (card.dueDate && isOverdue) ? 0.6 : 1,
            }}>
              {card.title}
            </p>
          </div>

          {/* Description preview */}
          {card.description && (
            <p style={{
              fontSize: '0.75rem', color: 'var(--secondary)', lineHeight: 1.55,
              marginBottom: '0.75rem', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {card.description}
            </p>
          )}

          {/* Footer — avatar + due date */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            {/* Avatar */}
            <div style={{
              width: '1.625rem', height: '1.625rem', borderRadius: '50%',
              background: avatarColor, color: '#fff',
              fontSize: '0.6rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{avatarLetter}</div>

            {/* Due date */}
            {card.dueDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isOverdue ? '#ba1a1a' : 'var(--secondary)'} strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span style={{
                  fontSize: '0.6875rem', fontWeight: 600,
                  color: isOverdue ? '#ba1a1a' : 'var(--secondary)',
                }}>
                  {formatDate(card.dueDate)}
                </span>
              </div>
            )}

            {/* Done badge in overdue */}
            {isOverdue && (
              <span style={{
                fontSize: '0.5625rem', fontWeight: 700, padding: '0.125rem 0.375rem',
                borderRadius: '9999px', background: '#ffdad6', color: '#ba1a1a',
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>OVERDUE</span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
