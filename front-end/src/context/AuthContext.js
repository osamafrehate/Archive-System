import { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../services/apiService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const ACCESS_TOKEN_KEY = 'archive_access_token';
  const REFRESH_TOKEN_KEY = 'archive_refresh_token';
  const refreshIntervalRef = useRef(null);

  const decodeJwt = useCallback((token) => {
    try {
      if (!token || typeof token !== 'string') {
        return { userId: null, username: null, role: null, exp: null };
      }
      const base64Url = token.split('.')[1];
      if (!base64Url) {
        return { userId: null, username: null, role: null, exp: null };
      }
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      return {
        userId: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        username: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
        role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
        exp: payload.exp
      };
    } catch (e) {
      console.error('Failed to decode token:', e);
      return { userId: null, username: null, role: null, exp: null };
    }
  }, []);

  const isTokenExpired = useCallback((token) => {
    const decoded = decodeJwt(token);
    if (!decoded.exp) return true;
    const expiryTime = decoded.exp * 1000;
    return Date.now() >= expiryTime;
  }, [decodeJwt]);

  const isTokenExpiringSoon = useCallback((token, bufferMinutes = 5) => {
    const decoded = decodeJwt(token);
    if (!decoded.exp) return true;
    const expiryTime = decoded.exp * 1000;
    return Date.now() >= (expiryTime - bufferMinutes * 60 * 1000);
  }, [decodeJwt]);

  const clearAuthState = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setAccessToken(null);
    setRefreshToken(null);
    setRole(null);
    setUserId(null);
    setUsername(null);
    setIsAuthenticated(false);
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  const performLogout = useCallback(async () => {
    const currentRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (currentRefreshToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: currentRefreshToken })
        });
      } catch (e) {
        console.error('Logout API call failed:', e);
      }
    }
    clearAuthState();
    // Prevent back-button access to protected pages
    window.history.pushState(null, '', '/login');
    window.location.href = '/login';
  }, [clearAuthState]);

  const refreshAccessToken = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!storedRefreshToken) {
      clearAuthState();
      window.location.href = '/login';
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefreshToken })
      });

      if (!response.ok) {
        clearAuthState();
        window.location.href = '/login';
        return false;
      }

      const data = await response.json();
      if (data.accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
        setAccessToken(data.accessToken);
        const decoded = decodeJwt(data.accessToken);
        setRole(decoded.role);
        setUserId(decoded.userId);
        setUsername(decoded.username);
        setIsAuthenticated(true);
        return true;
      }
    } catch (e) {
      console.error('Token refresh failed:', e);
    }

    clearAuthState();
    window.location.href = '/login';
    return false;
  }, [clearAuthState, decodeJwt]);

  const login = useCallback((newAccessToken, newRefreshToken) => {
    if (!newAccessToken || !newRefreshToken) {
      console.error('Both access and refresh tokens are required');
      return;
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    const decoded = decodeJwt(newAccessToken);
    setRole(decoded.role);
    setUserId(decoded.userId);
    setUsername(decoded.username);
    setIsAuthenticated(true);

    // Prevent back-button navigation to login
    window.history.pushState(null, '', window.location.href);
  }, [decodeJwt]);

  const logout = useCallback(() => {
    performLogout();
  }, [performLogout]);

  // Load from localStorage on mount
  useEffect(() => {
    const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (storedAccessToken && storedRefreshToken) {
      if (isTokenExpired(storedAccessToken)) {
        // Try to refresh if access token is expired
        refreshAccessToken().then(() => setIsLoading(false));
      } else {
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
        const decoded = decodeJwt(storedAccessToken);
        setRole(decoded.role);
        setUserId(decoded.userId);
        setUsername(decoded.username);
        setIsAuthenticated(true);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [decodeJwt, isTokenExpired, refreshAccessToken]);

  // Set up automatic token refresh interval
  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    // Check every 2 minutes if token needs refresh
    refreshIntervalRef.current = setInterval(() => {
      const currentAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (currentAccessToken && isTokenExpiringSoon(currentAccessToken)) {
        refreshAccessToken();
      }
    }, 2 * 60 * 1000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [isAuthenticated, accessToken, isTokenExpiringSoon, refreshAccessToken]);

  // Validate auth on route changes (popstate = back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!storedAccessToken || isTokenExpired(storedAccessToken)) {
        clearAuthState();
        window.location.href = '/login';
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [clearAuthState, isTokenExpired]);

  const value = {
    token: accessToken,
    accessToken,
    refreshToken,
    role,
    userId,
    username,
    login,
    logout,
    refreshAccessToken,
    isAuthenticated,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

