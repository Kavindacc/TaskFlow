'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Image from 'next/image';

// ── Mock Data for Portfolio Demo ──────────────────────────────────────────
const TASK_DATA = {
  title: 'Finalize structural integrity reports for Phase 2 foundation',
  description: 'Verification of load-bearing capacities and environmental stress tests required before moving to the skeletal assembly. Coordinate with the seismic engineering team.',
  project: 'Urban Zenith',
  priority: 'HIGH',
  dueDate: 'Oct 24, 2023',
  assignee: { name: 'Marcus Thorne', avatar: '/images/avatar-marcus.jpg', color: '#1a1a1a' },
  tags: ['Engineering', 'Phase 2', 'Compliance'],
  effort: { logged: 8, total: 12 },
  subtasks: [
    { id: 1, text: 'Review initial soil samples from zone 4B', done: true },
    { id: 2, text: 'Coordinate with external seismic consultant', done: true },
    { id: 3, text: 'Generate preliminary stress heatmaps', done: true },
    { id: 4, text: 'Finalize documentation for local council review', done: false },
    { id: 5, text: 'Submit sign-off request to Head of Engineering', done: false },
  ],
  comments: [
    {
      id: 1,
      author: 'Marcus Thorne',
      role: 'SENIOR ENGINEER',
      time: '2H AGO',
      text: "I've just uploaded the revised seismic data for the northern quadrant. We need to account for the slight variance in soil density.",
      avatarColor: '#0b1c30',
    },
    {
      id: 2,
      author: 'Sarah Chen',
      role: 'ARCHITECT',
      time: '45M AGO',
      text: "Acknowledged. I'll integrate these changes into the BIM model by EOD. Marcus, let's sync for 5 mins tomorrow morning.",
      avatarColor: '#2d6a4f',
    }
  ]
};

