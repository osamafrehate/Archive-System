import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CategoryProvider } from './context/CategoryContext';
import LoginPage from './components/LoginPage';
import UploadPage from './components/UploadPage';
import SearchPage from './components/SearchPage';
import StatusFilePage from './components/StatusFilePage';
import AdminPanelPage from './components/AdminPanelPage';
import NotFoundPage from './components/NotFoundPage';
import './App.css';

function App() {
  return (
    <CategoryProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/status-file" element={<StatusFilePage />} />
          <Route path="/admin" element={<AdminPanelPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </CategoryProvider>
  );
}

export default App;
