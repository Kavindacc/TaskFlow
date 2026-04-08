'use client';

import { useState, useEffect } from 'react';
import { Board, BoardMember } from '@/types/board';

interface ManageMembersModalProps {
  board: Board;
  isOpen: boolean;
  isOwner: boolean;
  onClose: () => void;
  onInvite: (email: string) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
}

const getInitials = (name: string | null, email: string) => {
  if (name) return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  return email[0].toUpperCase();
};

const AVATAR_COLORS = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-green-500 to-green-600',
  'from-pink-500 to-pink-600',
  'from-orange-500 to-orange-600',
  'from-cyan-500 to-cyan-600',
];

const getAvatarColor = (id: string) => {
  const idx = id.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

export default function ManageMembersModal({
  board,
  isOpen,
  isOwner,
  onClose,
  onInvite,
  onRemove,
}: ManageMembersModalProps) {
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleInvite = async () => {
    const trimmed = email.trim().toLowerCase();
    setError('');
    setSuccessMsg('');

    if (!trimmed) { setError('Please enter an email address.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setError('Please enter a valid email address.'); return; }

    // Check if already a member
    const alreadyMember = board.members.some((m) => m.user.email.toLowerCase() === trimmed);
    if (alreadyMember) { setError('This person is already a member of the board.'); return; }

    setInviting(true);
    try {
      await onInvite(trimmed);
      setSuccessMsg(`✓ ${trimmed} has been added to the board!`);
      setEmail('');
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('no user found')) {
        setError(`${trimmed} doesn't have a TaskFlow account yet.`);
      } else {
        setError(msg || 'Failed to invite member. Please try again.');
      }
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (userId: string) => {
    setRemovingId(userId);
    try {
      await onRemove(userId);
    } catch (err: any) {
      setError(err.message || 'Failed to remove member.');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Board Members</h2>
              <p className="text-xs text-gray-500">{board.members.length} member{board.members.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Invite section — only for owner */}
          {isOwner && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Invite by Email
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); setSuccessMsg(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                  placeholder="teammate@example.com"
                  className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-colors"
                />
                <button
                  onClick={handleInvite}
                  disabled={inviting || !email.trim()}
                  className="px-4 py-2.5 text-sm font-semibold bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  {inviting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Invite
                    </>
                  )}
                </button>
              </div>

              {/* Error / Success feedback */}
              {error && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {successMsg}
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Members list */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Current Members</p>
            <ul className="space-y-2">
              {board.members.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(member.user.id)} flex items-center justify-center text-white text-sm font-bold`}>
                    {getInitials(member.user.name, member.user.email)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {member.user.name || member.user.email}
                    </p>
                    {member.user.name && (
                      <p className="text-xs text-gray-400 truncate">{member.user.email}</p>
                    )}
                  </div>

                  {/* Role badge */}
                  <span className={`flex-shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full ${
                    member.role === 'owner'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {member.role === 'owner' ? '👑 Owner' : 'Member'}
                  </span>

                  {/* Remove button — owner can remove non-owner members */}
                  {isOwner && member.role !== 'owner' && (
                    <button
                      onClick={() => handleRemove(member.user.id)}
                      disabled={removingId === member.user.id}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Remove member"
                    >
                      {removingId === member.user.id ? (
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                        </svg>
                      )}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-400 text-center">
            {isOwner
              ? 'Invited members can view and edit this board.'
              : 'Only the board owner can invite or remove members.'}
          </p>
        </div>
      </div>
    </div>
  );
}
