'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Board } from '@/types/board';
import BoardCard from '@/components/dashboard/BoardCard';
import CreateBoardModal from '@/components/dashboard/CreateBoardModal';
import EditBoardModal from '@/components/dashboard/EditBoardModal';
import DeleteConfirmModal from '@/components/dashboard/DeleteConfirmModal';

export default function DashboardPage() {
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [deletingBoard, setDeletingBoard] = useState<Board | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/sign-in');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch boards on mount
  useEffect(() => {
    if (token && isAuthenticated) {
      fetchBoards();
    }
  }, [token, isAuthenticated]);

  const fetchBoards = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await api.boards.getAll(token);
      setBoards(data);
    } catch (error) {
      console.error('Failed to fetch boards:', error);
      showToast('Failed to load boards', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (title: string) => {
    if (!token) return;

    try {
      const response = await api.boards.create(token, title);
      setBoards([response.board, ...boards]);
      showToast('Board created successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to create board', 'error');
      throw error;
    }
  };

  const handleUpdateBoard = async (id: string, title: string) => {
    if (!token) return;

    try {
      const response = await api.boards.update(token, id, title);
      setBoards(boards.map((b) => (b.id === id ? response.board : b)));
      showToast('Board updated successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update board', 'error');
      throw error;
    }
  };

  const handleDeleteBoard = async (id: string) => {
    if (!token) return;

    try {
      await api.boards.delete(token, id);
      setBoards(boards.filter((b) => b.id !== id));
      showToast('Board deleted successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to delete board', 'error');
      throw error;
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    // Simple toast implementation - you can enhance this
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // Show loading state while checking auth
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Boards</h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome back, {user?.name || user?.email}!
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create New Board
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-40 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : boards.length === 0 ? (
          // Empty state
          <div className="text-center py-16">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              No boards yet
            </h3>
            <p className="mt-2 text-gray-600">
              Create your first board to get started with TaskFlow!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Your First Board
            </button>
          </div>
        ) : (
          // Board grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onEdit={setEditingBoard}
                onDelete={setDeletingBoard}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateBoardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateBoard}
      />

      <EditBoardModal
        isOpen={!!editingBoard}
        board={editingBoard}
        onClose={() => setEditingBoard(null)}
        onUpdate={handleUpdateBoard}
      />

      <DeleteConfirmModal
        isOpen={!!deletingBoard}
        board={deletingBoard}
        onClose={() => setDeletingBoard(null)}
        onConfirm={handleDeleteBoard}
      />
    </div>
  );
}
