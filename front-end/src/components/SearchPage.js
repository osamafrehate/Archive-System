import { useState, useEffect, useContext } from 'react';
import { CategoryContext } from '../context/CategoryContext';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/apiService';
import './SearchPage.css';
import Header from './Header';
import CategoryDropdown from './CategoryDropdown';
import StatusFileRow from './StatusFileRow';

export default function SearchPage() {
  // Get categories from global context (read-only for SearchPage)
  const { searchPageCategories } = useContext(CategoryContext);
  const { token } = useAuth();

  const [searchFilters, setSearchFilters] = useState({
    category: '',
    fileName: '',
    fileNumber: '',
    inputDate: '',
    expireDate: ''
  });

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const isCategorySelected = !!searchFilters.category;

  useEffect(() => {
    if (token) {
      loadFiles();
    }
  }, [token]);

  const loadFiles = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiService.getFiles(1, token);
      setFiles(data.items || data.files || data);
    } catch (err) {
      console.error('Failed to fetch files:', err);
      setError(err.message);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (value) => {
    if (value === 'Select a category') {
      setSearchFilters({
        category: '',
        fileName: '',
        fileNumber: '',
        inputDate: '',
        expireDate: ''
      });
      setFilteredFiles([]);
      setHasSearched(false);
      return;
    }

    setSearchFilters({
      category: value,
      fileName: '',
      fileNumber: '',
      inputDate: '',
      expireDate: ''
    });
    setFilteredFiles([]);
    setHasSearched(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({ ...prev, [name]: value }));
  };

  const checkIfEnableSearch = () => {
    if (!isCategorySelected) return false;

    return (
      searchFilters.fileName.trim() !== '' ||
      searchFilters.fileNumber.trim() !== '' ||
      searchFilters.inputDate !== '' ||
      searchFilters.expireDate !== ''
    );
  };

  const applyFilters = (filters) => {
    if (!filters.category) {
      setFilteredFiles([]);
      return;
    }

    let results = files.filter(file => (file.documentType || file.categoryName) === filters.category);

    if (filters.fileName.trim()) {
      results = results.filter(file =>
        (file.originalFilename || file.fileName).toLowerCase().includes(filters.fileName.toLowerCase())
      );
    }

    if (filters.fileNumber.trim()) {
      results = results.filter(file =>
        (file.fileNumber || '').toLowerCase().includes(filters.fileNumber.toLowerCase())
      );
    }

    if (filters.inputDate) {
      results = results.filter(file => (file.inputDate || '') === filters.inputDate);
    }

    if (filters.expireDate) {
      results = results.filter(file => (file.expireDate || '') === filters.expireDate);
    }

    setFilteredFiles(results);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!checkIfEnableSearch()) {
      setFilteredFiles([]);
      setHasSearched(true);
      return;
    }
    applyFilters(searchFilters);
    setHasSearched(true);
  };

  if (loading) {
    return (
      <div className="search-page">
        <Header />
        <div className="search-content">
          <h2 className="search-title">Search Files</h2>
          <div>Loading files...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page">
      <Header />

      <div className="search-content">
        <h2 className="search-title">Search Files</h2>

        <form className="search-form" onSubmit={handleSearchSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <CategoryDropdown
                categories={['Select a category', ...searchPageCategories]}
                selectedCategory={searchFilters.category || 'Select a category'}
                onCategoryChange={handleCategoryChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fileName">File Name</label>
              <input
                type="text"
                id="fileName"
                name="fileName"
                className="form-input"
                value={searchFilters.fileName}
                onChange={handleInputChange}
                placeholder="Enter file name"
                disabled={!isCategorySelected}
              />
            </div>

            <div className="form-group">
              <label htmlFor="fileNumber">File Number</label>
              <input
                type="text"
                id="fileNumber"
                name="fileNumber"
                className="form-input"
                value={searchFilters.fileNumber}
                onChange={handleInputChange}
                placeholder="Enter file number"
                disabled={!isCategorySelected}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="inputDate">Input Date</label>
              <input
                type="date"
                id="inputDate"
                name="inputDate"
                className="form-input"
                value={searchFilters.inputDate}
                onChange={handleInputChange}
                disabled={!isCategorySelected}
              />
            </div>

            <div className="form-group">
              <label htmlFor="expireDate">Expire Date</label>
              <input
                type="date"
                id="expireDate"
                name="expireDate"
                className="form-input"
                value={searchFilters.expireDate}
                onChange={handleInputChange}
                disabled={!isCategorySelected}
              />
            </div>
          </div>

          <div className="search-actions">
            <button
              type="submit"
              className={`search-button ${checkIfEnableSearch() ? 'enabled' : 'disabled'}`}
              disabled={!checkIfEnableSearch()}
            >
              Search
            </button>
          </div>
        </form>

        <div className="results-section">
          <h3>Search Results ({filteredFiles.length})</h3>
          {error ? (
            <div className="error-message">{error}</div>
          ) : !hasSearched ? (
            <p>Please select a category and fill at least one field before searching.</p>
          ) : filteredFiles.length === 0 ? (
            <p>No files found matching your criteria.</p>
          ) : (
            <div className="table-wrapper">
              <table className="status-file-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>File Name</th>
                    <th>File Number</th>
                    <th>Input Date</th>
                    <th>Expire Date</th>
                    <th>Uploaded At</th>
                    <th>Document Type</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map(file => (
                    <StatusFileRow key={file.id} file={file} showAmount={true} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

