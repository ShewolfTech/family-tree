'use client';
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Member } from '@/types';
import { format } from 'date-fns';

interface MemberNodeData {
  member: Member;
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
  onAddRelative: (member: Member) => void;
  selected?: boolean;
}

const genderColor: Record<string, string> = {
  male: '#60a5fa',
  female: '#f472b6',
  other: '#a78bfa',
  unknown: '#9b96c2',
};

const genderBg: Record<string, string> = {
  male: 'rgba(96,165,250,0.12)',
  female: 'rgba(244,114,182,0.12)',
  other: 'rgba(167,139,250,0.12)',
  unknown: 'rgba(155,150,194,0.08)',
};

function getInitials(first: string, last: string) {
  return `${first[0] || ''}${last[0] || ''}`.toUpperCase();
}

function MemberNode({ data, selected }: NodeProps<MemberNodeData>) {
  const { member, onEdit, onDelete, onAddRelative } = data;
  const color = genderColor[member.gender] || genderColor.unknown;
  const bg = genderBg[member.gender] || genderBg.unknown;

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: '16px',
        padding: '16px',
        minWidth: '180px',
        maxWidth: '200px',
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: selected ? '0 0 0 4px var(--accent-glow), 0 8px 32px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.2)',
        position: 'relative',
      }}
      className="member-node"
    >
      {/* Handles */}
      <Handle type="target" position={Position.Top} style={{ background: color, border: `2px solid var(--bg-card)`, width: 10, height: 10, top: -5 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: color, border: `2px solid var(--bg-card)`, width: 10, height: 10, bottom: -5 }} />
      <Handle type="target" position={Position.Left} id="left-target" style={{ background: color, border: `2px solid var(--bg-card)`, width: 10, height: 10, left: -5 }} />
      <Handle type="source" position={Position.Right} id="right-source" style={{ background: color, border: `2px solid var(--bg-card)`, width: 10, height: 10, right: -5 }} />

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '12px',
          background: bg,
          border: `2px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: 700, color, flexShrink: 0,
          fontFamily: 'var(--font-display)',
        }}>
          {member.photo ? (
            <img src={member.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
          ) : getInitials(member.firstName, member.lastName)}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {member.firstName}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {member.lastName}
          </div>
        </div>
      </div>

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className={`tag tag-${member.gender}`}>{member.gender}</span>
          {!member.isAlive && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>✝</span>}
        </div>
        {member.dateOfBirth && (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            b. {format(new Date(member.dateOfBirth), 'MMM d, yyyy')}
          </div>
        )}
        {member.occupation && (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {member.occupation}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '4px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(member); }}
          style={{ flex: 1, padding: '4px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '12px', transition: 'background 0.2s' }}
          title="Edit member"
        >✏️</button>
        <button
          onClick={(e) => { e.stopPropagation(); onAddRelative(member); }}
          style={{ flex: 1, padding: '4px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '12px', transition: 'background 0.2s' }}
          title="Add relationship"
        >🔗</button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(member._id); }}
          style={{ flex: 1, padding: '4px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', color: 'var(--danger)', fontSize: '12px', transition: 'background 0.2s' }}
          title="Delete member"
        >🗑️</button>
      </div>
    </div>
  );
}

export default memo(MemberNode);
