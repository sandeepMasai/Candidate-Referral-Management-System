import type { CandidateStatus } from '../types';

const statusClassName: Record<CandidateStatus, string> = {
  Pending: 'badge pending',
  Reviewed: 'badge reviewed',
  Hired: 'badge hired',
};

type StatusBadgeProps = {
  status: CandidateStatus;
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  return <span className={statusClassName[status]}>{status}</span>;
};

export default StatusBadge;

