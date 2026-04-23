import { useState, useEffect, useCallback } from 'react';
import { leadsApi } from '../api/leads';
import type { Lead, LeadFilters, CreateLeadPayload, UpdateLeadPayload, LeadStatus } from '../types/lead';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface LeadsResponse {
  leads: Lead[];
  pagination: Pagination;
}

export function useLeads(filters: LeadFilters) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const fetch = useCallback(async (page = 1, append = false) => {
    if (page === 1) setLoading(true);
    else setLoadingMore(true);
    setError(null);
    try {
      const data: LeadsResponse = await leadsApi.list({ ...filters, page, limit: 50 });
      if (append) {
        setLeads(prev => [...prev, ...data.leads]);
      } else {
        setLeads(data.leads);
      }
      setPagination(data.pagination);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters.status, filters.search]);

  useEffect(() => { fetch(1); }, [fetch]);

  const loadMore = () => {
    if (pagination && pagination.page < pagination.pages && !loadingMore) {
      fetch(pagination.page + 1, true);
    }
  };

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

  return { leads, loading, loadingMore, error, pagination, refresh: () => fetch(1), loadMore, createLead, updateLead, updateStatus, deleteLead };
}
