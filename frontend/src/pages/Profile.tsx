import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { getCurrentUser } from '../store/authSlice';
import { getProfile, updateProfile, updateUserRole } from '../lib/api';
import type { Profile, ProfileUpdatePayload } from '../types';

const formatRole = (role: string) => {
  return role
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [_profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProfileUpdatePayload>({
    headline: '',
    phone: '',
    location: '',
    linkedin: '',
    bio: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProfile();
      setProfile(data);
      if (data) {
        setFormData({
          headline: data.headline || '',
          phone: data.phone || '',
          location: data.location || '',
          linkedin: data.linkedin || '',
          bio: data.bio || '',
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateProfile(formData);
      setProfile(updated);
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (newRole: 'admin' | 'user' | 'hr_manager') => {
    if (!user || newRole === user.role) return;

    setUpdatingRole(true);
    setError(null);
    setSuccess(null);

    try {
      await updateUserRole(user.id, newRole);
      // Refresh user data to reflect the new role
      await dispatch(getCurrentUser());
      setSuccess(`Role updated to ${formatRole(newRole)} successfully!`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingRole(false);
    }
  };

  if (loading) {
    return (
      <div className="app-shell">
        <div className="center">
          <p className="muted">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Profile</p>
          <h1>My Profile</h1>
          <p className="muted">
            Manage your profile information and preferences.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="ghost"
        >
          ← Back to Dashboard
        </button>
      </header>

      {error && <div className="toast error">{error}</div>}
      {success && <div className="toast success">{success}</div>}

      <div className="layout-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="card form-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">User Information</p>
              <h2>Account Details</h2>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Name:</strong> {user?.name}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Email:</strong> {user?.email}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Role:</strong>{' '}
              {user?.role === 'admin' ? (
                <select
                  value={user.role}
                  disabled={updatingRole}
                  onChange={(e) =>
                    handleRoleChange(e.target.value as 'admin' | 'user' | 'hr_manager')
                  }
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '2px solid var(--color-border)',
                    cursor: updatingRole ? 'not-allowed' : 'pointer',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    marginLeft: '0.5rem',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    transition: 'all var(--transition-base)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-primary)';
                    e.target.style.boxShadow =
                      '0 0 0 4px rgba(99, 102, 241, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--color-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="user">User</option>
                  <option value="hr_manager">HR Manager</option>
                  <option value="admin">Admin</option>
                </select>
              ) : (
                <span>{formatRole(user?.role || 'user')}</span>
              )}
              {updatingRole && (
                <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                  (Updating...)
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="card-header">
              <div>
                <p className="eyebrow">Profile Information</p>
                <h2>Additional Details</h2>
              </div>
              <button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>

            <div className="grid two-cols">
              <label>
                <span>Headline</span>
                <input
                  type="text"
                  name="headline"
                  value={formData.headline}
                  onChange={handleChange}
                  placeholder="e.g., Senior Software Engineer"
                />
              </label>

              <label>
                <span>Phone</span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 222 333 4444"
                />
              </label>
            </div>

            <div className="grid two-cols">
              <label>
                <span>Location</span>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., San Francisco, CA"
                />
              </label>

              <label>
                <span>LinkedIn</span>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                />
              </label>
            </div>

            <label>
              <span>Bio</span>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows={6}
                style={{
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid var(--color-border)',
                  padding: '0.75rem 1rem',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  transition: 'all var(--transition-base)',
                  width: '100%',
                  resize: 'vertical',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)';
                  e.target.style.boxShadow =
                    '0 0 0 4px rgba(99, 102, 241, 0.1), var(--shadow-md)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </label>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

