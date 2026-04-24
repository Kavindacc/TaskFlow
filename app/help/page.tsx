'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

const features = [
  {
    title: 'Interactive Kanban',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/>
        <rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>
      </svg>
    ),
    desc: 'Drag and drop tasks between stages in real-time with live WebSocket sync across all connected teammates.',
  },
  {
    title: 'Team Management',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    desc: 'Invite colleagues, manage board-level permissions, and assign tasks with role-based access controls.',
  },
  {
    title: 'Global Calendar',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    desc: 'A unified view of all deadlines across every workspace — never miss a due date again.',
  },
  {
    title: 'Task Details',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    desc: 'Track effort, priority, and subtasks for every item with rich markdown descriptions and file attachments.',
  },
];

const faqItems = [
  {
    q: 'How do I invite a teammate to my workspace?',
    a: 'Open the workspace settings via the board menu (⋯), navigate to "Members", and enter their email. They will receive an invitation link.',
  },
  {
    q: 'Can I reorder columns in my Kanban board?',
    a: 'Yes. Click and hold the column header, then drag it to the desired position. Changes are saved and synced instantly.',
  },
  {
    q: 'Is my data backed up?',
    a: 'All data is continuously replicated to our cloud infrastructure. You can also export any board as a JSON or CSV from the board settings.',
  },
  {
    q: 'How does real-time collaboration work?',
    a: 'TaskFlow uses persistent WebSocket connections. Any change made by any team member is broadcast to all active sessions within milliseconds.',
  },
];

