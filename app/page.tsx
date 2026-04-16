'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// ── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = end / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── Mini Kanban Preview Card ──────────────────────────────────────────────────
function PreviewCard({
  title, label, labelColor, avatar, avatarColor, delay = 0
}: {
  title: string; label: string; labelColor: string;
  avatar: string; avatarColor: string; delay?: number;
}) {
  return (
    <div
      className="animate-fade-up"
      style={{
        animationDelay: `${delay}ms`,
        background: '#ffffff',
        borderRadius: '0.75rem',
        padding: '0.875rem 1rem',
        boxShadow: '0 4px 16px rgba(11,28,48,0.06)',
        marginBottom: '0.5rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#0b1c30', lineHeight: 1.4, flex: 1 }}>{title}</p>
        <div style={{
          width: '1.5rem', height: '1.5rem', borderRadius: '50%',
          background: avatarColor, color: '#fff',
          fontSize: '0.625rem', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '0.5rem', flexShrink: 0
        }}>{avatar}</div>
      </div>
      <span style={{
        fontSize: '0.6875rem', fontWeight: 600, padding: '0.125rem 0.5rem',
        borderRadius: '9999px', background: labelColor.bg, color: labelColor.text
      }}>{label}</span>
    </div>
  );
}

// ── Feature Pill ─────────────────────────────────────────────────────────────
function FeaturePill({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
      padding: '0.375rem 0.75rem', borderRadius: '9999px',
      background: 'var(--surface-container-low)',
      color: 'var(--on-surface-variant)', fontSize: '0.8125rem', fontWeight: 500,
    }}>
      <span>{icon}</span>{label}
    </div>
  );
}

// ── Workflow Step ─────────────────────────────────────────────────────────────
function WorkflowStep({ num, title, desc, delay }: { num: string; title: string; desc: string; delay: number }) {
  return (
    <div className="animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      <div style={{
        width: '2.5rem', height: '2.5rem', borderRadius: '50%',
        background: 'linear-gradient(135deg, #0036ad, #1b4dd7)',
        color: '#fff', fontWeight: 800, fontSize: '0.875rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem'
      }}>{num}</div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ fontSize: '0.9375rem', color: 'var(--secondary)', lineHeight: 1.7 }}>{desc}</p>
    </div>
  );
}

