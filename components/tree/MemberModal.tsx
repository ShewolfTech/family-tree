'use client';
import { useState } from 'react';
import { Member, Gender } from '@/types';

interface MemberModalProps {
  member?: Member;
  treeId: string;
  onClose: () => void;
  onSave: (data: Partial<Member>) => Promise<void>;
}

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: '♂ Male' },
  { value: 'female', label: '♀ Female' },
  { value: 'other', label: '⚧ Other' },
  { value: 'unknown', label: '? Unknown' },
];

export default function MemberModal({ member, onClose, onSave }: MemberModalProps) {
  const [form, setForm] = useState({
    firstName: member?.firstName || '',
    lastName: member?.lastName || '',
    gender: (member?.gender || 'unknown') as Gender,
    dateOfBirth: member?.dateOfBirth ? member.dateOfBirth.split('T')[0] : '',
    dateOfDeath: member?.dateOfDeath ? member.dateOfDeath.split('T')[0] : '',
    isAlive: member?.isAlive !== false,
    bio: member?.bio || '',
    birthPlace: member?.birthPlace || '',
    occupation: member?.occupation || '',
    photo: member?.photo || '',
  });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'basic' | 'details'>('basic');

  function set(key: string, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) return;
    setLoading(true);
    try {
      await onSave({
        ...form,
        dateOfBirth: form.dateOfBirth || undefined,
        dateOfDeath: form.dateOfDeath || undefined,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700 }}>
            {member ? 'Edit Member' : 'Add Member'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--bg-elevated)', padding: '4px', borderRadius: '10px' }}>
          {(['basic', 'details'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '7px', borderRadius: '7px', border: 'none', cursor: 'pointer',
              background: tab === t ? 'var(--bg-card)' : 'transparent',
              color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
              transition: 'background 0.2s',
              textTransform: 'capitalize',
            }}>{t}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {tab === 'basic' ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="field-label">First Name *</label>
                  <input className="form-input" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="First name" required autoFocus />
                </div>
                <div>
                  <label className="field-label">Last Name *</label>
                  <input className="form-input" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Last name" required />
                </div>
              </div>
              <div>
                <label className="field-label">Gender</label>
                <select className="form-input" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                  {GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="field-label">Date of Birth</label>
                  <input type="date" className="form-input" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} />
                </div>
                <div>
                  <label className="field-label">Date of Death</label>
                  <input type="date" className="form-input" value={form.dateOfDeath} onChange={(e) => set('dateOfDeath', e.target.value)} disabled={form.isAlive} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isAlive} onChange={(e) => { set('isAlive', e.target.checked); if (e.target.checked) set('dateOfDeath', ''); }}
                  style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Currently alive</span>
              </label>
            </>
          ) : (
            <>
              <div>
                <label className="field-label">Birth Place</label>
                <input className="form-input" value={form.birthPlace} onChange={(e) => set('birthPlace', e.target.value)} placeholder="City, Country" />
              </div>
              <div>
                <label className="field-label">Occupation</label>
                <input className="form-input" value={form.occupation} onChange={(e) => set('occupation', e.target.value)} placeholder="e.g. Engineer, Teacher…" />
              </div>
              <div>
                <label className="field-label">Photo URL</label>
                <input className="form-input" value={form.photo} onChange={(e) => set('photo', e.target.value)} placeholder="https://…" />
              </div>
              <div>
                <label className="field-label">Biography</label>
                <textarea className="form-input" value={form.bio} onChange={(e) => set('bio', e.target.value)} placeholder="A short biography…" rows={4} style={{ resize: 'vertical' }} />
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border)', marginTop: '4px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading || !form.firstName.trim() || !form.lastName.trim()}>
              {loading ? 'Saving…' : member ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>

      <style>{`.field-label { display: block; font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.05em; }`}</style>
    </div>
  );
}
