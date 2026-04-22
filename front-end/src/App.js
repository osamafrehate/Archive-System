import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AuthProvider } from './context/AuthContext';
import { CategoryProvider } from './context/CategoryContext';
import LoginPage from './components/LoginPage';
import UploadPage from './components/UploadPage';
import SearchPage from './components/SearchPage';
import StatusFilePage from './components/StatusFilePage';
import AdminPanelPage from './components/AdminPanelPage';
import NotFoundPage from './components/NotFoundPage';
import './App.css';

function AdminRoute({ children }) {
  const { role, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (role !== 'Admin') return <Navigate to="/access-denied" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <CategoryProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/status-file" element={<StatusFilePage />} />
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

