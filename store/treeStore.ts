'use client';
import { create } from 'zustand';
import { FamilyTree, Member, Relationship } from '@/types';

interface TreeStore {
  trees: FamilyTree[];
  currentTree: FamilyTree | null;
  members: Member[];
  relationships: Relationship[];
  isLoading: boolean;
  error: string | null;
  
  setTrees: (trees: FamilyTree[]) => void;
  addTree: (tree: FamilyTree) => void;
  updateTree: (id: string, updates: Partial<FamilyTree>) => void;
  removeTree: (id: string) => void;
  setCurrentTree: (tree: FamilyTree | null) => void;
  
  setMembers: (members: Member[]) => void;
  addMember: (member: Member) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  removeMember: (id: string) => void;
  updateMemberPosition: (id: string, x: number, y: number) => void;
  
  setRelationships: (relationships: Relationship[]) => void;
  addRelationship: (relationship: Relationship) => void;
  removeRelationship: (id: string) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTreeStore = create<TreeStore>((set) => ({
  trees: [],
  currentTree: null,
  members: [],
  relationships: [],
  isLoading: false,
  error: null,

  setTrees: (trees) => set({ trees }),
  addTree: (tree) => set((state) => ({ trees: [tree, ...state.trees] })),
  updateTree: (id, updates) =>
    set((state) => ({
      trees: state.trees.map((t) => (t._id === id ? { ...t, ...updates } : t)),
      currentTree: state.currentTree?._id === id ? { ...state.currentTree, ...updates } : state.currentTree,
    })),
  removeTree: (id) =>
    set((state) => ({ trees: state.trees.filter((t) => t._id !== id) })),
  setCurrentTree: (tree) => set({ currentTree: tree }),

  setMembers: (members) => set({ members }),
  addMember: (member) => set((state) => ({ members: [...state.members, member] })),
  updateMember: (id, updates) =>
    set((state) => ({
      members: state.members.map((m) => (m._id === id ? { ...m, ...updates } : m)),
    })),
  removeMember: (id) =>
    set((state) => ({
      members: state.members.filter((m) => m._id !== id),
      relationships: state.relationships.filter(
        (r) => r.sourceId !== id && r.targetId !== id
      ),
    })),
  updateMemberPosition: (id, x, y) =>
    set((state) => ({
      members: state.members.map((m) => (m._id === id ? { ...m, positionX: x, positionY: y } : m)),
    })),

  setRelationships: (relationships) => set({ relationships }),
  addRelationship: (relationship) =>
    set((state) => ({ relationships: [...state.relationships, relationship] })),
  removeRelationship: (id) =>
    set((state) => ({
      relationships: state.relationships.filter((r) => r._id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
