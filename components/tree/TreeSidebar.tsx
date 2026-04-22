'use client';
import { useState } from 'react';
import { Member, Relationship } from '@/types';

interface TreeSidebarProps {
  members: Member[];
  relationships: Relationship[];
  onAddMember: () => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onDeleteRelationship: (id: string) => void;
  onFocusMember: (member: Member) => void;
}

const genderEmoji: Record<string, string> = { male: '♂', female: '♀', other: '⚧', unknown: '?' };

export default function TreeSidebar({
  members, relationships, onAddMember, onEditMember, onDeleteMember, onDeleteRelationship, onFocusMember
}: TreeSidebarProps) {
  const [tab, setTab] = useState<'members' | 'relationships'>('members');
  const [search, setSearch] = useState('');

  const filtered = members.filter((m) =>
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  function getMemberName(id: string) {
    const m = members.find((m) => m._id === id);
    return m ? `${m.firstName} ${m.lastName}` : 'Unknown';
  }

  const relTypeLabel: Record<string, string> = {
    'parent-child': '👨‍👦 Parent→Child',
    'spouse': '💑 Spouse',
    'sibling': '👫 Sibling',
  };

  return (
    <div style={{
      width: 280, background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0,
    }}>
      {/* Tab bar */}
      <div style={{ padding: '16px 16px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-elevated)', padding: '4px', borderRadius: '10px', marginBottom: '12px' }}>
          {(['members', 'relationships'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '6px', borderRadius: '7px', border: 'none', cursor: 'pointer',
              background: tab === t ? 'var(--bg-card)' : 'transparent',
              color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600,
              transition: 'background 0.2s', textTransform: 'capitalize',
            }}>{t}</button>
          ))}
        </div>

        {tab === 'members' && (
          <input
            className="form-input"
            placeholder="Search members…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: '12px', fontSize: '13px' }}
          />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {tab === 'members' ? (
          <>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                {search ? 'No members found' : 'No members yet'}
              </div>
            ) : (
              filtered.map((m) => (
                <div key={m._id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px',
                  borderRadius: '10px', cursor: 'pointer', transition: 'background 0.15s',
                  marginBottom: '2px',
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => onFocusMember(m)}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0,
                    background: m.gender === 'male' ? 'rgba(96,165,250,0.15)' : m.gender === 'female' ? 'rgba(244,114,182,0.15)' : 'rgba(167,139,250,0.15)',
                    color: m.gender === 'male' ? '#60a5fa' : m.gender === 'female' ? '#f472b6' : '#a78bfa',
                  }}>
                    {genderEmoji[m.gender] || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.firstName} {m.lastName}
                    </div>
                    {m.occupation && <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.occupation}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                    <button onClick={(e) => { e.stopPropagation(); onEditMember(m); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px', color: 'var(--text-muted)', fontSize: '13px' }} title="Edit">✏️</button>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteMember(m._id); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px', color: 'var(--text-muted)', fontSize: '13px' }} title="Delete">🗑️</button>
                  </div>
                </div>
              ))
            )}
          </>
        ) : (
          <>
            {relationships.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>No relationships yet</div>
            ) : (
              relationships.map((r) => (
                <div key={r._id} style={{
                  padding: '10px', borderRadius: '10px', marginBottom: '4px',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, marginBottom: '4px' }}>
                      {relTypeLabel[r.type] || r.type}
                    </div>
                    <button onClick={() => onDeleteRelationship(r._id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '12px', padding: '0 2px' }}>✕</button>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{getMemberName(r.sourceId)}</span>
                    <span style={{ margin: '0 4px', color: 'var(--text-muted)' }}>→</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{getMemberName(r.targetId)}</span>
                  </div>
                  {r.notes && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{r.notes}</div>}
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Add member button */}
      {tab === 'members' && (
        <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
          <button className="btn-primary" onClick={onAddMember} style={{ width: '100%', fontSize: '13px' }}>
            + Add Member
          </button>
        </div>
      )}
    </div>
  );
}
