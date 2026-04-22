'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.success && res.data) {
        const { user, token } = res.data as { user: User; token: string };
        setAuth(user, token);
        toast.success(`Welcome back, ${user.name}!`);
        router.push('/dashboard');
      } else {
        toast.error(res.error || 'Login failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setResetLoading(true);
    try {
      const res = await api.requestPasswordReset(resetEmail);
      if (res.success) {
        toast.success('Reset link sent! Check your email.');
        setShowReset(false);
      } else {
        toast.error(res.error || 'Request failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '16px', background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', fontSize: '28px',
          boxShadow: '0 8px 32px rgba(167,139,250,0.4)',
        }}>🌳</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          FamilyRoot
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
          Sign in to your family tree
        </p>
      </div>

      {!showReset ? (
        <div className="glass" style={{ borderRadius: '20px', padding: '32px' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowReset(true)} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                Forgot password?
              </button>
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: '44px' }}>
              {loading ? <span className="animate-spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> : 'Sign In'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            No account?{' '}
            <Link href="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              Create one
            </Link>
          </p>
        </div>
      ) : (
        <div className="glass animate-scale-in" style={{ borderRadius: '20px', padding: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Reset Password</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Enter your email and we'll send a reset link.</p>
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" disabled={resetLoading} style={{ width: '100%', height: '44px' }}>
              {resetLoading ? 'Sending…' : 'Send Reset Link'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowReset(false)} style={{ width: '100%' }}>
              Back to Login
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
