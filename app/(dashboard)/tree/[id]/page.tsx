'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Connection } from 'reactflow';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useTreeStore } from '@/store/treeStore';
import { useAuthStore } from '@/store/authStore';
import { FamilyTree, Member, Relationship, RelationshipType } from '@/types';
import dynamic from 'next/dynamic';
import TreeToolbar from '@/components/tree/TreeToolbar';
import TreeSidebar from '@/components/tree/TreeSidebar';
import MemberModal from '@/components/tree/MemberModal';
import RelationshipModal from '@/components/tree/RelationshipModal';
import EditTreeModal from '@/components/tree/EditTreeModal';
import ShareModal from '@/components/tree/ShareModal';

// Dynamically import ReactFlow canvas to avoid SSR issues
const TreeCanvas = dynamic(() => import('@/components/tree/TreeCanvas'), { ssr: false });

export default function TreePage() {
  const params = useParams();
  const router = useRouter();
  const treeId = params.id as string;
  const { isAuthenticated } = useAuthStore();

  const {
    currentTree, setCurrentTree, updateTree,
    members, setMembers, addMember, updateMember, removeMember, updateMemberPosition,
    relationships, setRelationships, addRelationship, removeRelationship,
  } = useTreeStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [addRelativeTo, setAddRelativeTo] = useState<Member | null>(null);
  const [showEditTree, setShowEditTree] = useState(false);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    async function load() {
      const res = await api.getTree(treeId);
      if (res.success && res.data) {
        const { tree, members: m, relationships: r } = res.data as { tree: FamilyTree; members: Member[]; relationships: Relationship[] };
        setCurrentTree(tree);
        setMembers(m);
        setRelationships(r);
      } else {
        toast.error('Failed to load tree');
        router.push('/dashboard');
      }
      setLoading(false);
    }
    load();
  }, [treeId, isAuthenticated, router, setCurrentTree, setMembers, setRelationships]);

  // Add member
  async function handleAddMember(data: Partial<Member>) {
    const res = await api.createMember(treeId, data as Record<string, unknown>);
    if (res.success && res.data) {
      addMember(res.data as Member);
      toast.success('Member added!');
      setShowAddMember(false);
    } else {
      toast.error(res.error || 'Failed to add member');
    }
  }

  // Edit member
  async function handleEditMember(data: Partial<Member>) {
    if (!editingMember) return;
    const res = await api.updateMember(treeId, editingMember._id, data as Record<string, unknown>);
    if (res.success && res.data) {
      updateMember(editingMember._id, res.data as Member);
      toast.success('Member updated!');
      setEditingMember(null);
    } else {
      toast.error(res.error || 'Failed to update member');
    }
  }

  // Delete member
  async function handleDeleteMember(id: string) {
    if (!confirm('Delete this member and all their relationships?')) return;
    const res = await api.deleteMember(treeId, id);
    if (res.success) {
      removeMember(id);
      toast.success('Member deleted');
    } else {
      toast.error(res.error || 'Failed to delete');
    }
  }

  // Add relationship via modal
  async function handleAddRelationship(data: { type: RelationshipType; sourceId: string; targetId: string; notes?: string }) {
    const res = await api.createRelationship(treeId, data as Record<string, unknown>);
    if (res.success && res.data) {
      addRelationship(res.data as Relationship);
      toast.success('Relationship added!');
      setAddRelativeTo(null);
    } else {
      toast.error(res.error || 'Failed to add relationship');
    }
  }

  // Add relationship via canvas drag
  const handleCanvasConnect = useCallback(async (connection: Connection) => {
    if (!connection.source || !connection.target) return;
    const res = await api.createRelationship(treeId, {
      type: 'parent-child',
      sourceId: connection.source,
      targetId: connection.target,
    });
    if (res.success && res.data) {
      addRelationship(res.data as Relationship);
    } else if (res.error !== 'Relationship already exists') {
      toast.error(res.error || 'Failed to connect');
    }
  }, [treeId, addRelationship]);

  // Delete relationship
  async function handleDeleteRelationship(id: string) {
    const res = await api.deleteRelationship(treeId, id);
    if (res.success) {
      removeRelationship(id);
      toast.success('Relationship removed');
    } else {
      toast.error(res.error || 'Failed to remove');
    }
  }

  // Update node position (debounced in canvas)
  async function handleNodePositionChange(id: string, x: number, y: number) {
    setSaving(true);
    updateMemberPosition(id, x, y);
    await api.updateMember(treeId, id, { positionX: x, positionY: y });
    setSaving(false);
  }

  // Edit tree
  async function handleEditTree(data: Partial<FamilyTree>) {
    const res = await api.updateTree(treeId, data);
    if (res.success && res.data) {
      updateTree(treeId, res.data as FamilyTree);
      setCurrentTree(res.data as FamilyTree);
      toast.success('Tree updated!');
      setShowEditTree(false);
    } else {
      toast.error(res.error || 'Failed to update');
    }
  }

  // Toggle public
  async function handleTogglePublic(isPublic: boolean) {
    const res = await api.updateTree(treeId, { isPublic });
    if (res.success && res.data) {
      updateTree(treeId, res.data as FamilyTree);
      setCurrentTree(res.data as FamilyTree);
      toast.success(isPublic ? 'Tree is now public' : 'Tree is now private');
    } else {
      toast.error(res.error || 'Failed to update');
    }
  }

  // Export
  async function handleExport() {
    const res = await api.exportTree(treeId);
    if (res.success && res.data) {
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentTree?.name || 'family-tree'}-export.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Tree exported!');
    } else {
      toast.error('Export failed');
    }
  }

  // Focus member on canvas (scroll to node)
  function handleFocusMember(member: Member) {
    // ReactFlow fitView to node would require ref; for now just show a toast
    toast(`Locating ${member.firstName}…`, { icon: '🎯', duration: 1500 });
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <div className="animate-spin" style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading your family tree…</span>
      </div>
    );
  }

  if (!currentTree) return null;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <TreeToolbar
        tree={currentTree}
        memberCount={members.length}
        saving={saving}
        onAddMember={() => setShowAddMember(true)}
        onExport={handleExport}
        onShare={() => setShowShare(true)}
        onEditTree={() => setShowEditTree(true)}
        onBack={() => router.push('/dashboard')}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <TreeSidebar
          members={members}
          relationships={relationships}
          onAddMember={() => setShowAddMember(true)}
          onEditMember={setEditingMember}
          onDeleteMember={handleDeleteMember}
          onDeleteRelationship={handleDeleteRelationship}
          onFocusMember={handleFocusMember}
        />
        <TreeCanvas
          members={members}
          relationships={relationships}
          onNodePositionChange={handleNodePositionChange}
          onEditMember={setEditingMember}
          onDeleteMember={handleDeleteMember}
          onAddRelative={setAddRelativeTo}
          onAddEdge={handleCanvasConnect}
        />
      </div>

      {/* Modals */}
      {showAddMember && (
        <MemberModal treeId={treeId} onClose={() => setShowAddMember(false)} onSave={handleAddMember} />
      )}
      {editingMember && (
        <MemberModal treeId={treeId} member={editingMember} onClose={() => setEditingMember(null)} onSave={handleEditMember} />
      )}
      {addRelativeTo && (
        <RelationshipModal
          sourceMember={addRelativeTo}
          members={members}
          onClose={() => setAddRelativeTo(null)}
          onSave={handleAddRelationship}
        />
      )}
      {showEditTree && (
        <EditTreeModal tree={currentTree} onClose={() => setShowEditTree(false)} onSave={handleEditTree} />
      )}
      {showShare && (
        <ShareModal tree={currentTree} onClose={() => setShowShare(false)} onTogglePublic={handleTogglePublic} />
      )}
    </div>
  );
}
