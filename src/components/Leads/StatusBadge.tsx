import type { LeadStatus } from '../../types/lead';
import styles from './StatusBadge.module.css';

const STATUS_CONFIG: Record<LeadStatus, { label: string; cls: string }> = {
  new:       { label: 'New',       cls: styles.new },
  contacted: { label: 'Contacted', cls: styles.contacted },
  hot:       { label: 'Hot',       cls: styles.hot },
  warm:      { label: 'Warm',      cls: styles.warm },
  cold:      { label: 'Cold',      cls: styles.cold },
  won:       { label: 'Won',       cls: styles.won },
  lost:      { label: 'Lost',      cls: styles.lost },
};

interface Props {
  status: LeadStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: Props) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, cls: '' };
  return (
    <span className={`${styles.badge} ${cfg.cls} ${size === 'sm' ? styles.sm : ''}`}>
      {cfg.label}
    </span>
  );
}
