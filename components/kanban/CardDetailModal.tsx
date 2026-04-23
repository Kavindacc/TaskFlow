'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Comment, BoardMember } from '@/types/board';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface CardDetailModalProps {
  card: Card | null;
  isOpen: boolean;
  members: BoardMember[];
  onClose: () => void;
  onUpdate: (cardId: string, data: Partial<Card>) => Promise<void>;
  onDelete: (cardId: string) => Promise<void>;
}

const PRESET_LABELS = [
  { label: 'bug', color: 'bg-red-100 text-red-700 border-red-200' },
  { label: 'feature', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { label: 'urgent', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { label: 'design', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { label: 'backend', color: 'bg-green-100 text-green-700 border-green-200' },
  { label: 'frontend', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  { label: 'docs', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { label: 'testing', color: 'bg-pink-100 text-pink-700 border-pink-200' },
];

const getLabelColor = (label: string) => {
  const found = PRESET_LABELS.find((l) => l.label === label);
  return found?.color ?? 'bg-gray-100 text-gray-700 border-gray-200';
};

const formatRelativeTime = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getInitials = (name: string | null, email: string) => {
  if (name) return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  return email[0].toUpperCase();
};

export default function CardDetailModal({
  card,
  isOpen,
  members,
  onClose,
  onUpdate,
  onDelete,
}: CardDetailModalProps) {
  const { token, user } = useAuth();

  // Card edit state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [titleEditing, setTitleEditing] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // Sync state with card prop
  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description ?? '');
      setLabels(card.labels ?? []);
      setDueDate(
        card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : ''
      );
      setIsComplete(card.isComplete ?? false);
      setAssigneeId(card.assigneeId ?? null);
      setShowDeleteConfirm(false);
      setTitleEditing(false);
      setCommentText('');
      // Load fresh card details with comments
      fetchComments(card.id);
    }
  }, [card]);

  // Focus title input when editing
  useEffect(() => {
    if (titleEditing) titleRef.current?.focus();
  }, [titleEditing]);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const fetchComments = async (cardId: string) => {
    if (!token) return;
    setLoadingComments(true);
    try {
      const data = await api.cards.get(token, cardId);
      setComments(data.comments ?? []);
    } catch (e) {
      // silently fail
    } finally {
      setLoadingComments(false);
    }
  };

  if (!isOpen || !card) return null;

  const isDirty =
    title !== card.title ||
    description !== (card.description ?? '') ||
    JSON.stringify(labels) !== JSON.stringify(card.labels ?? []) ||
    dueDate !==
      (card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '') ||
    isComplete !== (card.isComplete ?? false) ||
    assigneeId !== (card.assigneeId ?? null);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onUpdate(card.id, {
        title: title.trim(),
        description: description.trim() || null,
        labels,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        isComplete,
        assigneeId,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(card.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  const toggleLabel = (label: string) => {
    setLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const addCustomLabel = () => {
    const trimmed = newLabel.trim().toLowerCase();
    if (trimmed && !labels.includes(trimmed)) {
      setLabels((prev) => [...prev, trimmed]);
    }
    setNewLabel('');
  };

  const removeLabel = (label: string) => {
    setLabels((prev) => prev.filter((l) => l !== label));
  };

  const handleAddComment = async () => {
    if (!token || !commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const response = await api.comments.create(token, card.id, commentText.trim());
      setComments((prev) => [response.comment, ...prev]);
      setCommentText('');
    } catch (e) {
      // silently fail — backend not yet implemented
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!token) return;
    setDeletingCommentId(commentId);
    try {
      await api.comments.delete(token, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (e) {
      // silently fail
    } finally {
      setDeletingCommentId(null);
    }
  };

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-start gap-3 px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="mt-0.5 flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            {titleEditing ? (
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setTitleEditing(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setTitleEditing(false);
                  if (e.key === 'Escape') { setTitle(card.title); setTitleEditing(false); }
                }}
                className="w-full text-xl font-bold text-gray-900 bg-blue-50 border border-blue-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <h2
                onClick={() => setTitleEditing(true)}
                className="text-xl font-bold text-gray-900 cursor-pointer hover:bg-gray-100 rounded-lg px-2 py-1 -mx-2 transition-colors"
                title="Click to edit title"
              >
                {title}
              </h2>
            )}
            <p className="text-xs text-gray-400 mt-1 px-2">Click title to edit</p>
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Status & Assignment Row */}
          <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
            {/* Mark Complete */}
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors border-2 ${isComplete ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-500'}`}>
                {isComplete && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={isComplete}
                onChange={(e) => setIsComplete(e.target.checked)}
              />
              <span className={`text-sm font-semibold ${isComplete ? 'text-gray-500 line-through' : 'text-gray-700'}`}>Mark as Complete</span>
            </label>

            {/* Assignee */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Assignee</span>
              <select
                value={assigneeId || ''}
                onChange={(e) => setAssigneeId(e.target.value || null)}
                className="text-sm font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">Unassigned</option>
                {members.map(member => (
                  <option key={member.user.id} value={member.user.id}>
                    {member.user.name || member.user.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              className="w-full px-4 py-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none transition-colors placeholder-gray-400"
            />
          </div>

          {/* Labels */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Labels
            </label>

            {labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {labels.map((label) => (
                  <span
                    key={label}
                    className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${getLabelColor(label)}`}
                  >
                    {label}
                    <button onClick={() => removeLabel(label)} className="hover:opacity-70 transition-opacity">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_LABELS.map(({ label, color }) => (
                <button
                  key={label}
                  onClick={() => toggleLabel(label)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                    labels.includes(label)
                      ? `${color} ring-2 ring-offset-1 ring-current`
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {labels.includes(label) ? '✓ ' : ''}{label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomLabel()}
                placeholder="Add custom label..."
                className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              <button
                onClick={addCustomLabel}
                disabled={!newLabel.trim()}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Due Date
              {isOverdue && (
                <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded-full">Overdue!</span>
              )}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  isOverdue
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-gray-50 text-gray-700 focus:bg-white'
                }`}
              />
              {dueDate && (
                <button onClick={() => setDueDate('')} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* ── Comments ── */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Comments
              <span className="ml-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">
                {comments.length}
              </span>
            </label>

            {/* Add comment input */}
            <div className="flex gap-3 mb-4">
              {/* Current user avatar */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {user ? getInitials(user.name, user.email) : '?'}
              </div>
              <div className="flex-1">
                <textarea
                  ref={commentInputRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAddComment();
                  }}
                  placeholder="Write a comment... (Ctrl+Enter to submit)"
                  rows={2}
                  className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none transition-colors placeholder-gray-400"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddComment}
                    disabled={submittingComment || !commentText.trim()}
                    className="px-4 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>

            {/* Comments list */}
            {loadingComments ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <svg className="w-10 h-10 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm">No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 group">
                    {/* Author avatar */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(comment.author.name, comment.author.email)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-800">
                          {comment.author.name || comment.author.email}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-700 leading-relaxed">
                        {comment.text}
                      </div>
                    </div>

                    {/* Delete own comment */}
                    {user && comment.author.id === user.id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingCommentId === comment.id}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all self-start mt-6"
                        title="Delete comment"
                      >
                        {deletingCommentId === comment.id ? (
                          <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-gray-50/50">
          <div>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Card
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600 font-medium">Delete this card?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-1.5 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deleting ? 'Deleting...' : 'Yes, delete'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim() || !isDirty}
              className="px-6 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving...
                </span>
              ) : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
