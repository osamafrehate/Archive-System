import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === 'Admin';

  const handleOpenStatusPage = () => {
    navigate('/status-file');
  };

  const handleOpenAdminPanel = () => {
    navigate('/admin');
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">ARCHIVE PRO</h1>

        <div className="header-buttons">
          <Link to="/upload" className="header-button text-button">
            Upload
          </Link>
          {/* <Link to="/search" className="header-button text-button">
            Search
          </Link> */}
          
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
        </div>
      </div>
    </header>
  );
}
