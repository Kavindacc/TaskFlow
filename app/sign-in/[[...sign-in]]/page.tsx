'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// ── Floating task card for the visual panel ───────────────────────────────────
function FloatingCard({
  title, status, color, avatars, top, left, right, delay,
}: {
  title: string; status: string; color: string;
  avatars: string[]; top?: string; left?: string; right?: string; delay: number;
}) {
  return (
    <div style={{
      position: 'absolute', top, left, right,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      borderRadius: '0.875rem',
      padding: '0.875rem 1rem',
      boxShadow: '0 8px 32px rgba(11,28,48,0.12)',
      minWidth: '180px',
      animation: `fade-up 0.6s ease-out ${delay}ms both`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{status}</span>
      </div>
      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0b1c30', marginBottom: '0.625rem', lineHeight: 1.4 }}>{title}</p>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {avatars.map((a, i) => (
          <div key={i} style={{
            width: '1.375rem', height: '1.375rem', borderRadius: '50%',
            background: ['#0036ad','#7c3aed','#2d6a4f','#b45309'][i % 4],
            border: '2px solid rgba(255,255,255,0.9)',
            marginLeft: i === 0 ? 0 : '-0.375rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '0.5625rem', fontWeight: 700,
          }}>{a}</div>
        ))}
      </div>
    </div>
  );
}

// ── Stat badge ───────────────────────────────────────────────────────────────
function StatBadge({ val, label, delay }: { val: string; label: string; delay: number }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.15)',
      backdropFilter: 'blur(8px)',
      borderRadius: '0.75rem',
      padding: '0.75rem 1rem',
      textAlign: 'center',
      animation: `fade-up 0.6s ease-out ${delay}ms both`,
    }}>
      <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>{val}</p>
      <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{label}</p>
    </div>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string) => ({
    width: '100%',
    padding: '0.875rem 1rem',
    borderRadius: '0.625rem',
    border: 'none',
    outline: 'none',
    background: focused === field ? '#fff' : '#f0f4ff',
    fontSize: '0.9375rem',
    color: '#0b1c30',
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.2s',
    boxShadow: focused === field ? '0 0 0 3px rgba(0,54,173,0.15)' : 'none',
  });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      fontFamily: "'Inter', sans-serif",
      background: 'var(--surface)',
    }}>
      {/* ── Left Panel — Visual ─────────────────────────────────────────── */}
      <div style={{
        width: '48%', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, #0036ad 0%, #0b1c30 60%, #1a0a3c 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '3rem',
      }}>
        {/* Mesh grid */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '-8rem', right: '-8rem', width: '28rem', height: '28rem', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,126,247,0.25) 0%, transparent 70%)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '-5rem', left: '-5rem', width: '20rem', height: '20rem', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', zIndex: 0 }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <Image src="/images/taskflow-logo.png" alt="TaskFlow" width={32} height={32} style={{ borderRadius: '0.5rem', objectFit: 'contain' }} />
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>TaskFlow</span>
          </Link>
        </div>

        {/* Floating cards */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <FloatingCard title="Auth flow redesign" status="In Review" color="#4f7ef7" avatars={['A','S']} top="18%" left="1.5rem" delay={200} />
          <FloatingCard title="Launch dashboard V2" status="Done" color="#2d6a4f" avatars={['M','T','R']} top="38%" right="1.5rem" delay={350} />
          {/* <FloatingCard title="API rate limiting" status="Urgent" color="#ba1a1a" avatars={['J']} top="60%" left="2.5rem" delay={500} /> */}
        </div>

        {/* Bottom copy + stats */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: '2rem', fontWeight: 900, color: '#fff',
            letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '0.875rem',
          }}>
            Your team's entire<br />workflow, unified.
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '22rem' }}>
            Real-time boards, smart cards, and team collaboration : all in one precision built workspace.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <StatBadge val="12k+" label="Teams" delay={400} />
            <StatBadge val="98%" label="Uptime" delay={500} />
            <StatBadge val="50ms" label="Sync speed" delay={600} />
          </div>
        </div>
      </div>

      {/* ── Right Panel — Form ──────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '3rem 4rem',
        background: 'var(--surface)',
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          {/* Heading */}
          <div style={{ marginBottom: '2.5rem' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.5rem' }}>Welcome back</p>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--on-surface)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '0.625rem' }}>
              Sign in to<br />your workspace
            </h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--secondary)' }}>
              Don't have an account?{' '}
              <Link href="/sign-up" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                Create one free →
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '0.375rem' }}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                placeholder="you@company.com"
                required
                style={inputStyle('email')}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '0.375rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••••"
                  required
                  style={{ ...inputStyle('password'), paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1rem', borderRadius: '0.625rem',
                background: 'var(--error-container)', color: 'var(--error)',
                fontSize: '0.875rem', fontWeight: 500,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                padding: '0.9375rem',
                borderRadius: '0.625rem',
                border: 'none',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #0036ad, #1b4dd7)',
                color: '#fff',
                fontSize: '0.9375rem',
                fontWeight: 700,
                fontFamily: "'Inter', sans-serif",
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(0,54,173,0.28)',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              {loading ? (
                <>
                  <svg style={{ animation: 'spin 1s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Signing in...
                </>
              ) : 'Sign in to workspace →'}
            </button>
          </form>

          {/* Back link */}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link href="/" style={{ fontSize: '0.8125rem', color: 'var(--secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
