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

  const handleTitleSubmit = () => {
    if (title.trim() && title !== list.title) {
      onUpdateListTitle(list.id, title.trim());
    } else {
      setTitle(list.title);
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setTitle(list.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="flex-shrink-0 w-80 bg-gray-100 rounded-lg p-4">
      {/* List Header */}
      <div className="flex items-center justify-between mb-3 group">
        {/* Drag handle — grip icon */}
        <div
          {...dragHandleProps}
          className="flex-shrink-0 p-1 mr-1 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing rounded transition-colors"
          title="Drag to reorder list"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </div>
        {isEditingTitle ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={handleKeyDown}
            className="flex-1 px-2 py-1 text-sm font-semibold bg-white border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <h3
            onClick={() => setIsEditingTitle(true)}
            className="flex-1 text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-200 px-2 py-1 rounded"
          >
            {list.title}
            <span className="ml-2 text-gray-500 font-normal">
              {list.cards.length}
            </span>
          </h3>
        )}

        {/* Delete List Button */}
        <button
          onClick={() => onDeleteList(list.id)}
          className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          aria-label="Delete list"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Cards Container - Droppable */}
      <Droppable droppableId={list.id} type="card">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[100px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50' : ''
            }`}
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

      {/* Add Card Button */}
      <button
        onClick={() => onAddCard(list.id)}
        className="w-full mt-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add a card
      </button>
    </div>
  );
}
