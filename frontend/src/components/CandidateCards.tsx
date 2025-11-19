import CandidateCard from './CandidateCard';
import type { Candidate, CandidateStatus } from '../types';

type CandidateCardsProps = {
  candidates: Candidate[];
  onStatusChange?: (id: string, status: CandidateStatus) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  busyRowId?: string | null;
  isLoading?: boolean;
};

const CandidateCards = ({
  candidates,
  onStatusChange,
  onDelete,
  busyRowId,
  isLoading,
}: CandidateCardsProps) => {
  if (isLoading) {
    return (
      <div className="center" style={{ padding: '3rem' }}>
        <p className="muted">Loading candidates...</p>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="card empty-state">
        <p>No candidates match your filters yet.</p>
        <p className="muted">Submit a new referral to get started.</p>
      </div>
    );
  }

  return (
    <div className="candidates-grid">
      {candidates.map((candidate) => (
        <CandidateCard
          key={candidate._id}
          candidate={candidate}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          busyRowId={busyRowId}
        />
      ))}
    </div>
  );
};

export default CandidateCards;

