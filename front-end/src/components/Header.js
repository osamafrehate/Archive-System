import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const { role, logout, isAuthenticated } = useAuth();
  const isAdmin = role === 'Admin';

  const handleOpenStatusPage = () => {
    navigate('/status-file');
  };

  const handleOpenAdminPanel = () => {
    navigate('/admin');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">ARCHIVE PRO</h1>

        <div className="header-buttons">
          <Link to="/upload" className="header-button text-button">
            Upload
          </Link>
          
          <button
            onClick={handleOpenStatusPage}
            className="header-button text-button"
            type="button"
          >
            Search
          </button>

          {isAdmin && (
            <button
              onClick={handleOpenAdminPanel}
              className="header-button text-button"
              type="button"
            >
              Admin Panel
            </button>
          )}

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="header-button logout-button"
              type="button"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

