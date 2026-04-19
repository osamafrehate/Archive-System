import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();

  const handleOpenStatusPage = () => {
    navigate('/status-file');
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
        </div>
      </div>
    </header>
  );
}
