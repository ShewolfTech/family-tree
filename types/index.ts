// types/index.ts

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyTree {
  _id: string;
  name: string;
  description: string;
  owner: string;
  collaborators: string[];
  isPublic: boolean;
  shareToken?: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export type Gender = 'male' | 'female' | 'other' | 'unknown';

export interface Member {
  _id: string;
  treeId: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth?: string;
  dateOfDeath?: string;
  isAlive: boolean;
  bio?: string;
  photo?: string;
  birthPlace?: string;
  occupation?: string;
  positionX: number;
  positionY: number;
  createdAt: string;
  updatedAt: string;
}

export type RelationshipType = 'parent-child' | 'spouse' | 'sibling';

export interface Relationship {
  _id: string;
  treeId: string;
  type: RelationshipType;
  sourceId: string;
  targetId: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TreeData {
  tree: FamilyTree;
  members: Member[];
  relationships: Relationship[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}
