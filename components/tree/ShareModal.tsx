'use client';
import { useState } from 'react';
import { FamilyTree } from '@/types';
import toast from 'react-hot-toast';

interface ShareModalProps {
  tree: FamilyTree;
  onClose: () => void;
  onTogglePublic: (isPublic: boolean) => Promise<void>;
}

export default function ShareModal({ tree, onClose, onTogglePublic }: ShareModalProps) {
  const [toggling, setToggling] = useState(false);
  const shareUrl = `${window.location.origin}/share/${tree.shareToken}`;

  async function handleToggle() {
    setToggling(true);
    try {
      await onTogglePublic(!tree.isPublic);
    } finally {
      setToggling(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700 }}>Share Tree</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Toggle public */}
        <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
              {tree.isPublic ? '🌍 Public' : '🔒 Private'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {tree.isPublic ? 'Anyone with the link can view' : 'Only you can access this tree'}
            </div>
          </div>
          <button onClick={handleToggle} disabled={toggling} className={tree.isPublic ? 'btn-secondary' : 'btn-primary'} style={{ fontSize: '13px', height: 34, padding: '0 14px' }}>
            {toggling ? '…' : tree.isPublic ? 'Make Private' : 'Make Public'}
          </button>
        </div>

        {/* Share link */}
        {tree.isPublic && (
          <div className="animate-fade-in">
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Share Link</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                readOnly value={shareUrl} className="form-input"
                style={{ fontSize: '12px', fontFamily: 'monospace' }}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button onClick={copyLink} className="btn-primary" style={{ flexShrink: 0, height: 40, padding: '0 14px', fontSize: '13px' }}>
                Copy
              </button>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Anyone with this link can view the tree in read-only mode.
            </p>
          </div>
        )}

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
