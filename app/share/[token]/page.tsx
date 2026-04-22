'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { FamilyTree, Member, Relationship } from '@/types';
import Link from 'next/link';

const TreeCanvas = dynamic(() => import('@/components/tree/TreeCanvas'), { ssr: false });

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<{ tree: FamilyTree; members: Member[]; relationships: Relationship[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/share/${token}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        setError(json.error || 'Tree not found');
      }
      setLoading(false);
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', background: 'var(--bg-deep)' }}>
        <div className="animate-spin" style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
        <span style={{ color: 'var(--text-secondary)' }}>Loading shared tree…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', background: 'var(--bg-deep)' }}>
        <div style={{ fontSize: '48px' }}>🔒</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Tree Not Available</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{error || 'This tree is private or does not exist.'}</p>
        <Link href="/login" className="btn-primary" style={{ textDecoration: 'none' }}>Sign in to FamilyRoot</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)' }}>
      {/* Header */}
      <div style={{ height: 56, background: 'rgba(26,25,46,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <span style={{ fontSize: '20px' }}>🌳</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>FamilyRoot</span>
        </Link>
        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
        <div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{data.tree.name}</span>
          <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>{data.members.length} members · Read-only</span>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '11px', padding: '3px 10px', background: 'rgba(110,231,183,0.1)', color: '#6ee7b7', border: '1px solid rgba(110,231,183,0.3)', borderRadius: '20px', fontWeight: 600 }}>
          👁️ View Only
        </span>
        <Link href="/register" className="btn-primary" style={{ textDecoration: 'none', height: 34, fontSize: '13px', padding: '0 14px' }}>
          Create your own →
        </Link>
      </div>

      {/* Canvas (read-only - no edit callbacks) */}
      <div style={{ flex: 1, position: 'relative' }}>
        <TreeCanvas
          members={data.members}
          relationships={data.relationships}
          onNodePositionChange={() => {}}
          onEditMember={() => {}}
          onDeleteMember={() => {}}
          onAddRelative={() => {}}
          onAddEdge={() => {}}
        />
      </div>
    </div>
  );
}
