'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: '/boards',
    label: 'Project Board',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
  },
  {
    href: '/mytasks',
    label: 'My Tasks',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    href: '/team',
    label: 'Team',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    href: '/calendar',
    label: 'Calendar',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
];

const BOTTOM_ITEMS = [
  {
    href: '/help',
    label: 'Help',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

interface SidebarProps {
  onNewBoard?: () => void;
}

export default function Sidebar({ onNewBoard }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const getInitials = (name: string | null, email: string) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return email[0].toUpperCase();
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside style={{
      width: '220px',
      minWidth: '220px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-container-lowest)',
      boxShadow: '1px 0 0 0 var(--surface-container)',
      zIndex: 20,
    }}>
      {/* Logo + Workspace */}
      <div style={{ padding: '1.5rem 1.25rem 1rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none', marginBottom: '0.25rem' }}>
          <Image
            src="/images/taskflow-logo.png"
            alt="TaskFlow"
            width={28}
            height={28}
            style={{ borderRadius: '0.375rem', objectFit: 'contain' }}
          />
          <div>
            <p style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>TaskFlow</p>
            <p style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Workspace</p>
          </div>
        </Link>
      </div>

      {/* New Board Button */}
      <div style={{ padding: '0 1rem 1.25rem' }}>
        <button
          onClick={onNewBoard}
          style={{
            width: '100%',
            padding: '0.625rem 1rem',
            borderRadius: '0.625rem',
            border: 'none',
            background: 'linear-gradient(135deg, #0036ad, #1b4dd7)',
            color: '#fff',
            fontSize: '0.8125rem',
            fontWeight: 700,
            fontFamily: "'Inter', sans-serif",
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.375rem',
            boxShadow: '0 4px 12px rgba(0,54,173,0.25)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New Board
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 0.75rem', overflowY: 'auto' }}>
        <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--secondary)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 0.5rem', marginBottom: '0.5rem' }}>Menu</p>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link
                  href={href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    padding: '0.5625rem 0.75rem',
                    borderRadius: '0.625rem',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--primary)' : 'var(--secondary)',
                    background: isActive ? 'var(--surface-container-low)' : 'transparent',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'var(--surface-container-low)'; (e.currentTarget as HTMLElement).style.color = 'var(--on-surface)'; } }}
                  onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--secondary)'; } }}
                >
                  <span style={{ opacity: isActive ? 1 : 0.7 }}>{icon}</span>
                  {label}
                  {isActive && (
                    <div style={{ marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)' }} />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom — help + user */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--surface-container)' }}>
        {BOTTOM_ITEMS.map(({ href, label, icon }) => (
          <Link key={href} href={href} style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.5rem 0.75rem', borderRadius: '0.625rem',
            textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
            color: 'var(--secondary)', marginBottom: '0.125rem',
            transition: 'all 0.15s',
          }}>
            {icon}{label}
          </Link>
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.5rem 0.75rem', borderRadius: '0.625rem',
            fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)',
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif", width: '100%',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--error)'; (e.currentTarget as HTMLElement).style.background = 'var(--error-container)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--secondary)'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>

        {/* User info */}
        {user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.625rem 0.75rem', marginTop: '0.5rem',
            borderRadius: '0.625rem', background: 'var(--surface-container-low)',
          }}>
            <div style={{
              width: '1.875rem', height: '1.875rem', borderRadius: '50%',
              background: 'linear-gradient(135deg, #0036ad, #1b4dd7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0,
            }}>{getInitials(user.name, user.email)}</div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--on-surface)', truncate: true, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || 'User'}</p>
              <p style={{ fontSize: '0.6875rem', color: 'var(--secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
