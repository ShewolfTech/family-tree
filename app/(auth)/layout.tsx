export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 60% 0%, rgba(124,92,219,0.18) 0%, transparent 60%), radial-gradient(ellipse at 10% 80%, rgba(167,139,250,0.1) 0%, transparent 50%), var(--bg-deep)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '60px 60px', opacity: 0.3,
      }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}>
        {children}
      </div>
    </div>
  );
}
