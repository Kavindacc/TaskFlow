'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Image from 'next/image';

// ── Mock Data for Portfolio Demo ──────────────────────────────────────────
const TASK_DATA = {
  title: '',
  description: '',
  project: '',
  priority: '',
  dueDate: '',
  assignee: { name: '', avatar: '', color: '' },
  tags: [''],
  effort: { logged: 0, total: 0 },
  subtasks: [
    { id: 1, text: '', done: false },
    { id: 2, text: '', done: false },
    { id: 3, text: '', done: false },
    { id: 4, text: '', done: false },
    { id: 5, text: '', done: false },
  ],
  comments: [
    {
      id: 1,
      author: '',
      role: '',
      time: '',
      text: "",
      avatarColor: '',
    },
    {
      id: 2,
      author: '',
      role: '',
      time: '',
      text: "",
      avatarColor: '',
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
  const { user, token } = useAuth();
  const searchParams = useSearchParams();
  const boardId = searchParams.get('boardId');
  const listId = searchParams.get('listId');

  const [boardContext, setBoardContext] = useState<any>(null);
  const [listContext, setListContext] = useState<any>(null);

  // Editable list-level properties
  const [priority, setPriority] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [effortTotal, setEffortTotal] = useState<number>(0);
  const [effortLogged, setEffortLogged] = useState<number>(0);
  const [savingProps, setSavingProps] = useState(false);

  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    if (!token || !boardId || !listId) return;
    const fetchBoard = async () => {
      try {
        const data = await api.boards.getById(token, boardId);
        setBoardContext(data);
        const foundList = data.lists?.find((l: any) => l.id === listId);
        if (foundList) {
          setListContext(foundList);
          setPriority(foundList.priority || '');
          setDueDate(foundList.dueDate ? new Date(foundList.dueDate).toISOString().slice(0, 10) : '');
          setEffortTotal(foundList.effortTotal || 0);
          setEffortLogged(foundList.effortLogged || 0);
          setSubtasks(foundList.cards.map((c: any) => ({
            id: c.id, text: c.title, done: c.isComplete ?? false
          })));
        }
      } catch(e) {
        console.error('Failed fetching data', e);
      }
    };
    fetchBoard();
  }, [token, boardId, listId]);

  const completedCount = subtasks.filter((s:any) => s.done).length;
  const progressPercent = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  const toggleSubtask = async (id: string | number) => {
    // Find the task to get its new status
    const targetTask = subtasks.find(s => s.id === id);
    if (!targetTask || !token) return;
    
    const newStatus = !targetTask.done;
    
    // Optimistic update
    setSubtasks(subtasks.map((s:any) => s.id === id ? { ...s, done: newStatus } : s));

    // Persist to DB
    try {
      await api.cards.update(token, id.toString(), {
        isComplete: newStatus
      });
    } catch (e) {
      console.error('Failed to toggle completion', e);
      // Revert if failed
      setSubtasks(subtasks.map((s:any) => s.id === id ? { ...s, done: !newStatus } : s));
    }
  };

  const handleAddSubtask = async () => {
    if (!newTaskText.trim() || !listId || !token) {
      setIsAddingTask(false);
      return;
    }
    try {
      const data = await api.cards.create(token, listId, newTaskText);
      setSubtasks([...subtasks, { id: data.id, text: data.title, done: false }]);
      setNewTaskText('');
      setIsAddingTask(false);
    } catch (e) {
      console.error('Failed to add subtask', e);
    }
  };

  const handleListPropertyUpdate = async (data: { isComplete?: boolean, assigneeId?: string | null }) => {
    if (!token || !listId || !listContext) return;
    setListContext({ ...listContext, ...data });
    try {
      await api.lists.update(token, listId, data);
    } catch (e) {
      console.error('Failed to update list properties', e);
    }
  };

  const handleSaveProps = async () => {
    if (!token || !listId) return;
    setSavingProps(true);
    try {
      await api.lists.update(token, listId, {
        priority,
        dueDate: dueDate || null,
        effortTotal,
        effortLogged,
      });
      setListContext((prev: any) => ({ ...prev, priority, dueDate, effortTotal, effortLogged }));
    } catch (e) {
      console.error('Failed to save props', e);
    } finally {
      setSavingProps(false);
    }
  };

  // Aggregate all unique labels across every card on this board
  const uniqueTags: string[] = Array.from(
    new Set(
      (boardContext?.lists ?? [])
        .flatMap((l: any) => l.cards ?? [])
        .flatMap((c: any) => c.labels ?? [])
        .filter(Boolean)
    )
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8f9ff', fontFamily: "'Inter', sans-serif" }}>

      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar user={user} />
        
        {/* Breadcrumb */}
        <div style={{ padding: '2rem 3.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link href="/dashboard" style={{ fontSize: '0.8125rem', color: 'var(--secondary)', textDecoration: 'none' }}>Projects</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          <span style={{ fontSize: '0.8125rem', color: 'var(--secondary)' }}>{boardContext?.title || 'The High-Performance Lab'}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface)', fontWeight: 600 }}>Task Detail</span>
        </div>

        {/* Layout Split */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Left Column (Main Content) */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 2.5rem 4rem 3.5rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0b1c30', letterSpacing: '-0.04em', lineHeight: 1.1, maxWidth: '80%' }}>
                {listContext?.title || TASK_DATA.title}
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
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem',
                    background: task.done ? '#f8fafc' : '#ffffff', borderRadius: '0.375rem',
                    border: '1px solid #f1f5f9', cursor: 'pointer',
                    transition: 'background 0.2s'
                  }} 
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = task.done ? '#f8fafc' : '#ffffff'; }}
                  onClick={() => toggleSubtask(task.id)}>
                    <div style={{
                      width: '1rem', height: '1rem', borderRadius: '0.25rem',
                      background: task.done ? '#0036ad' : '#fff',
                      border: task.done ? 'none' : '2px solid #cbd5e1',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {task.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <span style={{ fontSize: '0.8125rem', color: task.done ? '#94a3b8' : '#4b5563', textDecoration: task.done ? 'line-through' : 'none', fontWeight: 500 }}>
                      {task.text}
                    </span>
                  </div>
                ))}

                {/* Add Subtask Button / Input */}
                {isAddingTask ? (
                  <div style={{ marginTop: '0.25rem', padding: '0.5rem', background: '#fff', borderRadius: '0.375rem', border: '1px solid #0036ad', boxShadow: '0 0 0 2px rgba(0,54,173,0.1)' }}>
                    <input
                      autoFocus
                      type="text"
                      value={newTaskText}
                      onChange={e => setNewTaskText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAddSubtask();
                        if (e.key === 'Escape') setIsAddingTask(false);
                      }}
                      placeholder="What needs to be done?"
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.8125rem', fontFamily: "'Inter', sans-serif", color: '#0b1c30' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button onClick={handleAddSubtask} style={{ padding: '0.25rem 0.75rem', background: '#0036ad', color: '#fff', border: 'none', borderRadius: '0.25rem', fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer' }}>Add</button>
                      <button onClick={() => setIsAddingTask(false)} style={{ padding: '0.25rem 0.75rem', background: 'transparent', color: '#64748b', border: 'none', fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button style={{
                    marginTop: '0.25rem', width: '100%', padding: '0.625rem',
                    borderRadius: '0.375rem', border: '1.5px dashed #cbd5e1', background: 'transparent',
                    color: '#94a3b8', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', cursor: 'pointer',
                    transition: 'color 0.2s, border-color 0.2s'
                  }}
                  onClick={() => setIsAddingTask(true)}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#64748b'; (e.currentTarget as HTMLElement).style.borderColor = '#94a3b8'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#94a3b8'; (e.currentTarget as HTMLElement).style.borderColor = '#cbd5e1'; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Subtask
                  </button>
                )}
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

          </div>

          {/* Right Sidebar (Properties Panel) */}
          <div style={{ width: '420px', flexShrink: 0, padding: '2.5rem', background: '#f8f9ff', overflowY: 'auto' }}>
            
            {/* Task Properties */}
            <div style={{ background: '#ffffff', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <h4 style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.1em', marginBottom: '1rem' }}>TASK PROPERTIES</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Assignee */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 500 }}>Assignee</span>
                  </div>
                  <select
                    value={listContext?.assigneeId || ''}
                    onChange={(e) => handleListPropertyUpdate({ assigneeId: e.target.value || null })}
                    style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0b1c30', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.25rem 0.5rem', outline: 'none', cursor: 'pointer', maxWidth: '160px' }}
                  >
                    <option value="">Unassigned</option>
                    {boardContext?.members?.map((member: any) => (
                      <option key={member.user.id} value={member.user.id}>
                        {member.user.name || member.user.email}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><path d="M3 3h18M3 9h18M3 15h12"/></svg>
                    <span style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 500 }}>Priority</span>
                  </div>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={{
                      fontSize: '0.75rem', fontWeight: 700, border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.25rem 0.5rem', outline: 'none', cursor: 'pointer',
                      background: priority === 'HIGH' ? '#fef2f2' : priority === 'MEDIUM' ? '#fffbeb' : priority === 'LOW' ? '#f0fdf4' : '#f8fafc',
                      color: priority === 'HIGH' ? '#dc2626' : priority === 'MEDIUM' ? '#d97706' : priority === 'LOW' ? '#16a34a' : '#64748b',
                    }}
                  >
                    <option value="">None</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                {/* Due Date */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 500 }}>Due Date</span>
                  </div>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0b1c30', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.25rem 0.5rem', outline: 'none', cursor: 'pointer' }}
                  />
                </div>

                {/* Project */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                    <span style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 500 }}>Project</span>
                  </div>
                  <Link href="/boards" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0036ad', textDecoration: 'none' }}>{boardContext?.title || '—'}</Link>
                </div>

                {/* Save button */}
                <button
                  onClick={handleSaveProps}
                  disabled={savingProps}
                  style={{ width: '100%', marginTop: '0.25rem', padding: '0.5rem', borderRadius: '0.5rem', border: 'none', background: '#0036ad', color: '#fff', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', opacity: savingProps ? 0.6 : 1, transition: 'opacity 0.2s' }}
                >
                  {savingProps ? 'Saving…' : 'Save Properties'}
                </button>
              </div>
            </div>

            {/* Tags */}
            <div style={{ background: '#ffffff', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <h4 style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.1em', marginBottom: '1rem' }}>TAGS</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {uniqueTags.length > 0 ? uniqueTags.map(tag => (
                  <span key={tag} style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '0.25rem 0.625rem', borderRadius: '9999px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                    {tag}
                  </span>
                )) : (
                  <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>No tags on this board yet.</span>
                )}
              </div>

              {/* Estimated Effort */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0b1c30' }}>Estimated Effort</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <input
                      type="number" min="0" max="999"
                      value={effortTotal}
                      onChange={(e) => setEffortTotal(Number(e.target.value))}
                      style={{ width: '3.5rem', padding: '0.2rem 0.4rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 700, color: '#0b1c30', outline: 'none', textAlign: 'center' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>h total</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Hours logged</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <input
                      type="number" min="0" max={effortTotal || 999}
                      value={effortLogged}
                      onChange={(e) => setEffortLogged(Number(e.target.value))}
                      style={{ width: '3.5rem', padding: '0.2rem 0.4rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 700, color: '#0b1c30', outline: 'none', textAlign: 'center' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>h</span>
                  </div>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: `${effortTotal > 0 ? Math.min((effortLogged / effortTotal) * 100, 100) : 0}%`, height: '100%', background: '#0036ad', transition: 'width 0.3s' }} />
                </div>
                <p style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '0.375rem' }}>
                  {effortLogged}h logged of {effortTotal}h planned
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button 
                  onClick={() => handleListPropertyUpdate({ isComplete: !listContext?.isComplete })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', background: listContext?.isComplete ? '#0ea5e9' : 'linear-gradient(135deg, #1b4dd7, #0036ad)', color: '#fff', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,54,173,0.2)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  {listContext?.isComplete ? 'Completed ✓' : 'Mark as Complete'}
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