// ── Components ──────────────────────────────────────────────────────────
function TopBar({ user }: { user: any }) {
  return (
    <header style={{
      height: '64px', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem', background: '#ffffff',
      borderBottom: '1px solid var(--surface-container-low)',
    }}>
      <p style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)' }}>
        Architect Workspace
      </p>

      <div style={{ position: 'relative', width: '400px', margin: '0 2rem' }}>
        <svg style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }}
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text" placeholder="Search tasks..."
          style={{
            width: '100%', padding: '0.5rem 1rem 0.5rem 2.375rem', borderRadius: '0.625rem',
            border: 'none', background: 'var(--surface-container-low)',
            fontSize: '0.875rem', color: 'var(--on-surface)', outline: 'none', fontFamily: "'Inter', sans-serif"
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <button style={{ width: '2rem', height: '2rem', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
        </button>
        <button style={{ width: '2rem', height: '2rem', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
        </button>
        <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: 'linear-gradient(135deg, #0369a1, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
          {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}

export default function MyTasksPage() {
  const { user } = useAuth();
  const [subtasks, setSubtasks] = useState(TASK_DATA.subtasks);
  const [comments, setComments] = useState(TASK_DATA.comments);
  const [newComment, setNewComment] = useState('');

  const completedCount = subtasks.filter(s => s.done).length;
  const progressPercent = Math.round((completedCount / subtasks.length) * 100);

  const toggleSubtask = (id: number) => {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, done: !s.done } : s));
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments([...comments, {
      id: Date.now(),
      author: user?.name || user?.email?.split('@')[0] || 'You',
      role: 'USER', time: 'JUST NOW',
      text: newComment, avatarColor: '#0369a1'
    }]);
    setNewComment('');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8f9ff', fontFamily: "'Inter', sans-serif" }}>

      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar user={user} />
        
        {/* Breadcrumb */}
        <div style={{ padding: '2rem 3.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link href="/dashboard" style={{ fontSize: '0.8125rem', color: 'var(--secondary)', textDecoration: 'none' }}>Projects</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          <span style={{ fontSize: '0.8125rem', color: 'var(--secondary)' }}>The High-Performance Lab</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface)', fontWeight: 600 }}>Task Detail</span>
        </div>

        {/* Layout Split */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Left Column (Main Content) */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 2.5rem 4rem 3.5rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0b1c30', letterSpacing: '-0.04em', lineHeight: 1.1, maxWidth: '80%' }}>
                {TASK_DATA.title}
              </h1>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem', border: 'none', background: 'var(--surface-container-low)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                </button>
                <button style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem', border: 'none', background: 'var(--surface-container-low)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                </button>
              </div>
            </div>

            <p style={{ fontSize: '1rem', color: '#4b5563', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '85%' }}>
              {TASK_DATA.description}
            </p>

            {/* Subtasks Section */}
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ padding: '0 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0036ad" strokeWidth="2.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0b1c30' }}>Project Subtasks</h3>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '9999px', background: '#dbeafe', color: '#1e40af' }}>
                  {progressPercent}% Complete
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {subtasks.map((task) => (
                  <div key={task.id} style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                    background: '#ffffff', borderRadius: '0.5rem',
                    border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    cursor: 'pointer'
                  }} onClick={() => toggleSubtask(task.id)}>
                    <div style={{
                      width: '1.25rem', height: '1.25rem', borderRadius: '0.375rem',
                      background: task.done ? '#0036ad' : '#fff',
                      border: task.done ? 'none' : '2px solid #cbd5e1',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {task.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <span style={{ fontSize: '0.9375rem', color: task.done ? '#94a3b8' : '#0b1c30', textDecoration: task.done ? 'line-through' : 'none', fontWeight: 500 }}>
                      {task.text}
                    </span>
                  </div>
                ))}

                {/* Add Subtask Button */}
                <button style={{
                  marginTop: '0.5rem', width: '100%', padding: '1rem',
                  borderRadius: '0.5rem', border: '2px dashed #cbd5e1', background: 'transparent',
                  color: '#64748b', fontSize: '0.9375rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add Subtask
                </button>
              </div>
            </div>

            {/* Attachments Section */}
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ padding: '0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0036ad" strokeWidth="2.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0b1c30' }}>Attachments</h3>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: '180px', height: '110px', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  {/* Mock Wireframe image */}
                  <svg width="240" height="150" viewBox="0 0 240 150" fill="none" style={{ position: 'absolute', opacity: 0.3 }}>
                    <path d="M10 140V10h80v130M90 10l80 30v100l-80-30" stroke="#0036ad" strokeWidth="2" strokeDasharray="4 2"/>
                    <path d="M10 40h80M10 70h80M10 100h80M90 40l80 30M90 70l80 30M90 100l80 30" stroke="#0036ad" strokeWidth="1" strokeDasharray="4 2"/>
                    <path d="M170 40V10l60 20v110l-60-20M170 40l60 20M170 70l60 20M170 100l60 20" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="4 2"/>
                  </svg>
                </div>
                <div style={{ width: '180px', height: '110px', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #0b1c30, #1e3a8a)', position: 'relative', overflow: 'hidden' }}>
                  {/* Mock abstract tech image */}
                  <svg width="180" height="110" viewBox="0 0 180 110" fill="none">
                    <circle cx="90" cy="55" r="40" stroke="#38bdf8" strokeWidth="1" opacity="0.5"/>
                    <circle cx="90" cy="55" r="30" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 6"/>
                    <circle cx="90" cy="55" r="10" fill="#38bdf8"/>
                  </svg>
                </div>
                <button style={{ width: '180px', height: '110px', borderRadius: '0.5rem', border: '2px dashed #cbd5e1', background: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>UPLOAD FILES</span>
                </button>
              </div>
            </div>

            {/* Team Discussion */}
            <div>
              <div style={{ padding: '0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0036ad" strokeWidth="2.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0b1c30' }}>Team Discussion</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0 0.5rem' }}>
                {comments.map(c => (
                  <div key={c.id} style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: c.avatarColor, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.875rem', fontWeight: 700 }}>
                      {c.author[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0b1c30' }}>{c.author}</span>
                        <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--secondary)', letterSpacing: '0.05em' }}>{c.role} • {c.time}</span>
                      </div>
                      <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '0 0.75rem 0.75rem 0.75rem', fontSize: '0.9375rem', color: '#334155', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                        {c.text}
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', paddingLeft: '0.5rem' }}>
                        <button style={{ background: 'none', border: 'none', fontSize: '0.6875rem', fontWeight: 700, color: '#0036ad', cursor: 'pointer' }}>REPLY</button>
                        <button style={{ background: 'none', border: 'none', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--secondary)', cursor: 'pointer' }}>LIKE {c.id === 2 && '(1)'}</button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Write comment */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: '#0369a1', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.875rem', fontWeight: 700 }}>
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                    <textarea
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      rows={3}
                      style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', background: '#f1f5f9', fontSize: '0.9375rem', fontFamily: "'Inter', sans-serif", outline: 'none', resize: 'none' }}
                    />
                    <button
                      onClick={handleAddComment}
                      style={{ padding: '0.625rem 1.5rem', borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg, #0036ad, #1b4dd7)', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,54,173,0.2)' }}
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar (Properties Panel) */}
          <div style={{ width: '420px', flexShrink: 0, padding: '2.5rem', background: '#f8f9ff', overflowY: 'auto' }}>
            
            {/* Task Properties */}
            <div style={{ background: '#ffffff', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <h4 style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.1em', marginBottom: '1rem' }}>TASK PROPERTIES</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 500 }}>Assignee</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0b1c30' }}>{TASK_DATA.assignee.name}</span>
                    <div style={{ width: '1.25rem', height: '1.25rem', borderRadius: '50%', background: TASK_DATA.assignee.color, color: '#fff', fontSize: '0.5rem', display: 'flex', alignItems: 'center', justifyItems: 'center', fontWeight: 'bold', justifyContent: 'center' }}>M</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 500 }}>Priority</span>
                  </div>
                  <span style={{ fontSize: '0.625rem', fontWeight: 800, padding: '0.125rem 0.5rem', borderRadius: '9999px', background: '#fee2e2', color: '#dc2626', letterSpacing: '0.05em' }}>{TASK_DATA.priority}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 500 }}>Due Date</span>
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0b1c30' }}>{TASK_DATA.dueDate}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                    <span style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 500 }}>Project</span>
                  </div>
                  <Link href="/boards" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0036ad', textDecoration: 'none' }}>{TASK_DATA.project}</Link>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div style={{ background: '#ffffff', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <h4 style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.1em', marginBottom: '1rem' }}>TAGS</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {TASK_DATA.tags.map(tag => (
                  <span key={tag} style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '0.25rem 0.625rem', borderRadius: '9999px', background: '#f1f5f9', color: '#475569' }}>
                    {tag}
                  </span>
                ))}
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0b1c30' }}>Estimated Effort</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0b1c30' }}>{TASK_DATA.effort.total}h</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '9999px', marginBottom: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ width: `${(TASK_DATA.effort.logged / TASK_DATA.effort.total) * 100}%`, height: '100%', background: '#0036ad' }} />
                </div>
                <p style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                  {TASK_DATA.effort.logged} hours logged of {TASK_DATA.effort.total} planned
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg, #1b4dd7, #0036ad)', color: '#fff', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,54,173,0.2)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  Mark as Complete
                </button>
                <button style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#fff', color: '#0b1c30', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  Log Time
                </button>
              </div>
            </div>

            {/* Currently Viewing */}
            <div style={{ background: '#ffffff', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <h4 style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.1em', marginBottom: '0.875rem' }}>CURRENTLY VIEWING</h4>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {['#0b1c30', '#7c3aed', '#2d6a4f'].map((bg, i) => (
                  <div key={i} style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: bg, border: '2px solid #fff', marginLeft: i === 0 ? 0 : '-0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.6875rem', fontWeight: 700, zIndex: 3 - i }}>
                    {['M', 'S', 'D'][i]}
                  </div>
                ))}
                <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: '#e2e8f0', border: '2px solid #fff', marginLeft: '-0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '0.6875rem', fontWeight: 700 }}>
                  +2
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
