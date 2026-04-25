import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AuthProvider } from './context/AuthContext';
import { CategoryProvider } from './context/CategoryContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './components/LoginPage';
import UploadPage from './components/UploadPage';
import SearchPage from './components/SearchPage';
import StatusFilePage from './components/StatusFilePage';
import AdminPanelPage from './components/AdminPanelPage';
import NotFoundPage from './components/NotFoundPage';
import './App.css';

function AdminRoute({ children }) {
  return (
    <PrivateRoute adminOnly={true}>
      {children}
    </PrivateRoute>
  );
}

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  // Redirect authenticated users away from login page
  if (isAuthenticated) {
    return <Navigate to="/upload" replace />;
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <CategoryProvider>
        <Router>
          <Routes>
            <Route path="/" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            <Route path="/upload" element={
              <PrivateRoute>
                <UploadPage />
              </PrivateRoute>
            } />
            <Route path="/search" element={
              <PrivateRoute>
                <SearchPage />
              </PrivateRoute>
            } />
            <Route path="/status-file" element={
              <PrivateRoute>
                <StatusFilePage />
              </PrivateRoute>
            } />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminPanelPage />
              </AdminRoute>
            } />
            <Route path="/access-denied" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </CategoryProvider>
    </AuthProvider>
  );
}

export default App;

