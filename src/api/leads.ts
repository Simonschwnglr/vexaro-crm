import type { Lead, LeadFilters, CreateLeadPayload, UpdateLeadPayload, LeadStatus } from '../types/lead';

const BASE_URL = 'https://crm.serveousercontent.com';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const leadsApi = {
  list(filters?: LeadFilters): Promise<Lead[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.search) params.set('search', filters.search);
    const qs = params.toString();
    return request<Lead[]>(`/leads${qs ? `?${qs}` : ''}`);
  },

  get(id: number): Promise<Lead> {
    return request<Lead>(`/leads/${id}`);
  },

  create(payload: CreateLeadPayload): Promise<Lead> {
    return request<Lead>('/leads', { method: 'POST', body: JSON.stringify(payload) });
  },

  update(id: number, payload: UpdateLeadPayload): Promise<Lead> {
    return request<Lead>(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },

  updateStatus(id: number, status: LeadStatus): Promise<Lead> {
    return request<Lead>(`/leads/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  delete(id: number): Promise<void> {
    return request<void>(`/leads/${id}`, { method: 'DELETE' });
  },
};
