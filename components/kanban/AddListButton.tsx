'use client';

import { useState } from 'react';

interface AddListButtonProps {
  onCreateList: (title: string) => Promise<void>;
}

export default function AddListButton({ onCreateList }: AddListButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    setLoading(true);
    try {
      await onCreateList(title.trim());
      setTitle('');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to create list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="flex-shrink-0 w-80 bg-white/50 hover:bg-white/80 rounded-lg p-4 transition-colors flex items-center gap-2 text-gray-700 font-medium"
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
        Add another list
      </button>
    );
  }

  return (
    <div className="flex-shrink-0 w-80 bg-gray-100 rounded-lg p-4">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter list title..."
          disabled={loading}
          className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-black"
          autoFocus
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Adding...' : 'Add list'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
