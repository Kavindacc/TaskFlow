'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// ── Password strength meter ───────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const strength = checks.filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#ba1a1a', '#b45309', '#0036ad', '#2d6a4f'];

  if (!password) return null;
  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: '3px', borderRadius: '9999px',
            background: i <= strength ? colors[strength] : '#e2e8f0',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color: colors[strength], fontWeight: 600 }}>
        {labels[strength]}
      </p>
    </div>
  );
}

// ── Feature checklist for left panel ─────────────────────────────────────────
function CheckItem({ label, delay }: { label: string; delay: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.625rem',
      animation: `fade-up 0.6s ease-out ${delay}ms both`,
    }}>
      <div style={{
        width: '1.25rem', height: '1.25rem', borderRadius: '50%', flexShrink: 0,
        background: 'rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError('');
    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.name);
      setSuccess(true);
      setTimeout(() => router.push('/sign-in'), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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

      {/* ── Right Panel — Form (swapped for variety) ────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '3rem 4rem',
        background: 'var(--surface)',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {success ? (
            /* ── Success state ── */
            <div style={{ textAlign: 'center', animation: 'fade-up 0.5s ease-out both' }}>
              <div style={{
                width: '4rem', height: '4rem', borderRadius: '50%',
                background: 'linear-gradient(135deg, #2d6a4f, #40916c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: '0 8px 24px rgba(45,106,79,0.3)',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>You're in!</h2>
              <p style={{ color: 'var(--secondary)', fontSize: '0.9375rem' }}>Account created. Redirecting to sign in...</p>
            </div>
          ) : (
            <>
              {/* Heading */}
              <div style={{ marginBottom: '2.5rem' }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.5rem' }}>Get started free</p>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--on-surface)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '0.625rem' }}>
                  Build your<br />workspace today
                </h1>
                <p style={{ fontSize: '0.9375rem', color: 'var(--secondary)' }}>
                  Already have an account?{' '}
                  <Link href="/sign-in" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                    Sign in →
                  </Link>
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '0.375rem' }}>Full name</label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused(null)}
                    placeholder="Alex Johnson"
                    required
                    style={inputStyle('name')}
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '0.375rem' }}>Work email</label>
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
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '0.375rem' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="password"
                      type={showPass ? 'text' : 'password'}
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      onFocus={() => setFocused('password')}
                      onBlur={() => setFocused(null)}
                      placeholder="Min. 6 characters"
                      required
                      minLength={6}
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
                  <PasswordStrength password={formData.password} />
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
                      Creating account...
                    </>
                  ) : 'Create free account →'}
                </button>

                <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', textAlign: 'center', lineHeight: 1.6 }}>
                  By creating an account you agree to our Terms of Service. No credit card required.
                </p>
              </form>

              {/* Back link */}
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <Link href="/" style={{ fontSize: '0.8125rem', color: 'var(--secondary)', textDecoration: 'none' }}>
                  ← Back to home
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Right Visual Panel (flipped side for sign-up) ───────────────── */}
      <div style={{
        width: '48%', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, #1a0a3c 0%, #0b1c30 40%, #0036ad 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '3rem',
      }}>
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '-6rem', left: '-6rem', width: '24rem', height: '24rem', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '-4rem', right: '-4rem', width: '18rem', height: '18rem', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,126,247,0.2) 0%, transparent 70%)', zIndex: 0 }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <Image src="/images/taskflow-logo.png" alt="TaskFlow" width={32} height={32} style={{ borderRadius: '0.5rem', objectFit: 'contain' }} />
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>TaskFlow</span>
          </Link>
        </div>

        {/* Mini board preview */}
        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(16px)',
            borderRadius: '1.25rem',
            padding: '1.25rem',
            width: '100%', maxWidth: '320px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>🚀 My First Board</span>
              <div style={{ display: 'flex', gap: '-0.25rem' }}>
                {['#0036ad','#7c3aed'].map((c,i) => (
                  <div key={i} style={{ width:'1.5rem',height:'1.5rem',borderRadius:'50%',background:c,border:'2px solid rgba(255,255,255,0.2)',marginLeft:i===0?0:'-0.375rem',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'0.5rem',fontWeight:700 }}>{['Y','?'][i]}</div>
                ))}
              </div>
            </div>
            {[
              { list: 'To Do', cards: ['Set up workspace', 'Invite team'], count: 2 },
              { list: 'In Progress', cards: ['Onboarding flow'], count: 1 },
            ].map(({ list, cards, count }) => (
              <div key={list} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '0.75rem', marginBottom: '0.625rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{list}</span>
                  <span style={{ fontSize: '0.625rem', background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', borderRadius: '9999px', padding: '0 0.375rem', fontWeight: 600 }}>{count}</span>
                </div>
                {cards.map(card => (
                  <div key={card} style={{ background: 'rgba(255,255,255,0.92)', borderRadius: '0.5rem', padding: '0.5rem 0.625rem', marginBottom: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#0b1c30' }}>{card}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom copy */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1.5rem' }}>
            Free forever<br />for small teams.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <CheckItem label="Unlimited boards & cards" delay={200} />
            <CheckItem label="Real-time collaboration" delay={300} />
            <CheckItem label="Comments & labels" delay={400} />
            <CheckItem label="Team member invitations" delay={500} />
            <CheckItem label="No credit card required" delay={600} />
          </div>
        </div>
      </div>
    </div>
  );
}
