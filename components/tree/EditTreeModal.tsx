'use client';
import { useState } from 'react';
import { FamilyTree } from '@/types';

interface EditTreeModalProps {
  tree: FamilyTree;
  onClose: () => void;
  onSave: (data: Partial<FamilyTree>) => Promise<void>;
}

export default function EditTreeModal({ tree, onClose, onSave }: EditTreeModalProps) {
  const [name, setName] = useState(tree.name);
  const [description, setDescription] = useState(tree.description || '');
  const [isPublic, setIsPublic] = useState(tree.isPublic);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSave({ name, description, isPublic });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700 }}>Edit Tree</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tree Name *</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
            <textarea className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '10px' }}>
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Public tree</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Anyone with the link can view this tree</div>
            </div>
          </label>
          {isPublic && tree.shareToken && (
            <div style={{ padding: '10px 14px', background: 'rgba(167,139,250,0.08)', border: '1px solid var(--border)', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Share link</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                {window.location.origin}/share/{tree.shareToken}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading || !name.trim()}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
