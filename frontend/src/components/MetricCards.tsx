import { CheckCircle, ClipboardList, UserCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import type { CandidateMetrics, CandidateStatus } from '../types';
import { CANDIDATE_STATUSES } from '../types';

type MetricCardsProps = {
  metrics: CandidateMetrics | null;
};

const iconByStatus: Record<CandidateStatus, ReactNode> = {
  Pending: <ClipboardList size={20} />,
  Reviewed: <UserCheck size={20} />,
  Hired: <CheckCircle size={20} />,
};

const MetricCards = ({ metrics }: MetricCardsProps) => {
  return (
    <div className="metrics-grid">
      <div className="card metric-card highlight">
        <p className="eyebrow">Total referrals</p>
        <h2>{metrics?.total ?? '—'}</h2>
        <p className="muted">All-time submissions</p>
      </div>

      {CANDIDATE_STATUSES.map((status) => (
        <div key={status} className="card metric-card">
          <div className="metric-icon">{iconByStatus[status]}</div>
          <p className="eyebrow">{status}</p>
          <h3>{metrics?.byStatus?.[status] ?? 0}</h3>
        </div>
      ))}
    </div>
  );
};

export default MetricCards;

