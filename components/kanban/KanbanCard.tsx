'use client';

import { Card } from '@/types/board';
import { Draggable } from '@hello-pangea/dnd';

interface KanbanCardProps {
  card: Card;
  index: number;
  onClick: (card: Card) => void;
}

export default function KanbanCard({ card, index, onClick }: KanbanCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dateString: string | null) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(card)}
          className={`bg-white rounded-lg p-3 mb-2 shadow-sm border border-gray-200 cursor-pointer transition-all hover:shadow-md ${
            snapshot.isDragging ? 'shadow-lg rotate-2' : ''
          }`}
        >
          {/* Card Title */}
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            {card.title}
          </h4>

          {/* Labels */}
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {card.labels.map((label, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700"
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Due Date */}
          {card.dueDate && (
            <div className="flex items-center gap-1 text-xs">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span
                className={
                  isOverdue(card.dueDate)
                    ? 'text-red-600 font-medium'
                    : 'text-gray-600'
                }
              >
                {formatDate(card.dueDate)}
              </span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
