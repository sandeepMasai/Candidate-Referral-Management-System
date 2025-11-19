import type { ChangeEvent } from 'react';
import type { CandidateFilterState } from '../types';

type CandidateFiltersProps = {
  filters: CandidateFilterState;
  onChange: (next: CandidateFilterState) => void;
  onRefresh: () => void;
  isLoading: boolean;
};

const CandidateFilters = ({ filters, onChange, onRefresh, isLoading }: CandidateFiltersProps) => {
  const handleInput = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    onChange({ ...filters, [name]: value });
  };

  const handleReset = () => {
    onChange({ status: '', jobTitle: '', q: '' });
  };

  return (
    <div className="card filters">
      <div className="filters-group">
        <label>
          <span>Search</span>
          <input
            name="q"
            value={filters.q ?? ''}
            placeholder="Search name, role, status"
            onChange={handleInput}
          />
        </label>

        <label>
          <span>Role</span>
          <input
            name="jobTitle"
            value={filters.jobTitle ?? ''}
            placeholder="e.g. Product Manager"
            onChange={handleInput}
          />
        </label>

        <label>
          <span>Status</span>
          <select name="status" value={filters.status ?? ''} onChange={handleInput}>
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Hired">Hired</option>
          </select>
        </label>
      </div>

      <div className="filters-actions">
        <button type="button" className="ghost" onClick={handleReset}>
          Reset
        </button>
        <button type="button" onClick={onRefresh} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};

export default CandidateFilters;

