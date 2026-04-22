import { useState, useEffect, useCallback } from 'react';
import { leadsApi } from '../api/leads';
import type { Lead, LeadFilters, CreateLeadPayload, UpdateLeadPayload, LeadStatus } from '../types/lead';

export function useLeads(filters: LeadFilters) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await leadsApi.list(filters);
      setLeads(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.search]);

  useEffect(() => { fetch(); }, [fetch]);

  const createLead = async (payload: CreateLeadPayload) => {
    const lead = await leadsApi.create(payload);
    setLeads(prev => [lead, ...prev]);
    return lead;
  };

  const updateLead = async (id: number, payload: UpdateLeadPayload) => {
    const lead = await leadsApi.update(id, payload);
    setLeads(prev => prev.map(l => l.id === id ? lead : l));
    return lead;
  };

  const updateStatus = async (id: number, status: LeadStatus) => {
    const lead = await leadsApi.updateStatus(id, status);
    setLeads(prev => prev.map(l => l.id === id ? lead : l));
    return lead;
  };

  const deleteLead = async (id: number) => {
    await leadsApi.delete(id);
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  return { leads, loading, error, refresh: fetch, createLead, updateLead, updateStatus, deleteLead };
}
