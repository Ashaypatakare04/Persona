import {
  DashboardStats,
  Conversation,
  Message,
  Call,
  Approval,
  Contact,
  ContactRule,
  AutonomySettings,
  PermissionSettings,
  LLMSettings,
  KnowledgeItem,
  AuditLog,
  SimulateResponse
} from '../types';

const BASE_URL = '/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errData.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Dashboard
  getStats: () => fetchJson<DashboardStats>('/dashboard/stats'),

  // Conversations
  getConversations: (channel?: string, priority?: string) => {
    const params = new URLSearchParams();
    if (channel && channel !== 'all') params.append('channel', channel);
    if (priority && priority !== 'all') params.append('priority', priority);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<Conversation[]>(`/conversations${qs}`);
  },
  getConversation: (id: number) => fetchJson<Conversation>(`/conversations/${id}`),
  sendMessage: (id: number, content: string) =>
    fetchJson<Message>(`/conversations/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  takeoverConversation: (id: number) =>
    fetchJson<{ status: string; message: string }>(`/conversations/${id}/takeover`, {
      method: 'POST',
    }),

  // Calls
  getCalls: (status?: string) => {
    const qs = status ? `?status=${status}` : '';
    return fetchJson<Call[]>(`/calls${qs}`);
  },
  getCall: (id: number) => fetchJson<Call>(`/calls/${id}`),
  controlCall: (id: number, action: 'takeover' | 'continue_ai' | 'end_call') =>
    fetchJson<{ status: string; action: string; call_status: string }>(`/calls/${id}/control?action=${action}`, {
      method: 'POST',
    }),

  // Approvals
  getApprovals: (status: string = 'PENDING') =>
    fetchJson<Approval[]>(`/approvals?status=${status}`),
  resolveApproval: (
    id: number,
    action: 'approve' | 'edit' | 'reject' | 'takeover',
    editedContent?: string,
    notes?: string
  ) =>
    fetchJson<Approval>(`/approvals/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({
        action,
        edited_content: editedContent,
        reviewer_notes: notes,
      }),
    }),

  // Contacts
  getContacts: (relationship?: string, search?: string) => {
    const params = new URLSearchParams();
    if (relationship && relationship !== 'all') params.append('relationship', relationship);
    if (search) params.append('search', search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<Contact[]>(`/contacts${qs}`);
  },
  createContact: (data: Partial<Contact>) =>
    fetchJson<Contact>('/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateContact: (id: number, data: Partial<Contact>) =>
    fetchJson<Contact>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateContactRules: (contactId: number, data: Partial<ContactRule>) =>
    fetchJson<ContactRule>(`/contacts/${contactId}/rules`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Settings
  getAutonomySettings: () => fetchJson<AutonomySettings>('/settings/autonomy'),
  updateAutonomySettings: (level: number) =>
    fetchJson<AutonomySettings>('/settings/autonomy', {
      method: 'PUT',
      body: JSON.stringify({ global_autonomy_level: level }),
    }),
  getPermissions: () => fetchJson<PermissionSettings>('/settings/permissions'),
  updatePermissions: (data: Partial<PermissionSettings>) =>
    fetchJson<PermissionSettings>('/settings/permissions', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getLLMSettings: () => fetchJson<LLMSettings>('/settings/llm'),
  updateLLMSettings: (data: Partial<LLMSettings>) =>
    fetchJson<LLMSettings>('/settings/llm', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Knowledge
  getKnowledge: (category?: string) => {
    const qs = category && category !== 'all' ? `?category=${category}` : '';
    return fetchJson<KnowledgeItem[]>(`/knowledge${qs}`);
  },
  createKnowledgeItem: (data: Partial<KnowledgeItem>) =>
    fetchJson<KnowledgeItem>('/knowledge', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteKnowledgeItem: (id: number) =>
    fetchJson<{ status: string; message: string }>(`/knowledge/${id}`, {
      method: 'DELETE',
    }),

  // Audit Logs
  getAuditLogs: (category?: string, limit: number = 50) => {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    params.append('limit', limit.toString());
    return fetchJson<AuditLog[]>(`/audit?${params.toString()}`);
  },

  // Simulation Sandbox
  simulateIncoming: (payload: {
    channel: string;
    contact_id?: number;
    sender_name?: string;
    sender_phone_or_email?: string;
    message_content: string;
  }) =>
    fetchJson<SimulateResponse>('/simulate/incoming', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
