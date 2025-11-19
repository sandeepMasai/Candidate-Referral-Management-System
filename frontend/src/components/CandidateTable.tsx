import { Trash2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import type { Candidate, CandidateStatus } from '../types';
import { CANDIDATE_STATUSES } from '../types';
import StatusBadge from './StatusBadge';
import { getResumeUrl } from '../lib/api';

type CandidateTableProps = {
  candidates: Candidate[];
  onStatusChange: (id: string, status: CandidateStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  busyRowId: string | null;
  isLoading: boolean;
};

const CandidateTable = ({
  candidates,
  onStatusChange,
  onDelete,
  busyRowId,
  isLoading,
}: CandidateTableProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'admin';
  if (!isLoading && candidates.length === 0) {
    return (
      <div className="card empty-state">
        <p>No candidates match your filters yet.</p>
        <p className="muted">Submit a new referral to get started.</p>
      </div>
    );
  }

  return (
    <div className="card table-card">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Status</th>
            {isAdmin && <th>Referred By</th>}
            <th>Submitted</th>
            <th>Resume</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={isAdmin ? 7 : 6} className="center">
                Loading candidates...
              </td>
            </tr>
          ) : (
            candidates.map((candidate) => {
              const resumeLink = getResumeUrl(candidate.resumeUrl);
              const referrer = typeof candidate.referredBy === 'object' && candidate.referredBy
                ? candidate.referredBy
                : null;
              return (
                <tr key={candidate._id}>
                <td>
                  <div className="primary-cell">
                    <strong>{candidate.name}</strong>
                    <span className="muted">{candidate.email}</span>
                  </div>
                </td>
                <td>{candidate.jobTitle}</td>
                <td>
                  <div className="status-cell">
                    <StatusBadge status={candidate.status} />
                    {isAdmin && (
                      <select
                        value={candidate.status}
                        disabled={busyRowId === candidate._id}
                        onChange={(event) =>
                          onStatusChange(candidate._id, event.target.value as CandidateStatus)
                        }
                      >
                        {CANDIDATE_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </td>
                {isAdmin && (
                  <td>
                    {referrer ? (
                      <div className="primary-cell">
                        <strong>{referrer.name}</strong>
                        <span className="muted">{referrer.email}</span>
                      </div>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                )}
                <td>{new Date(candidate.createdAt).toLocaleDateString()}</td>
                <td>
                  {resumeLink ? (
                    <a href={resumeLink} target="_blank" rel="noreferrer">
                      {candidate.resumeFileName ?? 'Resume'}
                    </a>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
                <td>
                  {isAdmin && (
                    <button
                      type="button"
                      className="icon danger"
                      disabled={busyRowId === candidate._id}
                      onClick={() => onDelete(candidate._id)}
                      title="Remove candidate"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CandidateTable;


