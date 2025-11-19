import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Shield } from 'lucide-react';
import type { AppDispatch, RootState } from '../store/store';
import { logout } from '../store/authSlice';

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <h2>Candidate Referral System</h2>
          </Link>
          <div className="navbar-links">
            <Link to="/login" className="navbar-link">
              Login
            </Link>
            <Link to="/signup" className="navbar-link navbar-link-primary">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h2>Candidate Referral System</h2>
        </Link>
        <div className="navbar-links">
          {user?.role === 'admin' && (
            <Link to="/admin" className="navbar-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} />
              Admin
            </Link>
          )}
          {user && (
            <Link to="/profile" className="navbar-user-link">
              <div className="navbar-user">
                <span className="navbar-user-name">{user.name}</span>
                <span className="navbar-user-role">{user.role}</span>
              </div>
            </Link>
          )}
          <button type="button" onClick={handleLogout} className="navbar-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

