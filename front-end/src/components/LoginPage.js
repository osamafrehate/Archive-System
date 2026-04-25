import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/apiService';
import './LoginPage.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/upload', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.login(username, password);
      login(response.accessToken, response.refreshToken);
      // Use replace: true to prevent back-button navigation to login
      navigate('/upload', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <h1 className="login-title">ARCHIVE PRO</h1>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="input-field"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Enter your username"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="input-field"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

