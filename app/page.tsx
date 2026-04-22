'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, router]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 60% 0%, rgba(124,92,219,0.2) 0%, transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(167,139,250,0.12) 0%, transparent 50%), var(--bg-deep)',
      padding: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '60px 60px', opacity: 0.25,
      }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 640 }} className="animate-fade-in">
        <div style={{
          width: 80, height: 80, borderRadius: '24px',
          background: 'linear-gradient(135deg, #a78bfa, #6d28d9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px',
          margin: '0 auto 28px', boxShadow: '0 16px 48px rgba(167,139,250,0.5)',
        }}>🌳</div>
        <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.05, color: '#ede9f8', marginBottom: '20px' }}>
          Your family&apos;s story,<br /><span style={{ color: '#a78bfa' }}>beautifully mapped.</span>
        </h1>
        <p style={{ fontSize: '18px', color: '#9b96c2', lineHeight: 1.6, maxWidth: 480, margin: '0 auto 40px' }}>
          Build interactive family trees, discover connections, and preserve your heritage for generations to come.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" className="btn-primary" style={{ textDecoration: 'none', fontSize: '16px', padding: '14px 32px', borderRadius: '12px' }}>Get Started Free</Link>
          <Link href="/login" className="btn-secondary" style={{ textDecoration: 'none', fontSize: '16px', padding: '14px 32px', borderRadius: '12px' }}>Sign In</Link>
        </div>
        <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginTop: '52px', flexWrap: 'wrap' }}>
          {['🌳 Interactive Trees', '📱 Works Offline', '🔗 Shareable Links', '👥 Collaboration'].map((f) => (
            <span key={f} style={{ color: '#9b96c2', fontSize: '14px' }}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
