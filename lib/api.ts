import { useAuthStore } from '@/store/authStore';

const BASE_URL = '/api';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('family-tree-auth');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.state?.token ?? null;
    } catch {
      return null;
    }
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    const json = await res.json();

    if (res.status === 401) {
      useAuthStore.getState().logout();
    }

    return json;
  }

  // Auth
  async register(name: string, email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async requestPasswordReset(email: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ action: 'request', email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ action: 'reset', token, newPassword }),
    });
  }

  // Trees
  async getTrees() {
    return this.request<unknown[]>('/trees');
  }

  async createTree(data: { name: string; description?: string; isPublic?: boolean }) {
    return this.request('/trees', { method: 'POST', body: JSON.stringify(data) });
  }

  async getTree(id: string) {
    return this.request(`/trees/${id}`);
  }

  async updateTree(id: string, data: Partial<{ name: string; description: string; isPublic: boolean }>) {
    return this.request(`/trees/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteTree(id: string) {
    return this.request(`/trees/${id}`, { method: 'DELETE' });
  }

  // Members
  async getMembers(treeId: string) {
    return this.request(`/trees/${treeId}/members`);
  }

  async createMember(treeId: string, data: Record<string, unknown>) {
    return this.request(`/trees/${treeId}/members`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMember(treeId: string, memberId: string, data: Record<string, unknown>) {
    return this.request(`/trees/${treeId}/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteMember(treeId: string, memberId: string) {
    return this.request(`/trees/${treeId}/members/${memberId}`, { method: 'DELETE' });
  }

  // Relationships
  async getRelationships(treeId: string) {
    return this.request(`/trees/${treeId}/relationships`);
  }

  async createRelationship(treeId: string, data: Record<string, unknown>) {
    return this.request(`/trees/${treeId}/relationships`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteRelationship(treeId: string, relationshipId: string) {
    return this.request(`/trees/${treeId}/relationships?relationshipId=${relationshipId}`, {
      method: 'DELETE',
    });
  }

  // Export
  async exportTree(treeId: string) {
    return this.request(`/trees/${treeId}/export`);
  }
}

export const api = new ApiClient();
