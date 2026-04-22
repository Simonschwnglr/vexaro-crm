import type { Lead } from '../../types/lead';
import { StatusBadge } from './StatusBadge';
import styles from './LeadTable.module.css';

interface Props {
  leads: Lead[];
  onSelect: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  loading: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function LeadTable({ leads, onSelect, onDelete, loading }: Props) {
  if (loading) {
    return (
      <div className={styles.empty}>
        <div className={styles.spinner} />
        <span>Loading leads…</span>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className={styles.empty}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <span>No leads found</span>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Company</th>
            <th>Status</th>
            <th>Source</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => (
            <tr key={lead.id} className={styles.row} onClick={() => onSelect(lead)}>
              <td className={styles.nameCell}>
                <div className={styles.nameAvatar}>{lead.name.charAt(0).toUpperCase()}</div>
                <span>{lead.name}</span>
              </td>
              <td className={styles.secondary}>{lead.email}</td>
              <td className={styles.secondary}>{lead.company || <span className={styles.muted}>—</span>}</td>
              <td onClick={e => e.stopPropagation()}>
                <StatusBadge status={lead.status} />
              </td>
              <td className={styles.secondary}>{lead.source || <span className={styles.muted}>—</span>}</td>
              <td className={styles.secondary}>{formatDate(lead.created_at)}</td>
              <td onClick={e => e.stopPropagation()}>
                <button
                  className={styles.deleteBtn}
                  onClick={() => onDelete(lead)}
                  title="Delete lead"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/>
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
