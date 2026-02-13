'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Board, List, Card } from '@/types/board';
import KanbanList from '@/components/kanban/KanbanList';
import AddListButton from '@/components/kanban/AddListButton';
import CreateCardModal from '@/components/kanban/CreateCardModal';

export default function BoardPage() {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const boardId = params.id as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateCardModal, setShowCreateCardModal] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [selectedListTitle, setSelectedListTitle] = useState<string>('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/sign-in');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch board data
  useEffect(() => {
    if (token && boardId) {
      fetchBoard();
    }
  }, [token, boardId]);

  const fetchBoard = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await api.boards.getById(token, boardId);
      setBoard(data);
    } catch (error) {
      console.error('Failed to fetch board:', error);
      showToast('Failed to load board', 'error');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (title: string) => {
    if (!token || !board) return;

    try {
      const response = await api.lists.create(token, board.id, title);
      setBoard({
        ...board,
        lists: [...(board.lists || []), { ...response.list, cards: [] }],
      });
      showToast('List created successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to create list', 'error');
      throw error;
    }
  };

  const handleUpdateListTitle = async (listId: string, title: string) => {
    if (!token || !board) return;

    try {
      await api.lists.update(token, listId, title);
      setBoard({
        ...board,
        lists: board.lists?.map((list) =>
          list.id === listId ? { ...list, title } : list
        ),
      });
      showToast('List updated successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update list', 'error');
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!token || !board) return;
    if (!confirm('Are you sure you want to delete this list? All cards will be deleted.')) return;

    try {
      await api.lists.delete(token, listId);
      setBoard({
        ...board,
        lists: board.lists?.filter((list) => list.id !== listId),
      });
      showToast('List deleted successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to delete list', 'error');
    }
  };

  const handleAddCard = (listId: string) => {
    const list = board?.lists?.find((l) => l.id === listId);
    if (list) {
      setSelectedListId(listId);
      setSelectedListTitle(list.title);
      setShowCreateCardModal(true);
    }
  };

  const handleCreateCard = async (listId: string, title: string) => {
    if (!token || !board) return;

    try {
      const response = await api.cards.create(token, listId, title);
      setBoard({
        ...board,
        lists: board.lists?.map((list) =>
          list.id === listId
            ? { ...list, cards: [...list.cards, response.card] }
            : list
        ),
      });
      showToast('Card created successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to create card', 'error');
      throw error;
    }
  };

  const handleCardClick = (card: Card) => {
    // TODO: Open card details modal
    console.log('Card clicked:', card);
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    // Dropped outside the list
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'card') {
      await handleCardDrag(result);
    }
  };

  const handleCardDrag = async (result: DropResult) => {
    if (!token || !board) return;

    const { destination, source, draggableId } = result;
    if (!destination) return;

    const sourceListId = source.droppableId;
    const destListId = destination.droppableId;

    // Create a copy of lists
    const newLists = Array.from(board.lists || []);
    const sourceList = newLists.find((l) => l.id === sourceListId);
    const destList = newLists.find((l) => l.id === destListId);

    if (!sourceList || !destList) return;

    // Remove card from source list
    const [movedCard] = sourceList.cards.splice(source.index, 1);

    // Add card to destination list
    destList.cards.splice(destination.index, 0, movedCard);

    // Update state optimistically
    setBoard({ ...board, lists: newLists });

    // Call API to persist the change
    try {
      await api.cards.move(token, draggableId, destListId, destination.index);
    } catch (error) {
      // Revert on error
      fetchBoard();
      showToast('Failed to move card', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Board not found</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:underline"
          >
            Go back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Back to dashboard"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{board.title}</h1>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div className="p-6 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="board" type="list" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex gap-4 pb-4"
              >
                {/* Lists */}
                {board.lists && board.lists.length > 0 ? (
                  board.lists.map((list) => (
                    <KanbanList
                      key={list.id}
                      list={list}
                      onAddCard={handleAddCard}
                      onCardClick={handleCardClick}
                      onDeleteList={handleDeleteList}
                      onUpdateListTitle={handleUpdateListTitle}
                    />
                  ))
                ) : (
                  <div className="flex-shrink-0 w-80 bg-white/50 rounded-lg p-8 text-center">
                    <p className="text-gray-600 mb-4">No lists yet</p>
                    <p className="text-sm text-gray-500">
                      Create your first list to get started!
                    </p>
                  </div>
                )}

                {/* Add List Button */}
                <AddListButton onCreateList={handleCreateList} />

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Create Card Modal */}
      <CreateCardModal
        isOpen={showCreateCardModal}
        listId={selectedListId}
        listTitle={selectedListTitle}
        onClose={() => setShowCreateCardModal(false)}
        onCreate={handleCreateCard}
      />
    </div>
  );
}
