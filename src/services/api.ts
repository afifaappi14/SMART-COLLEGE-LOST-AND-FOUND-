import {
  Item,
  Claim,
  Notification,
  AuditLog,
  AbuseReport,
  RewardRecord,
  User,
  MatchScoreResult,
} from '../types';

let currentUserId = 'user_student_1';

export function setCurrentUserHeaderId(userId: string) {
  currentUserId = userId;
  localStorage.setItem('smart_campus_user_id', userId);
}

export function getCurrentUserHeaderId(): string {
  const stored = localStorage.getItem('smart_campus_user_id');
  if (stored) {
    currentUserId = stored;
  }
  return currentUserId;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': getCurrentUserHeaderId(),
    ...(options.headers || {}),
  };

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Request failed with status ' + response.status);
  }
  return data as T;
}

export const api = {
  // Auth & Personas
  async getMe(): Promise<{ user: User }> {
    return request('/api/auth/me');
  },

  async getUsers(): Promise<{ users: User[] }> {
    return request('/api/auth/users');
  },

  // Items
  async getItems(params: {
    type?: string;
    category?: string;
    status?: string;
    location?: string;
    search?: string;
    sort?: string;
  } = {}): Promise<{ items: Item[]; total: number }> {
    const query = new URLSearchParams();
    if (params.type) query.set('type', params.type);
    if (params.category) query.set('category', params.category);
    if (params.status) query.set('status', params.status);
    if (params.location) query.set('location', params.location);
    if (params.search) query.set('search', params.search);
    if (params.sort) query.set('sort', params.sort);
    return request(`/api/items?${query.toString()}`);
  },

  async getItem(id: string): Promise<{ item: Item }> {
    return request(`/api/items/${id}`);
  },

  async createItem(itemData: Partial<Item>): Promise<{ item: Item }> {
    return request('/api/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },

  // Claims
  async getClaims(): Promise<{ claims: Claim[]; total: number }> {
    return request('/api/claims');
  },

  async getClaim(id: string): Promise<{ claim: Claim; item: Item | null }> {
    return request(`/api/claims/${id}`);
  },

  async submitClaim(claimData: {
    itemId: string;
    distinguishingMarks: string;
    contentsDescription: string;
    approximateDateLost: string;
    exactLocationLost: string;
    additionalProof?: string;
  }): Promise<{ claim: Claim }> {
    return request('/api/claims', {
      method: 'POST',
      body: JSON.stringify(claimData),
    });
  },

  // Dual Verification (Privileged Endpoints)
  async verifyStage1(params: {
    claimId: string;
    decision: 'Approved' | 'Rejected' | 'Manual Review';
    notes: string;
  }): Promise<{ claim: Claim }> {
    return request('/api/verify/stage1', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async verifyStage2(params: {
    claimId: string;
    decision: 'Approved' | 'Rejected' | 'Manual Review';
    notes: string;
  }): Promise<{ claim: Claim }> {
    return request('/api/verify/stage2', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async confirmHandover(params: {
    claimId: string;
    handoverCode: string;
    recipientStudentId: string;
    notes?: string;
  }): Promise<{ claim: Claim; item: Item }> {
    return request('/api/handover/confirm', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Smart Matching
  async getMatches(): Promise<{ matches: MatchScoreResult[] }> {
    return request('/api/matching');
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: Notification[] }> {
    return request('/api/notifications');
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return request(`/api/notifications/${id}/read`, { method: 'PUT' });
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return request('/api/notifications/mark-all-read', { method: 'PUT' });
  },

  // Rewards & Demo Payment
  async getRewards(): Promise<{ rewards: RewardRecord[] }> {
    return request('/api/rewards');
  },

  async payDemoReward(rewardId: string): Promise<{ success: boolean; reward: RewardRecord }> {
    return request('/api/rewards/demo-pay', {
      method: 'POST',
      body: JSON.stringify({ rewardId }),
    });
  },

  // Audit Logs & Abuse Reports
  async getAuditLogs(): Promise<{ auditLogs: AuditLog[] }> {
    return request('/api/audit-logs');
  },

  async getAbuseReports(): Promise<{ abuseReports: AbuseReport[] }> {
    return request('/api/abuse-reports');
  },

  async reportAbuse(data: {
    targetType: 'item' | 'claim';
    targetId: string;
    targetTitle: string;
    reason: string;
  }): Promise<{ report: AbuseReport }> {
    return request('/api/abuse-reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // System Demo Reset
  async resetDemo(): Promise<{ success: boolean; message: string }> {
    return request('/api/reset-demo', { method: 'POST' });
  },
};
