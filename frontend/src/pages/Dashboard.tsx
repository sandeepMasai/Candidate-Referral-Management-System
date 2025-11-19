import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LayoutGrid, List } from 'lucide-react';
import type { AppDispatch, RootState } from '../store/store';
import { getCurrentUser } from '../store/authSlice';
import CandidateForm from '../components/CandidateForm';
import CandidateFilters from '../components/CandidateFilters';
import CandidateTable from '../components/CandidateTable';
import CandidateCards from '../components/CandidateCards';
import MetricCards from '../components/MetricCards';
import type {
  Candidate,
  CandidateFilterState,
  CandidateFormPayload,
  CandidateMetrics,
  CandidateStatus,
} from '../types';
import {
  createCandidate,
  deleteCandidate as deleteCandidateRequest,
  fetchMetrics,
  listCandidates,
  updateCandidateStatus,
} from '../lib/api';

type ToastState = { type: 'success' | 'error'; text: string } | null;

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filters, setFilters] = useState<CandidateFilterState>({
    status: '',
    jobTitle: '',
    q: '',
  });
  const [metrics, setMetrics] = useState<CandidateMetrics | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [busyRowId, setBusyRowId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const showError = useCallback((text: string) => setToast({ type: 'error', text }), []);
  const showSuccess = useCallback((text: string) => setToast({ type: 'success', text }), []);

  const loadCandidates = useCallback(async () => {
    setListLoading(true);
    try {
      const data = await listCandidates(filters);
      setCandidates(data);
    } catch (error) {
      console.error(error);
      showError('Unable to load candidates.');
    } finally {
      setListLoading(false);
    }
  }, [filters, showError]);

  const loadMetrics = useCallback(async () => {
    try {
      const data = await fetchMetrics();
      setMetrics(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const handleCreate = async (payload: CandidateFormPayload) => {
    setFormSubmitting(true);
    try {
      await createCandidate(payload);
      showSuccess('Candidate referred successfully.');
      await Promise.all([loadCandidates(), loadMetrics()]);
    } catch (error) {
      console.error(error);
      showError('Failed to submit referral.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: CandidateStatus) => {
    setBusyRowId(id);
    try {
      const updated = await updateCandidateStatus(id, status);
      setCandidates((prev) => prev.map((candidate) => (candidate._id === id ? updated : candidate)));
      loadMetrics();
      showSuccess('Status updated.');
    } catch (error) {
      console.error(error);
      showError('Failed to update status.');
    } finally {
      setBusyRowId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Remove this candidate? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    setBusyRowId(id);
    try {
      await deleteCandidateRequest(id);
      setCandidates((prev) => prev.filter((candidate) => candidate._id !== id));
      loadMetrics();
      showSuccess('Candidate removed.');
    } catch (error) {
      console.error(error);
      showError('Failed to remove candidate.');
    } finally {
      setBusyRowId(null);
    }
  };

  const refreshData = () => {
    loadCandidates();
    loadMetrics();
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Candidate Referral Management</p>
          <h1>Referral dashboard</h1>
          <p className="muted">
            {user?.role === 'admin'
              ? 'Manage all candidates and track their hiring status across the system.'
              : 'Add candidates, keep track of their hiring status, and download resumes in one place.'}
          </p>
        </div>
      </header>

      {toast && <div className={`toast ${toast.type}`}>{toast.text}</div>}

      <MetricCards metrics={metrics} />

      {user?.role === 'admin' ? (
        <div className="stack">
          <div className="view-controls">
            <CandidateFilters
              filters={filters}
              onChange={setFilters}
              onRefresh={refreshData}
              isLoading={listLoading}
            />
            <div className="view-toggle">
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
                title="Card view"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table view"
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {viewMode === 'cards' ? (
            <CandidateCards
              candidates={candidates}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              busyRowId={busyRowId}
              isLoading={listLoading}
            />
          ) : (
            <CandidateTable
              candidates={candidates}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              busyRowId={busyRowId}
              isLoading={listLoading}
            />
          )}
        </div>
      ) : (
        <div className="layout-grid">
          <CandidateForm onSubmit={handleCreate} isSubmitting={formSubmitting} />

          <div className="stack">
            <div className="view-controls">
              <CandidateFilters
                filters={filters}
                onChange={setFilters}
                onRefresh={refreshData}
                isLoading={listLoading}
              />
              <div className="view-toggle">
                <button
                  type="button"
                  className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
                  onClick={() => setViewMode('cards')}
                  title="Card view"
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  type="button"
                  className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                  title="Table view"
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            {viewMode === 'cards' ? (
              <CandidateCards
                candidates={candidates}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                busyRowId={busyRowId}
                isLoading={listLoading}
              />
            ) : (
              <CandidateTable
                candidates={candidates}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                busyRowId={busyRowId}
                isLoading={listLoading}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

