'use client';
import { useState } from 'react';
import { Member, RelationshipType } from '@/types';

interface RelationshipModalProps {
  sourceMember: Member;
  members: Member[];
  onClose: () => void;
  onSave: (data: { type: RelationshipType; sourceId: string; targetId: string; notes?: string }) => Promise<void>;
}

const REL_TYPES: { value: RelationshipType; label: string; description: string; emoji: string }[] = [
  { value: 'parent-child', label: 'Parent → Child', description: 'Source is the parent of target', emoji: '👨‍👦' },
  { value: 'spouse', label: 'Spouse / Partner', description: 'Married or partnered relationship', emoji: '💑' },
  { value: 'sibling', label: 'Sibling', description: 'Brothers, sisters, or siblings', emoji: '👫' },
];

export default function RelationshipModal({ sourceMember, members, onClose, onSave }: RelationshipModalProps) {
  const [type, setType] = useState<RelationshipType>('parent-child');
  const [targetId, setTargetId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const otherMembers = members.filter((m) => m._id !== sourceMember._id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!targetId) return;
    setLoading(true);
    try {
      await onSave({ type, sourceId: sourceMember._id, targetId, notes: notes || undefined });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700 }}>Add Relationship</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Source member chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: '10px', marginBottom: '20px', border: '1px solid var(--accent)' }}>
          <span style={{ fontSize: '18px' }}>👤</span>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>From</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sourceMember.firstName} {sourceMember.lastName}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Relationship type */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Relationship Type</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {REL_TYPES.map((rt) => (
                <label key={rt.value} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                  background: type === rt.value ? 'rgba(167,139,250,0.1)' : 'var(--bg-elevated)',
                  border: `1px solid ${type === rt.value ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <input type="radio" name="type" value={rt.value} checked={type === rt.value}
                    onChange={() => setType(rt.value)} style={{ accentColor: 'var(--accent)' }} />
                  <span style={{ fontSize: '20px' }}>{rt.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{rt.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{rt.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Target member */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Member *</label>
            <select className="form-input" value={targetId} onChange={(e) => setTargetId(e.target.value)} required>
              <option value="">— Select a member —</option>
              {otherMembers.map((m) => (
                <option key={m._id} value={m._id}>{m.firstName} {m.lastName}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes (optional)</label>
            <input className="form-input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Married in 1985…" />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading || !targetId}>
              {loading ? 'Adding…' : 'Add Relationship'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
