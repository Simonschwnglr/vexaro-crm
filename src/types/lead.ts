export type LeadStatus = 'new' | 'contacted' | 'hot' | 'warm' | 'cold' | 'won' | 'lost';

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source?: string;
  status: LeadStatus;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface LeadFilters {
  status?: LeadStatus | '';
  search?: string;
}

export interface CreateLeadPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source?: string;
  status: LeadStatus;
  notes?: string;
}

export type UpdateLeadPayload = Partial<CreateLeadPayload>;
