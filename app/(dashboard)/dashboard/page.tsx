'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useTreeStore } from '@/store/treeStore';
import { FamilyTree } from '@/types';
import { format } from 'date-fns';

function TreeCard({ tree, onDelete }: { tree: FamilyTree; onDelete: (id: string) => void }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Delete "${tree.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    const res = await api.deleteTree(tree._id);
    if (res.success) { toast.success('Tree deleted'); onDelete(tree._id); }
    else { toast.error(res.error || 'Delete failed'); setDeleting(false); }
  }

  return (
    <div
      onClick={() => router.push(`/tree/${tree._id}`)}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
        cursor: 'pointer',
        transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(167,139,250,0.15)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ fontSize: '32px' }}>🌳</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {tree.isPublic && (
            <span style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(110,231,183,0.15)', color: '#6ee7b7', border: '1px solid rgba(110,231,183,0.3)', borderRadius: '20px', fontWeight: 600 }}>
              Public
            </span>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '16px', padding: '4px', lineHeight: 1 }}
            title="Delete tree"
          >
            🗑️
          </button>
        </div>
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', letterSpacing: '-0.3px' }}>
        {tree.name}
      </h3>
      {tree.description && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {tree.description}
        </p>
      )}
      <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
          👥 {tree.memberCount || 0} members
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
          📅 {format(new Date(tree.updatedAt), 'MMM d, yyyy')}
        </span>
      </div>
    </div>
  );
}

function CreateTreeModal({ onClose, onCreate }: { onClose: () => void; onCreate: (tree: FamilyTree) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name is required'); return; }
    setLoading(true);
    try {
      const res = await api.createTree({ name, description, isPublic });
      if (res.success && res.data) {
        toast.success('Tree created!');
        onCreate(res.data as FamilyTree);
      } else {
        toast.error(res.error || 'Failed to create tree');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>New Family Tree</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Start building your family legacy</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tree Name *</label>
            <input className="form-input" placeholder="e.g. The Johnson Family" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
            <textarea className="form-input" placeholder="A brief description of this family tree…" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Make this tree publicly viewable</span>
          </label>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create Tree'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { trees, setTrees, removeTree, addTree } = useTreeStore();
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await api.getTrees();
      if (res.success && res.data) setTrees(res.data as FamilyTree[]);
      setLoading(false);
    }
    load();
  }, [setTrees]);

  return (
    <div style={{ flex: 1, padding: '40px 24px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, letterSpacing: '-1px', color: 'var(--text-primary)', lineHeight: 1.1 }}>
            Your Family Trees
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>
            {trees.length === 0 ? 'Create your first tree to get started' : `${trees.length} tree${trees.length !== 1 ? 's' : ''} in your collection`}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)} style={{ flexShrink: 0 }}>
          + New Tree
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 180 }} />)}
        </div>
      ) : trees.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🌱</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>No trees yet</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Start building your family legacy today.</p>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>Create your first tree</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }} className="animate-fade-in">
          {trees.map((tree) => (
            <TreeCard key={tree._id} tree={tree} onDelete={removeTree} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateTreeModal
          onClose={() => setShowCreate(false)}
          onCreate={(tree) => { addTree(tree); setShowCreate(false); }}
        />
      )}
    </div>
  );
}
