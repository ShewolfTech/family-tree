'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const res = await api.register(name, email, password);
      if (res.success && res.data) {
        const { user, token } = res.data as { user: User; token: string };
        setAuth(user, token);
        toast.success('Welcome to FamilyRoot!');
        router.push('/dashboard');
      } else {
        toast.error(res.error || 'Registration failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px', boxShadow: '0 8px 32px rgba(167,139,250,0.4)' }}>🌳</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>FamilyRoot</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>Create your account to begin</p>
      </div>
      <div className="glass" style={{ borderRadius: '20px', padding: '32px' }}>
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { label: 'Full Name', type: 'text', value: name, set: setName, placeholder: 'Your name', autoComplete: 'name' },
            { label: 'Email', type: 'email', value: email, set: setEmail, placeholder: 'you@example.com', autoComplete: 'email' },
            { label: 'Password', type: 'password', value: password, set: setPassword, placeholder: '8+ characters', autoComplete: 'new-password' },
            { label: 'Confirm Password', type: 'password', value: confirm, set: setConfirm, placeholder: 'Repeat password', autoComplete: 'new-password' },
          ].map(({ label, type, value, set, placeholder, autoComplete }) => (
            <div key={label}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
              <input
                type={type}
                className="form-input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => set(e.target.value)}
                required
                autoComplete={autoComplete}
              />
            </div>
          ))}
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: '44px', marginTop: '4px' }}>
            {loading ? <span className="animate-spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)', fontSize: '14px' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
