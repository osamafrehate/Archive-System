import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const TOKEN_KEY = 'archive_auth_token';

  // Load from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken);
      const decoded = decodeJwt(storedToken);
      setRole(decoded.role);
      setUserId(decoded.userId);
      setUsername(decoded.username);
    }
    setIsLoading(false);
  }, []);

  const login = (newToken) => {
    if (!newToken) {
      console.error('No token provided to login');
      return;
    }
    
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    const decoded = decodeJwt(newToken);
    setRole(decoded.role);
    setUserId(decoded.userId);
    setUsername(decoded.username);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setRole(null);
    setUserId(null);
    setUsername(null);
  };

  const value = {
    token,
    role,
    userId,
    username,
    login,
    logout,
    isAuthenticated: !!token,
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

// Decode JWT helper
function decodeJwt(token) {
  try {
    if (!token || typeof token !== 'string') {
      return { userId: null, username: null, role: null };
    }
    
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      return { userId: null, username: null, role: null };
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
      role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
    };
  } catch (e) {
    console.error('Failed to decode token:', e);
    return { userId: null, username: null, role: null };
  }
}

