import { useState, useMemo, useCallback } from 'react';
import { useLeads } from '../hooks/useLeads';
import { LeadTable } from '../components/Leads/LeadTable';
import { LeadModal } from '../components/Modals/LeadModal';
import { ConfirmModal } from '../components/Modals/ConfirmModal';
import { StatusBadge } from '../components/Leads/StatusBadge';
import type { Lead, LeadStatus, CreateLeadPayload } from '../types/lead';
import styles from './LeadsPage.module.css';

const ALL_STATUSES: LeadStatus[] = ['new', 'contacted', 'warm', 'hot', 'cold', 'won', 'lost'];

type ModalState =
  | { type: 'create' }
  | { type: 'view'; lead: Lead }
  | { type: 'edit'; lead: Lead }
  | null;

export function LeadsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [sortBy, setSortBy] = useState<'status' | 'branche' | 'created_at'>('created_at');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);

  const filters = useMemo(() => ({ status: statusFilter, search: debouncedSearch, sort: sortBy }), [statusFilter, debouncedSearch, sortBy]);
  const { leads, loading, loadingMore, error, pagination, loadMore, createLead, updateLead, updateStatus, deleteLead } = useLeads(filters);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    clearTimeout((handleSearchChange as any)._t);
    (handleSearchChange as any)._t = setTimeout(() => setDebouncedSearch(val), 350);
  };

  const handleSave = useCallback(async (payload: CreateLeadPayload) => {
    if (modal?.type === 'create') {
      await createLead(payload);
    } else if (modal?.type === 'edit' && modal.lead) {
      await updateLead(modal.lead.id, payload);
    }
  }, [modal, createLead, updateLead]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteLead(deleteTarget.id);
    setDeleteTarget(null);
    if (modal?.type !== 'create' && (modal as any)?.lead?.id === deleteTarget.id) setModal(null);
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    leads.forEach(l => { c[l.status] = (c[l.status] ?? 0) + 1; });
    return c;
  }, [leads]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Leads</h1>
          <p className={styles.subtitle}>{pagination ? `${leads.length} von ${pagination.total}` : leads.length} Leads</p>
        </div>
        <button className={styles.newBtn} onClick={() => setModal({ type: 'create' })}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Lead
        </button>
      </div>

      <div className={styles.stats}>
        {ALL_STATUSES.filter(s => counts[s]).map(s => (
          <button
            key={s}
            className={`${styles.statChip} ${statusFilter === s ? styles.statChipActive : ''}`}
            onClick={() => setStatusFilter(v => v === s ? '' : s)}
          >
            <StatusBadge status={s} size="sm" />
            <span className={styles.statCount}>{counts[s]}</span>
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.searchIcon}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className={styles.searchInput}
            placeholder="Search by name, email, company…"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
          />
          {search && (
            <button className={styles.clearSearch} onClick={() => { setSearch(''); setDebouncedSearch(''); }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as LeadStatus | '')}
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select
          className={styles.filterSelect}
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
        >
          <option value="created_at">Neueste zuerst</option>
          <option value="status">Nach Status</option>
          <option value="branche">Nach Branche</option>
        </select>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      <LeadTable
        leads={leads}
        loading={loading}
        onSelect={lead => setModal({ type: 'view', lead })}
        onDelete={lead => setDeleteTarget(lead)}
      />

      {pagination && pagination.page < pagination.pages && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <button
            className={styles.newBtn}
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Lädt...' : `Mehr laden (${pagination.pages - pagination.page} weitere)`}
          </button>
        </div>
      )}

      {modal && (
        <LeadModal
          lead={modal.type !== 'create' ? modal.lead : null}
          mode={modal.type}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onStatusChange={async (id, status) => { await updateStatus(id, status); }}
          onEdit={modal.type === 'view' ? () => setModal({ type: 'edit', lead: modal.lead }) : undefined}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Lead"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
