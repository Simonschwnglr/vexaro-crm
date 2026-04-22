import { useEffect, useRef, useState } from 'react';
import type { Lead, CreateLeadPayload, LeadStatus } from '../../types/lead';
import { StatusBadge } from '../Leads/StatusBadge';
import styles from './LeadModal.module.css';

const STATUSES: LeadStatus[] = ['new', 'contacted', 'warm', 'hot', 'cold', 'won', 'lost'];
const SOURCES = ['Website', 'Referral', 'LinkedIn', 'Cold Outreach', 'Google', 'Instagram', 'TikTok', 'Other'];

interface Props {
  lead?: Lead | null;
  mode: 'create' | 'edit' | 'view';
  onClose: () => void;
  onSave: (payload: CreateLeadPayload) => Promise<void>;
  onStatusChange?: (id: number, status: LeadStatus) => Promise<void>;
  onEdit?: () => void;
}

const emptyForm: CreateLeadPayload = {
  name: '', email: '', phone: '', company: '', source: '', status: 'new', notes: '', branche: '',
};

export function LeadModal({ lead, mode, onClose, onSave, onStatusChange, onEdit }: Props) {
  const [form, setForm] = useState<CreateLeadPayload>(lead ? {
    name: lead.name, email: lead.email, phone: lead.phone ?? '',
    company: lead.company ?? '', source: lead.source ?? '',
    status: lead.status, notes: lead.notes ?? '', branche: lead.branche ?? '',
  } : emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = (k: keyof CreateLeadPayload, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required.'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (s: LeadStatus) => {
    if (!lead || !onStatusChange) return;
    await onStatusChange(lead.id, s);
    setForm(f => ({ ...f, status: s }));
  };

  const isView = mode === 'view';

  return (
    <div className={styles.backdrop} ref={backdropRef} onClick={e => { if (e.target === backdropRef.current) onClose(); }}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {mode === 'create' ? 'New Lead' : mode === 'edit' ? 'Edit Lead' : lead?.name}
          </h2>
          <div className={styles.headerActions}>
            {isView && onEdit && (
              <button className={styles.editBtn} onClick={onEdit}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
              </button>
            )}
            <button className={styles.closeBtn} onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {isView && lead ? (
          <div className={styles.viewBody}>
            <div className={styles.viewSection}>
              <div className={styles.viewRow}>
                <span className={styles.viewLabel}>Status</span>
                <div className={styles.statusPicker}>
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      className={`${styles.statusOption} ${form.status === s ? styles.statusActive : ''}`}
                      onClick={() => handleStatusChange(s)}
                    >
                      <StatusBadge status={s} size="sm" />
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.viewRow}>
                <span className={styles.viewLabel}>Email</span>
                <a href={`mailto:${lead.email}`} className={styles.viewLink}>{lead.email}</a>
              </div>
              {lead.phone && (
                <div className={styles.viewRow}>
                  <span className={styles.viewLabel}>Phone</span>
                  <span>{lead.phone}</span>
                </div>
              )}
              {lead.company && (
                <div className={styles.viewRow}>
                  <span className={styles.viewLabel}>Company</span>
                  <span>{lead.company}</span>
                </div>
              )}
              {lead.source && (
                <div className={styles.viewRow}>
                  <span className={styles.viewLabel}>Source</span>
                  <span>{lead.source}</span>
                </div>
              )}
              {lead.branche && (
                <div className={styles.viewRow}>
                  <span className={styles.viewLabel}>Branche</span>
                  <span>{lead.branche}</span>
                </div>
              )}
              {lead.notes && (
                <div className={styles.viewRow} style={{ alignItems: 'flex-start' }}>
                  <span className={styles.viewLabel}>Notes</span>
                  <p className={styles.notes}>{lead.notes}</p>
                </div>
              )}
              <div className={styles.viewRow}>
                <span className={styles.viewLabel}>Created</span>
                <span className={styles.muted}>{new Date(lead.created_at).toLocaleString('de-DE')}</span>
              </div>
            </div>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label>Name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Max Mustermann" required />
              </div>
              <div className={styles.field}>
                <label>Email *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="max@example.de" required />
              </div>
              <div className={styles.field}>
                <label>Phone</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+49 170 123 4567" />
              </div>
              <div className={styles.field}>
                <label>Company</label>
                <input value={form.company} onChange={e => set('company', e.target.value)} placeholder="Mustermann GmbH" />
              </div>
              <div className={styles.field}>
                <label>Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value as LeadStatus)}>
                  {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label>Source</label>
                <select value={form.source} onChange={e => set('source', e.target.value)}>
                  <option value="">Select source…</option>
                  {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label>Branche</label>
                <input value={form.branche} onChange={e => set('branche', e.target.value)} placeholder="z.B. Elektriker, Restaurant" />
              </div>
            </div>
            <div className={styles.field}>
              <label>Notes</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any notes about this lead…" rows={3} />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.actions}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
              <button type="submit" className={styles.saveBtn} disabled={saving}>
                {saving ? 'Saving…' : mode === 'create' ? 'Create Lead' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
