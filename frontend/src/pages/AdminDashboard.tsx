import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Users, Shield, FileText, TrendingUp, Clock, Award, Trash2 } from 'lucide-react';
import type { RootState } from '../store/store';
import { getAdminStats, getAllUsers, updateUserRole, deleteUser, listCandidates, updateCandidateStatus } from '../lib/api';
import type { AdminStats, AdminUser, Candidate, CandidateStatus } from '../types';
import { CANDIDATE_STATUSES } from '../types';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'candidates'>('overview');
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(false);
    const [candidatesLoading, setCandidatesLoading] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [busyUserId, setBusyUserId] = useState<string | null>(null);
    const [busyCandidateId, setBusyCandidateId] = useState<string | null>(null);

    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/');
            return;
        }
        loadStats();
    }, [user, navigate]);

    useEffect(() => {
        if (activeTab === 'users') {
            loadUsers();
        } else if (activeTab === 'candidates') {
            loadCandidates();
        }
    }, [activeTab]);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const showError = useCallback((text: string) => setToast({ type: 'error', text }), []);
    const showSuccess = useCallback((text: string) => setToast({ type: 'success', text }), []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const data = await getAdminStats();
            setStats(data);
        } catch (error) {
            console.error(error);
            showError('Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            setUsersLoading(true);
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error(error);
            showError('Failed to load users');
        } finally {
            setUsersLoading(false);
        }
    };

    const loadCandidates = async () => {
        try {
            setCandidatesLoading(true);
            const data = await listCandidates({});
            setCandidates(data);
        } catch (error) {
            console.error(error);
            showError('Failed to load candidates');
        } finally {
            setCandidatesLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
        setBusyUserId(userId);
        try {
            const updated = await updateUserRole(userId, newRole);
            setUsers((prev) => prev.map((u) => (u._id === userId ? updated : u)));
            loadStats();
            showSuccess(`User role updated to ${newRole}`);
        } catch (error: any) {
            console.error(error);
            showError(error.response?.data?.message || 'Failed to update user role');
        } finally {
            setBusyUserId(null);
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
            return;
        }

        setBusyUserId(userId);
        try {
            await deleteUser(userId);
            setUsers((prev) => prev.filter((u) => u._id !== userId));
            loadStats();
            showSuccess('User deleted successfully');
        } catch (error: any) {
            console.error(error);
            showError(error.response?.data?.message || 'Failed to delete user');
        } finally {
            setBusyUserId(null);
        }
    };

    const handleStatusChange = async (candidateId: string, newStatus: CandidateStatus) => {
        setBusyCandidateId(candidateId);
        try {
            const updated = await updateCandidateStatus(candidateId, newStatus);
            setCandidates((prev) => prev.map((c) => (c._id === candidateId ? updated : c)));
            loadStats();
            showSuccess(`Candidate status updated to ${newStatus}`);
        } catch (error: any) {
            console.error(error);
            showError(error.response?.data?.message || 'Failed to update candidate status');
        } finally {
            setBusyCandidateId(null);
        }
    };

    if (loading && !stats) {
        return (
            <div className="app-shell">
                <div className="center">
                    <p className="muted">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="app-shell">
            <header className="app-header">
                <div className="header-nav">
                    <div>
                        <p className="eyebrow">Admin Dashboard</p>
                        <h1>System Management</h1>
                        <p className="muted">Manage users, candidates, and system statistics</p>
                    </div>
                    <button type="button" onClick={() => navigate('/')} className="ghost">
                        ← Back to Dashboard
                    </button>
                </div>
            </header>

            {toast && <div className={`toast ${toast.type}`}>{toast.text}</div>}

            {/* Tabs */}
            <div className="admin-tabs">
                <button
                    type="button"
                    className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <TrendingUp size={18} />
                    Overview
                </button>
                <button
                    type="button"
                    className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <Users size={18} />
                    Users ({stats?.totalUsers || 0})
                </button>
                <button
                    type="button"
                    className={`admin-tab ${activeTab === 'candidates' ? 'active' : ''}`}
                    onClick={() => setActiveTab('candidates')}
                >
                    <FileText size={18} />
                    Candidates
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
                <div className="admin-overview">
                    {/* Stats Cards */}
                    <div className="metrics-grid">
                        <div className="card metric-card highlight">
                            <Users size={24} className="metric-icon" />
                            <p className="eyebrow">Total Users</p>
                            <h2>{stats.totalUsers}</h2>
                            <p className="muted">{stats.totalAdmins} admins</p>
                        </div>

                        <div className="card metric-card">
                            <Shield size={24} className="metric-icon" />
                            <p className="eyebrow">Admins</p>
                            <h3>{stats.totalAdmins}</h3>
                        </div>

                        <div className="card metric-card">
                            <FileText size={24} className="metric-icon" />
                            <p className="eyebrow">Total Candidates</p>
                            <h3>{stats.totalCandidates}</h3>
                        </div>

                        <div className="card metric-card">
                            <Award size={24} className="metric-icon" />
                            <p className="eyebrow">Hired</p>
                            <h3>{stats.candidatesByStatus?.Hired || 0}</h3>
                        </div>
                    </div>

                    <div className="layout-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {/* Top Referrers */}
                        <div className="card">
                            <div className="card-header">
                                <div>
                                    <p className="eyebrow">Top Referrers</p>
                                    <h2>Leaderboard</h2>
                                </div>
                                <Award size={20} style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <div className="referrers-list">
                                {stats.topReferrers && stats.topReferrers.length > 0 ? (
                                    stats.topReferrers.map((referrer, index) => (
                                        <div key={referrer._id} className="referrer-item">
                                            <div className="referrer-rank">{index + 1}</div>
                                            <div className="referrer-info">
                                                <strong>{referrer.name}</strong>
                                                <span className="muted">{referrer.email}</span>
                                            </div>
                                            <div className="referrer-count">{referrer.count} referrals</div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="muted center">No referrals yet</p>
                                )}
                            </div>
                        </div>

                        {/* Recent Candidates */}
                        <div className="card">
                            <div className="card-header">
                                <div>
                                    <p className="eyebrow">Recent Activity</p>
                                    <h2>Latest Candidates</h2>
                                </div>
                                <Clock size={20} style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <div className="candidates-list">
                                {stats.recentCandidates && stats.recentCandidates.length > 0 ? (
                                    stats.recentCandidates.map((candidate) => {
                                        const referrer = typeof candidate.referredBy === 'object' && candidate.referredBy
                                            ? candidate.referredBy
                                            : null;
                                        return (
                                            <div key={candidate._id} className="candidate-item">
                                                <div className="candidate-info">
                                                    <strong>{candidate.name}</strong>
                                                    <span className="muted">{candidate.jobTitle}</span>
                                                    {referrer && (
                                                        <span className="muted" style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
                                                            Referred by: {referrer.name} ({referrer.email})
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`badge ${candidate.status.toLowerCase()}`}>
                                                    {candidate.status}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="muted center">No candidates yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="card table-card">
                    <div className="card-header">
                        <div>
                            <p className="eyebrow">User Management</p>
                            <h2>All Users</h2>
                        </div>
                        <button type="button" onClick={loadUsers} disabled={usersLoading}>
                            {usersLoading ? 'Loading...' : 'Refresh'}
                        </button>
                    </div>

                    {usersLoading && users.length === 0 ? (
                        <div className="center">
                            <p className="muted">Loading users...</p>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((adminUser) => (
                                    <tr key={adminUser._id}>
                                        <td>
                                            <div className="primary-cell">
                                                <strong>{adminUser.name}</strong>
                                            </div>
                                        </td>
                                        <td>{adminUser.email}</td>
                                        <td>
                                            <select
                                                value={adminUser.role}
                                                disabled={busyUserId === adminUser._id || adminUser._id === user?.id}
                                                onChange={(e) =>
                                                    handleRoleChange(adminUser._id, e.target.value as 'admin' | 'user')
                                                }
                                                style={{
                                                    padding: '0.35rem 0.65rem',
                                                    borderRadius: 'var(--radius-sm)',
                                                    border: '2px solid var(--color-border)',
                                                    cursor: busyUserId === adminUser._id ? 'not-allowed' : 'pointer',
                                                }}
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td>{new Date(adminUser.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button
                                                type="button"
                                                className="icon danger"
                                                disabled={busyUserId === adminUser._id || adminUser._id === user?.id}
                                                onClick={() => handleDeleteUser(adminUser._id, adminUser.name)}
                                                title={
                                                    adminUser._id === user?.id
                                                        ? 'Cannot delete your own account'
                                                        : 'Delete user'
                                                }
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Candidates Tab */}
            {activeTab === 'candidates' && (
                <div className="card table-card">
                    <div className="card-header">
                        <div>
                            <p className="eyebrow">All Candidates</p>
                            <h2>Referrals Management</h2>
                        </div>
                        <button type="button" onClick={loadCandidates} disabled={candidatesLoading}>
                            {candidatesLoading ? 'Loading...' : 'Refresh'}
                        </button>
                    </div>

                    {candidatesLoading && candidates.length === 0 ? (
                        <div className="center">
                            <p className="muted">Loading candidates...</p>
                        </div>
                    ) : candidates.length === 0 ? (
                        <div className="center empty-state">
                            <p>No candidates found.</p>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Candidate</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Referred By</th>
                                    <th>Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {candidates.map((candidate) => {
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
                                                    <div className={`badge ${candidate.status.toLowerCase()}`}>
                                                        {candidate.status}
                                                    </div>
                                                    <select
                                                        value={candidate.status}
                                                        disabled={busyCandidateId === candidate._id}
                                                        onChange={(e) =>
                                                            handleStatusChange(
                                                                candidate._id,
                                                                e.target.value as CandidateStatus
                                                            )
                                                        }
                                                        style={{
                                                            borderRadius: 'var(--radius-sm)',
                                                            border: '2px solid var(--color-border)',
                                                            padding: '0.35rem 0.65rem',
                                                            fontSize: '0.85rem',
                                                            background: 'var(--color-surface)',
                                                            cursor: busyCandidateId === candidate._id ? 'not-allowed' : 'pointer',
                                                            transition: 'all var(--transition-base)',
                                                        }}
                                                    >
                                                        {CANDIDATE_STATUSES.map((status) => (
                                                            <option key={status} value={status}>
                                                                {status}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                            <td>
                                                {referrer ? (
                                                    <div className="primary-cell">
                                                        <strong>{referrer.name}</strong>
                                                        <span className="muted">{referrer.email}</span>
                                                        <span className="muted" style={{ fontSize: '0.75rem' }}>
                                                            ({referrer.role})
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="muted">—</span>
                                                )}
                                            </td>
                                            <td>{new Date(candidate.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

