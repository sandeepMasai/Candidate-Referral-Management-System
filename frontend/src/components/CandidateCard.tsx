import { Mail, Phone, Briefcase, Calendar, User, FileText, Trash2, Download } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import type { Candidate, CandidateStatus } from '../types';
import { CANDIDATE_STATUSES } from '../types';
import StatusBadge from './StatusBadge';
import { getResumeUrl } from '../lib/api';

type CandidateCardProps = {
  candidate: Candidate;
  onStatusChange?: (id: string, status: CandidateStatus) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  busyRowId?: string | null;
};

const CandidateCard = ({
  candidate,
  onStatusChange,
  onDelete,
  busyRowId,
}: CandidateCardProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'admin';
  const resumeLink = getResumeUrl(candidate.resumeUrl);
  const referrer =
    typeof candidate.referredBy === 'object' && candidate.referredBy
      ? candidate.referredBy
      : null;

  return (
    <div className="candidate-card">
      <div className="candidate-card-header">
        <div className="candidate-card-title">
          <h3>{candidate.name}</h3>
          <StatusBadge status={candidate.status} />
        </div>
        {isAdmin && onDelete && (
          <button
            type="button"
            className="icon danger"
            disabled={busyRowId === candidate._id}
            onClick={() => onDelete(candidate._id)}
            title="Delete candidate"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="candidate-card-body">
        <div className="candidate-card-info">
          <div className="candidate-info-item">
            <Mail size={16} className="info-icon" />
            <span className="muted">Email</span>
            <strong>{candidate.email}</strong>
          </div>

          <div className="candidate-info-item">
            <Phone size={16} className="info-icon" />
            <span className="muted">Phone</span>
            <strong>{candidate.phone}</strong>
          </div>

          <div className="candidate-info-item">
            <Briefcase size={16} className="info-icon" />
            <span className="muted">Job Title</span>
            <strong>{candidate.jobTitle}</strong>
          </div>

          <div className="candidate-info-item">
            <Calendar size={16} className="info-icon" />
            <span className="muted">Submitted</span>
            <strong>{new Date(candidate.createdAt).toLocaleDateString()}</strong>
          </div>

          {referrer && (
            <div className="candidate-info-item">
              <User size={16} className="info-icon" />
              <span className="muted">Referred By</span>
              <strong>
                {referrer.name}
                {isAdmin && <span className="muted"> ({referrer.email})</span>}
              </strong>
            </div>
          )}

          {resumeLink && (
            <div className="candidate-info-item">
              <FileText size={16} className="info-icon" />
              <span className="muted">Resume</span>
              <a
                href={resumeLink}
                target="_blank"
                rel="noreferrer"
                className="resume-link"
                download
              >
                <Download size={14} />
                {candidate.resumeFileName ?? 'Download Resume'}
              </a>
            </div>
          )}
        </div>

        {isAdmin && onStatusChange && (
          <div className="candidate-card-actions">
            <label>
              <span>Update Status</span>
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
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateCard;

