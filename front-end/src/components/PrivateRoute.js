import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function PrivateRoute({ children, adminOnly = false }) {
  const { isAuthenticated, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && role !== 'Admin') {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}