export default function HelpPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/sign-in');
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) return null;

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: 'var(--surface)',
      fontFamily: "'Inter', sans-serif",
    }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* ── Top bar ── */}
        <header style={{
          height: '64px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 2.5rem',
          background: 'var(--surface-container-lowest)',
          boxShadow: '0 1px 0 0 var(--surface-container)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            
            <span style={{
              fontSize: '0.6875rem', fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--secondary)', opacity: 0.6,
              paddingLeft: '0.75rem',
              borderLeft: '1.5px solid var(--surface-container)',
            }}>
              Documentation
            </span>
          </div>

          <a
            href="mailto:support@taskflow.app"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.4rem 1rem',
              background: 'linear-gradient(135deg, #0036ad, #1b4dd7)',
              color: '#fff', borderRadius: '0.375rem',
              fontSize: '0.8125rem', fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(0,54,173,0.18)',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Contact Support
          </a>
        </header>

        {/* ── Content ── */}
        <div style={{ flex: 1, padding: '3rem 4rem', overflowY: 'auto' }}>
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>

            {/* Hero */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '2.5rem',
              marginBottom: '3.5rem',
              padding: '2.5rem 2.5rem',
              background: 'var(--surface-container-lowest)',
              borderRadius: '1.25rem',
              boxShadow: '0 8px 32px rgba(11,28,48,0.06)',
            }}>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '0.75rem', fontWeight: 700,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: 'var(--primary)', marginBottom: '0.75rem',
                }}>
                  Help & Documentation
                </p>
                <h1 style={{
                  fontSize: '2.25rem', fontWeight: 900,
                  color: 'var(--on-surface)',
                  letterSpacing: '-0.03em', lineHeight: 1.15,
                  marginBottom: '1rem',
                }}>
                  Everything you need<br />to master TaskFlow.
                </h1>
                <p style={{
                  fontSize: '1rem', color: 'var(--secondary)',
                  lineHeight: 1.65, maxWidth: '400px',
                }}>
                  From first task to full team — find guides, feature references, and answers to common questions all in one place.
                </p>
              </div>

              {/* Logo lockup */}
              <div style={{
                flexShrink: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '0.5rem',
                padding: '1.5rem 2rem',
                background: 'var(--surface)',
                borderRadius: '1rem',
              }}>
                <Image
                  src="/images/taskflow-logo-name.png"
                  alt="TaskFlow Logo"
                  width={160}
                  height={44}
                  style={{ objectFit: 'contain' }}
                />
                <span style={{
                  fontSize: '0.6875rem', color: 'var(--secondary)',
                  fontWeight: 500, letterSpacing: '0.04em', opacity: 0.65,
                }}>
                  Collaborative Task Management
                </span>
              </div>
            </div>

            {/* Getting Started */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{
                fontSize: '1.125rem', fontWeight: 800,
                color: 'var(--on-surface)',
                letterSpacing: '-0.01em',
                marginBottom: '1.25rem',
              }}>
                Getting Started
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
              }}>
                {[
                  { label: 'Workspaces', color: '#0036ad', desc: 'Containers for your projects. Each board represents a separate workspace.' },
                  { label: 'Lists', color: '#2D6A4F', desc: 'Categories or stages within a workspace — "To Do", "In Progress", "Done".' },
                  { label: 'Tasks', color: '#515f74', desc: 'Individual work items you can track, assign, prioritize, and discuss.' },
                ].map(item => (
                  <div key={item.label} style={{
                    padding: '1.25rem 1.25rem',
                    background: 'var(--surface-container-lowest)',
                    borderRadius: '0.875rem',
                    boxShadow: '0 2px 12px rgba(11,28,48,0.04)',
                  }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.625rem',
                      background: item.color + '14',
                      color: item.color,
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem', fontWeight: 700,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      marginBottom: '0.75rem',
                    }}>
                      {item.label}
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--secondary)', lineHeight: 1.6, margin: 0 }}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Key Features */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{
                fontSize: '1.125rem', fontWeight: 800,
                color: 'var(--on-surface)',
                letterSpacing: '-0.01em',
                marginBottom: '1.25rem',
              }}>
                Key Features
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
              }}>
                {features.map(f => (
                  <div key={f.title} style={{
                    display: 'flex', gap: '1rem',
                    padding: '1.375rem',
                    background: 'var(--surface-container-lowest)',
                    borderRadius: '0.875rem',
                    boxShadow: '0 2px 12px rgba(11,28,48,0.04)',
                    transition: 'background 0.15s',
                    cursor: 'default',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-dim, #eef2fb)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface-container-lowest)')}
                  >
                    <div style={{
                      width: '42px', height: '42px', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'var(--surface-container)',
                      borderRadius: '0.625rem',
                      color: 'var(--primary)',
                    }}>
                      {f.icon}
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '0.9375rem', fontWeight: 700,
                        color: 'var(--on-surface)', marginBottom: '0.375rem',
                      }}>
                        {f.title}
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--secondary)', lineHeight: 1.6, margin: 0 }}>
                        {f.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{
                fontSize: '1.125rem', fontWeight: 800,
                color: 'var(--on-surface)',
                letterSpacing: '-0.01em',
                marginBottom: '1.25rem',
              }}>
                Frequently Asked Questions
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {faqItems.map((item, i) => (
                  <div key={i} style={{
                    background: 'var(--surface-container-lowest)',
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(11,28,48,0.04)',
                  }}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 1.25rem',
                        background: 'none', border: 'none', cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--on-surface)' }}>
                        {item.q}
                      </span>
                      <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="var(--secondary)" strokeWidth="2.2"
                        strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>
                    {openFaq === i && (
                      <div style={{
                        padding: '0 1.25rem 1rem',
                        fontSize: '0.875rem', color: 'var(--secondary)', lineHeight: 1.7,
                      }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* CTA Banner */}
            <section style={{
              padding: '2.25rem 2.5rem',
              background: 'linear-gradient(135deg, #0036ad, #1b4dd7)',
              borderRadius: '1.25rem',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem',
              flexWrap: 'wrap',
            }}>
              <div>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                  Still have questions?
                </h2>
                <p style={{ fontSize: '0.9375rem', opacity: 0.85, lineHeight: 1.55, margin: 0, maxWidth: '380px' }}>
                  Our support team is available 24/7 to assist with technical issues or onboarding help.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  style={{
                    padding: '0.75rem 1.5rem', borderRadius: '0.5rem',
                    border: 'none', background: '#fff',
                    color: '#0036ad', fontWeight: 700, fontSize: '0.875rem',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Contact Support
                </button>
                <button
                  style={{
                    padding: '0.75rem 1.5rem', borderRadius: '0.5rem',
                    border: '1.5px solid rgba(255,255,255,0.4)',
                    background: 'transparent',
                    color: '#fff', fontWeight: 600, fontSize: '0.875rem',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  View Changelog
                </button>
              </div>
            </section>

            {/* Footer note */}
            <div style={{
              marginTop: '2.5rem', paddingTop: '1.5rem',
              borderTop: '1px solid var(--surface-container)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <Image
                src="/images/taskflow-logo-name.png"
                alt="TaskFlow"
                width={90}
                height={26}
                style={{ objectFit: 'contain', opacity: 0.45 }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', opacity: 0.5, margin: 0 }}>
                © {new Date().getFullYear()} TaskFlow · Collaborative Task Management
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
