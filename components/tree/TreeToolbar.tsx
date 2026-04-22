'use client';
import { FamilyTree } from '@/types';

interface TreeToolbarProps {
  tree: FamilyTree;
  onAddMember: () => void;
  onExport: () => void;
  onShare: () => void;
  onEditTree: () => void;
  onBack: () => void;
  saving: boolean;
  memberCount: number;
}

export default function TreeToolbar({
  tree, onAddMember, onExport, onShare, onEditTree, onBack, saving, memberCount
}: TreeToolbarProps) {
  return (
    <div style={{
      height: 56, background: 'rgba(26,25,46,0.95)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center',
      padding: '0 16px', gap: '8px', flexShrink: 0, zIndex: 10,
    }}>
      {/* Back */}
      <button onClick={onBack} className="btn-ghost" style={{ padding: '6px 10px', marginRight: '4px' }}>
        ← Back
      </button>

      <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

      {/* Tree info */}
      <div style={{ flex: 1, minWidth: 0, marginLeft: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {tree.name}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>
            {memberCount} member{memberCount !== 1 ? 's' : ''}
          </span>
          {saving && (
            <span style={{ fontSize: '11px', color: 'var(--accent)', flexShrink: 0 }}>
              <span className="animate-spin" style={{ display: 'inline-block', width: 10, height: 10, border: '1.5px solid var(--accent-glow)', borderTopColor: 'var(--accent)', borderRadius: '50%', marginRight: 4 }} />
              saving…
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
        <button onClick={onAddMember} className="btn-primary" style={{ height: 34, padding: '0 14px', fontSize: '13px' }}>
          + Add Member
        </button>
        <button onClick={onEditTree} className="btn-secondary" style={{ height: 34, padding: '0 12px', fontSize: '13px' }}>
          ✏️ Edit
        </button>
        <button onClick={onShare} className="btn-secondary" style={{ height: 34, padding: '0 12px', fontSize: '13px' }}>
          🔗 Share
        </button>
        <button onClick={onExport} className="btn-secondary" style={{ height: 34, padding: '0 12px', fontSize: '13px' }}>
          ⬇️ Export
        </button>
      </div>
    </div>
  );
}