// ── Testimonial Card ──────────────────────────────────────────────────────────
function TestimonialCard({ quote, name, role, color, delay }: { quote: string; name: string; role: string; color: string; delay: number }) {
  return (
    <div
      className="animate-fade-up"
      style={{
        animationDelay: `${delay}ms`,
        background: '#ffffff',
        borderRadius: '1rem',
        padding: '1.75rem',
        boxShadow: '0 8px 32px rgba(11,28,48,0.06)',
      }}
    >
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
        {[...Array(5)].map((_, i) => (
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
        ))}
      </div>
      <p style={{ fontSize: '0.9375rem', color: 'var(--on-surface-variant)', lineHeight: 1.7, marginBottom: '1.25rem', fontStyle: 'italic' }}>"{quote}"</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '2.25rem', height: '2.25rem', borderRadius: '50%',
          background: color, color: '#fff', fontWeight: 700, fontSize: '0.875rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>{name[0]}</div>
        <div>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--on-surface)' }}>{name}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{role}</p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { user, logout, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(248,249,255,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        boxShadow: scrolled ? '0 4px 24px rgba(11,28,48,0.06)' : 'none',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>

            {/* Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
              <Image
                src="/images/taskflow-logo.png"
                alt="TaskFlow logo"
                width={32}
                height={32}
                style={{ borderRadius: '0.5rem', objectFit: 'contain' }}
              />
              <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.02em' }}>
                TaskFlow
              </span>
            </Link>

            {/* Nav links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {['Features', 'Workflow', 'Testimonials'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} style={{
                  padding: '0.375rem 0.875rem', borderRadius: '0.5rem',
                  fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)',
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = 'var(--primary)'; (e.target as HTMLElement).style.background = 'var(--surface-container-low)'; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = 'var(--secondary)'; (e.target as HTMLElement).style.background = 'transparent'; }}
                >{item}</a>
              ))}
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {loading ? null : user ? (
                <>
                  <span style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>{user.name || user.email}</span>
                  <Link href="/dashboard" style={{
                    padding: '0.5rem 1.25rem', borderRadius: '0.375rem',
                    background: 'linear-gradient(135deg, #0036ad, #1b4dd7)',
                    color: '#fff', fontSize: '0.875rem', fontWeight: 600,
                    textDecoration: 'none', transition: 'opacity 0.2s',
                  }}>Open Dashboard</Link>
                  <button onClick={logout} style={{
                    fontSize: '0.875rem', color: 'var(--secondary)', background: 'none',
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  }}>Sign out</button>
                </>
              ) : (
                <>
                  <Link href="/sign-in" style={{
                    padding: '0.5rem 1rem', borderRadius: '0.375rem',
                    fontSize: '0.875rem', fontWeight: 500, color: 'var(--on-surface)',
                    textDecoration: 'none',
                  }}>Sign in</Link>
                  <Link href="/sign-up" style={{
                    padding: '0.5rem 1.25rem', borderRadius: '0.375rem',
                    background: 'linear-gradient(135deg, #0036ad, #1b4dd7)',
                    color: '#fff', fontSize: '0.875rem', fontWeight: 600,
                    textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,54,173,0.25)',
                    transition: 'all 0.2s',
                  }}>Get started free →</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: '8rem', paddingBottom: '5rem', position: 'relative', overflow: 'hidden' }}>

        {/* Background grid texture */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(0,54,173,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,54,173,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }} />

        {/* Radial glow */}
        <div style={{
          position: 'absolute', top: '-10rem', right: '-10rem', zIndex: 0,
          width: '40rem', height: '40rem', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,54,173,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-5rem', left: '-10rem', zIndex: 0,
          width: '30rem', height: '30rem', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,126,247,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>

            {/* Left — Copy */}
            <div>
              {/* Badge */}
              <div className="animate-fade-up" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.375rem 0.875rem', borderRadius: '9999px',
                background: 'var(--surface-container-low)',
                color: 'var(--primary)', fontSize: '0.8125rem', fontWeight: 600,
                marginBottom: '1.75rem', border: '1px solid rgba(0,54,173,0.12)',
              }}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#2d6a4f', display: 'inline-block',
                  boxShadow: '0 0 0 3px rgba(45,106,79,0.2)',
                }} />
                Now with real-time collaboration
              </div>

              {/* Headline */}
              <h1 className="animate-fade-up delay-100" style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                fontWeight: 900, lineHeight: 1.05,
                letterSpacing: '-0.03em', color: 'var(--on-surface)',
                marginBottom: '1.5rem',
              }}>
                The workspace<br />
                that moves at<br />
                <span className="shimmer-text">your pace.</span>
              </h1>

              {/* Sub */}
              <p className="animate-fade-up delay-200" style={{
                fontSize: '1.0625rem', color: 'var(--secondary)',
                lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: '26rem',
              }}>
                TaskFlow brings boards, timelines, docs, and your team into one precision-built workspace — designed for the way high-performing teams actually work.
              </p>

              {/* CTAs */}
              <div className="animate-fade-up delay-300" style={{ display: 'flex', gap: '0.875rem', alignItems: 'center', marginBottom: '3rem' }}>
                <Link href="/sign-up" style={{
                  padding: '0.75rem 1.75rem', borderRadius: '0.5rem',
                  background: 'linear-gradient(135deg, #0036ad, #1b4dd7)',
                  color: '#fff', fontSize: '0.9375rem', fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 8px 24px rgba(0,54,173,0.28)',
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  transition: 'all 0.2s',
                }}>
                  Start for free
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
                <Link href="/sign-in" style={{
                  padding: '0.75rem 1.25rem', borderRadius: '0.5rem',
                  fontSize: '0.9375rem', fontWeight: 500, color: 'var(--on-surface)',
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Watch demo
                </Link>
              </div>

              {/* Feature pills */}
              <div className="animate-fade-up delay-400" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <FeaturePill icon="⚡" label="Real-time sync" />
                <FeaturePill icon="🔒" label="JWT secured" />
                <FeaturePill icon="🧲" label="Drag & drop" />
                <FeaturePill icon="💬" label="Comments" />
                <FeaturePill icon="👥" label="Team boards" />
              </div>
            </div>

            {/* Right — Kanban preview */}
            <div className="animate-fade-up delay-200 animate-float" style={{ position: 'relative' }}>
              {/* Board chrome */}
              <div style={{
                background: 'var(--surface-container-low)',
                borderRadius: '1.25rem',
                padding: '1.25rem',
                boxShadow: '0 24px 64px rgba(11,28,48,0.12)',
              }}>
                {/* Chrome bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.875rem', borderBottom: '1px solid rgba(0,54,173,0.06)' }}>
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    {['#ff5f57','#febc2e','#28c840'].map(c => (
                      <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
                    ))}
                  </div>
                  <div style={{
                    flex: 1, height: '1.5rem', borderRadius: '0.375rem',
                    background: '#fff', marginLeft: '0.5rem',
                    display: 'flex', alignItems: 'center', paddingLeft: '0.625rem'
                  }}>
                    <span style={{ fontSize: '0.6875rem', color: '#999' }}>taskflow.app/boards/product-roadmap</span>
                  </div>
                </div>

                {/* Board title */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--on-surface)' }}>🚀 Product Roadmap</span>
                  <div style={{ display: 'flex', gap: '-0.375rem' }}>
                    {['#0036ad','#2d6a4f','#7c3aed'].map((c, i) => (
                      <div key={i} style={{
                        width: '1.75rem', height: '1.75rem', borderRadius: '50%',
                        background: c, border: '2px solid #eff4ff',
                        color: '#fff', fontSize: '0.625rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginLeft: i === 0 ? 0 : '-0.5rem',
                      }}>
                        {['A', 'B', 'C'][i]}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Three columns */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  {/* To Do */}
                  <div style={{ background: 'var(--surface-container)', borderRadius: '0.875rem', padding: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface)' }}>To Do</span>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--secondary)', background: '#fff', padding: '0 0.375rem', borderRadius: '9999px' }}>3</span>
                    </div>
                    <PreviewCard title="Auth flow redesign" label="Design" labelColor={{ bg: '#ede9fe', text: '#6d28d9' }} avatar="A" avatarColor="#7c3aed" delay={500} />
                    <PreviewCard title="API rate limiting" label="Backend" labelColor={{ bg: '#dcfce7', text: '#166534' }} avatar="B" avatarColor="#2d6a4f" delay={600} />
                    <PreviewCard title="Mobile nav" label="Frontend" labelColor={{ bg: '#dbeafe', text: '#1e40af' }} avatar="C" avatarColor="#0036ad" delay={700} />
                  </div>
                  {/* In Progress */}
                  <div style={{ background: 'var(--surface-container)', borderRadius: '0.875rem', padding: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface)' }}>In Progress</span>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--secondary)', background: '#fff', padding: '0 0.375rem', borderRadius: '9999px' }}>2</span>
                    </div>
                    <PreviewCard title="Real-time sync" label="Urgent" labelColor={{ bg: '#ffdad6', text: '#ba1a1a' }} avatar="A" avatarColor="#7c3aed" delay={550} />
                    <PreviewCard title="Dashboard V2" label="Feature" labelColor={{ bg: '#dbeafe', text: '#1e40af' }} avatar="B" avatarColor="#0036ad" delay={650} />
                  </div>
                  {/* Done */}
                  <div style={{ background: 'var(--surface-container)', borderRadius: '0.875rem', padding: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface)' }}>Done</span>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#2d6a4f', background: '#dcfce7', padding: '0 0.375rem', borderRadius: '9999px' }}>5</span>
                    </div>
                    <PreviewCard title="JWT auth system" label="Backend" labelColor={{ bg: '#dcfce7', text: '#166534' }} avatar="C" avatarColor="#2d6a4f" delay={600} />
                    <PreviewCard title="Kanban board" label="Feature" labelColor={{ bg: '#dbeafe', text: '#1e40af' }} avatar="A" avatarColor="#0036ad" delay={700} />
                  </div>
                </div>

                {/* Live badge */}
                <div style={{
                  marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.625rem', borderRadius: '0.625rem', background: '#fff',
                }}>
                  <div style={{ position: 'relative', width: '8px', height: '8px' }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#2d6a4f', opacity: 0.4, animation: 'pulse-ring 1.5s ease-out infinite' }} />
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2d6a4f' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2d6a4f' }}>3 teammates viewing live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--surface-container-low)', padding: '3.5rem 1.5rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {[
              { val: 12000, suffix: '+', label: 'Active teams', note: 'across 40+ countries' },
              { val: 98, suffix: '%', label: 'Uptime SLA', note: 'enterprise grade' },
              { val: 2400000, suffix: '+', label: 'Tasks completed', note: 'this month alone' },
              { val: 4.9, suffix: '/5', label: 'User rating', note: 'on G2 & Product Hunt' },
            ].map(({ val, suffix, label, note }) => (
              <div key={label} style={{
                background: '#fff', borderRadius: '1rem', padding: '1.75rem',
                boxShadow: '0 4px 16px rgba(11,28,48,0.04)', textAlign: 'center',
              }}>
                <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>
                  <AnimatedCounter end={typeof val === 'number' ? val : parseFloat(String(val)) * 10} suffix={suffix} />
                </div>
                <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.25rem' }}>{label}</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--secondary)' }}>{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.75rem' }}>CAPABILITIES</p>
            <h2 style={{ fontSize: 'clamp(1.875rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--on-surface)', marginBottom: '1rem' }}>
              Everything your team needs.<br />Nothing it doesn't.
            </h2>
            <p style={{ fontSize: '1.0625rem', color: 'var(--secondary)', maxWidth: '32rem', margin: '0 auto', lineHeight: 1.7 }}>
              Purpose-built features that integrate seamlessly — from first task to shipped product.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {[
              {
                icon: '⚡', title: 'Real-Time Collaboration',
                desc: 'Socket.io powered sync broadcasts every move, comment, and update across all connected clients in under 50ms.',
                tag: 'Live',
              },
              {
                icon: '🧲', title: 'Intuitive Drag & Drop',
                desc: 'Reorder cards across lists, reorder entire lists, with full optimistic updates and automatic rollback on errors.',
                tag: 'Interactive',
              },
              {
                icon: '🔐', title: 'Enterprise-Grade Security',
                desc: 'JWT authentication with bcrypt password hashing and per-board access control. Your data never leaves your control.',
                tag: 'Secure',
              },
              {
                icon: '💬', title: 'Threaded Comments',
                desc: 'Comment on any card with author avatars, relative timestamps, and clean deletion. Discussions stay close to the work.',
                tag: 'Team',
              },
              {
                icon: '🏷️', title: 'Smart Labels & Due Dates',
                desc: 'Tag tasks with colored labels and deadlines. Overdue items surface automatically with a prominent alert badge.',
                tag: 'Organized',
              },
              {
                icon: '👥', title: 'Member Management',
                desc: 'Invite teammates by email, assign them roles, and remove access instantly. Board visibility is always under control.',
                tag: 'Collab',
              },
            ].map(({ icon, title, desc, tag }, i) => (
              <div
                key={title}
                className="animate-fade-up"
                style={{
                  animationDelay: `${i * 80}ms`,
                  background: '#fff',
                  borderRadius: '1.25rem',
                  padding: '2rem',
                  boxShadow: '0 4px 24px rgba(11,28,48,0.05)',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(0,54,173,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(11,28,48,0.05)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: '3rem', height: '3rem', borderRadius: '0.875rem',
                    background: 'var(--surface-container-low)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.375rem',
                  }}>{icon}</div>
                  <span style={{
                    fontSize: '0.6875rem', fontWeight: 700, padding: '0.25rem 0.625rem',
                    borderRadius: '9999px', background: 'var(--surface-container-low)',
                    color: 'var(--primary)',
                  }}>{tag}</span>
                </div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.625rem' }}>{title}</h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--secondary)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workflow ─────────────────────────────────────────────────────── */}
      <section id="workflow" style={{ background: 'var(--surface-container-low)', padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.75rem' }}>WORKFLOW</p>
              <h2 style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.625rem)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--on-surface)', marginBottom: '1rem', lineHeight: 1.1 }}>
                From idea to<br />shipped in days.
              </h2>
              <p style={{ fontSize: '1.0625rem', color: 'var(--secondary)', lineHeight: 1.75, marginBottom: '3rem' }}>
                TaskFlow is built around a focused 4-step cycle that keeps your team aligned and your backlog clear.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                <WorkflowStep num="01" title="Create a Board" desc="Spin up a workspace for any project — product, marketing, or ops." delay={0} />
                <WorkflowStep num="02" title="Build your Lists" desc="Define columns like Backlog, In Progress, Review, and Done." delay={100} />
                <WorkflowStep num="03" title="Add & Assign Cards" desc="Create tasks with labels, due dates, and teammate assignments." delay={200} />
                <WorkflowStep num="04" title="Ship together" desc="Drag cards across the board. Everyone sees changes live." delay={300} />
              </div>
            </div>

            {/* Activity feed preview */}
            <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 16px 48px rgba(11,28,48,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--on-surface)' }}>Live Activity</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2d6a4f', animation: 'pulse-ring 1.5s ease-out infinite' }} />
                  <span style={{ fontSize: '0.75rem', color: '#2d6a4f', fontWeight: 600 }}>Live</span>
                </div>
              </div>
              {[
                { avatar: 'AK', color: '#0036ad', action: 'moved', card: 'Auth flow redesign', dest: 'In Review', time: '2s ago' },
                { avatar: 'SR', color: '#7c3aed', action: 'commented on', card: 'API rate limiting', dest: '', time: '18s ago' },
                { avatar: 'MJ', color: '#2d6a4f', action: 'created card', card: 'Mobile onboarding', dest: 'Backlog', time: '1m ago' },
                { avatar: 'TN', color: '#b45309', action: 'completed', card: 'Dashboard V2', dest: 'Done', time: '4m ago' },
                { avatar: 'AK', color: '#0036ad', action: 'set due date on', card: 'Real-time sync', dest: 'Apr 20', time: '8m ago' },
              ].map(({ avatar, color, action, card, dest, time }, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
                  padding: '0.875rem 0',
                  borderBottom: i < 4 ? '1px solid var(--surface-container-low)' : 'none',
                }}>
                  <div style={{
                    width: '2rem', height: '2rem', borderRadius: '50%', flexShrink: 0,
                    background: color, color: '#fff', fontSize: '0.625rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
                      <strong style={{ color: 'var(--on-surface)' }}>{avatar}</strong>{' '}
                      {action}{' '}
                      <strong style={{ color: 'var(--primary)' }}>{card}</strong>
                      {dest && <span style={{ color: 'var(--secondary)' }}> → {dest}</span>}
                    </p>
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--secondary)', flexShrink: 0 }}>{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section id="testimonials" style={{ padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.75rem' }}>TESTIMONIALS</p>
            <h2 style={{ fontSize: 'clamp(1.875rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--on-surface)' }}>
              Trusted by teams who ship.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            <TestimonialCard
              quote="TaskFlow replaced three separate tools for us. The real-time sync is genuinely magical — watching cards move across the board as my team works is something I never tire of."
              name="Arjun Mehta" role="CTO, Stealth Startup" color="#0036ad" delay={0} />
            <TestimonialCard
              quote="The UI is the most polished Kanban tool I've used. It genuinely feels like it was designed for engineers who care about aesthetics as much as performance."
              name="Sophia Reyes" role="Lead Engineer, FinTech" color="#7c3aed" delay={100} />
            <TestimonialCard
              quote="We went from chaos across 4 channels to one clear board in a week. The comment threading on cards alone saved us 5+ hours of standups per sprint."
              name="Marcus Chen" role="Product Manager, SaaS" color="#2d6a4f" delay={200} />
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '6rem 1.5rem', background: 'var(--surface-container-low)' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.375rem 0.875rem', borderRadius: '9999px',
            background: 'rgba(0,54,173,0.08)', color: 'var(--primary)',
            fontSize: '0.8125rem', fontWeight: 600, marginBottom: '2rem',
          }}>🎯 No credit card required</div>
          <h2 style={{
            fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
            fontWeight: 900, letterSpacing: '-0.03em',
            color: 'var(--on-surface)', marginBottom: '1.25rem', lineHeight: 1.1,
          }}>
            Your team is waiting.<br />Start shipping today.
          </h2>
          <p style={{ fontSize: '1.0625rem', color: 'var(--secondary)', lineHeight: 1.75, marginBottom: '2.5rem' }}>
            Join thousands of teams using TaskFlow to turn messy workflows into precise, collaborative momentum.
          </p>
          <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <Link href="/sign-up" style={{
              padding: '0.875rem 2.5rem', borderRadius: '0.5rem',
              background: 'linear-gradient(135deg, #0036ad, #1b4dd7)',
              color: '#fff', fontSize: '1rem', fontWeight: 700,
              textDecoration: 'none', boxShadow: '0 8px 32px rgba(0,54,173,0.28)',
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            }}>
              Get started — it's free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <Link href="/sign-in" style={{
              padding: '0.875rem 1.75rem', borderRadius: '0.5rem',
              fontSize: '1rem', fontWeight: 500, color: 'var(--on-surface)',
              textDecoration: 'none', background: '#fff',
              boxShadow: '0 4px 16px rgba(11,28,48,0.06)',
            }}>Sign in instead</Link>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--secondary)' }}>
            Free forever for small teams · No setup required · Real-time from day one
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ background: 'var(--on-surface)', color: 'rgba(255,255,255,0.5)', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Image
              src="/images/taskflow-logo.png"
              alt="TaskFlow logo"
              width={28}
              height={28}
              style={{ borderRadius: '0.375rem', objectFit: 'contain' }}
            />
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9375rem' }}>TaskFlow</span>
          </div>
          <p style={{ fontSize: '0.875rem' }}>
            Built with precision · Express · Next.js · Socket.io · PostgreSQL
          </p>
          <p style={{ fontSize: '0.8125rem' }}>© 2026 TaskFlow. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
