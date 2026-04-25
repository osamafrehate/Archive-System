import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/apiService';
import { CategoryContext } from '../context/CategoryContext';
import Header from './Header';
import StatusFileRow from './StatusFileRow';
import { exportToExcel } from '../utils/excelExportUtils';
import './StatusFilePage.css';

export default function StatusFilePage() {

  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { categories } = useContext(CategoryContext);

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [categoryId, setCategoryId] = useState(null);
  const [fileNumber, setFileNumber] = useState('');
  const [yearInput, setYearInput] = useState(''); // For typing
  const [yearFilter, setYearFilter] = useState(''); // For filtering
  const [statusFilter, setStatusFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);

  const PAGE_SIZE = 50;

  // Parse URL query parameters on component mount
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    
    const page = parseInt(queryParams.get('page')) || 1;
    const cat = queryParams.get('categoryId') ? parseInt(queryParams.get('categoryId')) : null;
    const fileNum = queryParams.get('fileNumber') || '';
    const yr = queryParams.get('year') || '';
    const stat = queryParams.get('status') || '';

    setCurrentPage(page);
    setCategoryId(cat);
    setFileNumber(fileNum);
    setYearInput(yr);
    setYearFilter(yr);
    setStatusFilter(stat);
  }, [location.search]);

  // Fetch files whenever page or filters change
  useEffect(() => {
    fetchFiles(currentPage, categoryId, fileNumber, yearFilter, statusFilter);
  }, [currentPage, categoryId, fileNumber, yearFilter, statusFilter, token]);

  const fetchFiles = async (page, catId, fileNum, yr, stat) => {

    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {

      const filters = {};
      if (catId) filters.categoryId = catId;
      if (fileNum) filters.fileNumber = fileNum;
      if (yr) filters.year = yr;
      if (stat) filters.status = stat;

      const data = await apiService.getFiles(page, token, filters);

      setFiles(data);

      // if returned files == page size → there might be another page
      setHasMorePages(data.length === PAGE_SIZE);

    } catch (err) {

      console.error('Failed to fetch files:', err);
      setError(err.message);
      setFiles([]);

    } finally {

      setLoading(false);

    }

  };

  // Update URL when filters change
  const updateFilters = (newCategoryId, newFileNumber, newYear, newStatus, newPage = 1) => {
    const queryParams = new URLSearchParams();
    
    if (newPage) queryParams.append('page', newPage);
    if (newCategoryId) queryParams.append('categoryId', newCategoryId);
    if (newFileNumber) queryParams.append('fileNumber', newFileNumber);
    if (newYear) queryParams.append('year', newYear);
    if (newStatus) queryParams.append('status', newStatus);

    navigate(`?${queryParams.toString()}`);
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value ? parseInt(e.target.value) : null;
    setCategoryId(catId);
    updateFilters(catId, fileNumber, yearFilter, statusFilter, 1); // Reset to page 1
    setCurrentPage(1);
  };

  const handleFileNumberChange = (e) => {
    const fileNum = e.target.value;
    setFileNumber(fileNum);
    updateFilters(categoryId, fileNum, yearFilter, statusFilter, 1); // Reset to page 1
    setCurrentPage(1);
  };

  const handleYearChange = (e) => {
    // Only update input state, don't filter yet
    setYearInput(e.target.value);
  };

  const handleYearBlur = () => {
    // Apply filter when user leaves the field
    setYearFilter(yearInput);
    updateFilters(categoryId, fileNumber, yearInput, statusFilter, 1);
    setCurrentPage(1);
  };

  const handleYearKeyPress = (e) => {
    // Apply filter when user presses Enter
    if (e.key === 'Enter') {
      setYearFilter(yearInput);
      updateFilters(categoryId, fileNumber, yearInput, statusFilter, 1);
      setCurrentPage(1);
    }
  };

  const handleStatusChange = (e) => {
    const stat = e.target.value;
    setStatusFilter(stat);
    updateFilters(categoryId, fileNumber, yearFilter, stat, 1); // Reset to page 1
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setCategoryId(null);
    setFileNumber('');
    setYearInput('');
    setYearFilter('');
    setStatusFilter('');
    setCurrentPage(1);
    navigate('?page=1');
  };

  const handlePrev = () => {

    if (currentPage > 1 && !loading) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      const queryParams = new URLSearchParams();
      queryParams.append('page', newPage);
      if (categoryId) queryParams.append('categoryId', categoryId);
      if (fileNumber) queryParams.append('fileNumber', fileNumber);
      if (yearFilter) queryParams.append('year', yearFilter);
      if (statusFilter) queryParams.append('status', statusFilter);
      navigate(`?${queryParams.toString()}`);
    }

  };

  const handleNext = () => {

    if (hasMorePages && !loading) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      const queryParams = new URLSearchParams();
      queryParams.append('page', newPage);
      if (categoryId) queryParams.append('categoryId', categoryId);
      if (fileNumber) queryParams.append('fileNumber', fileNumber);
      if (yearFilter) queryParams.append('year', yearFilter);
      if (statusFilter) queryParams.append('status', statusFilter);
      navigate(`?${queryParams.toString()}`);
    }

  };

  const handleExport = () => {
    if (files.length === 0) {
      alert('No files to export');
      return;
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    exportToExcel(files, `Files_${timestamp}.csv`);
  };

  if (loading && files.length === 0) {

    return (
      <div className="status-file-page">
        <Header />
        <div className="status-file-content">
          <div className="loading">Loading files...</div>
        </div>
      </div>
    );

  }

  return (
    <div className="status-file-page">

      <Header />

      <div className="status-file-content">

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filters-container">
            
            <div className="filter-group">
              <label htmlFor="category-filter">Category:</label>
              <select
                id="category-filter"
                value={categoryId || ''}
                onChange={handleCategoryChange}
                className="filter-input"
              >
                <option value="">-- All Categories --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="file-number-filter">File Number:</label>
              <input
                id="file-number-filter"
                type="text"
                placeholder="Search file number..."
                value={fileNumber}
                onChange={handleFileNumberChange}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="year-filter">Year:</label>
              <input
                id="year-filter"
                type="text"
                placeholder="YYYY (e.g., 2027)"
                value={yearInput}
                onChange={handleYearChange}
                onBlur={handleYearBlur}
                onKeyPress={handleYearKeyPress}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="status-filter">Status:</label>
              <select
                id="status-filter"
                value={statusFilter || ''}
                onChange={handleStatusChange}
                className="filter-input"
              >
                <option value="">-- All Status --</option>
                <option value="RED">Expired Soon (≤14 days)</option>
                <option value="YELLOW">Expiring (≤180 days)</option>
                <option value="GREEN">Not Expiring (>180 days)</option>
                
              </select>
            </div>

            <button
              className="clear-filters-btn"
              onClick={handleClearFilters}
              disabled={!categoryId && !fileNumber && !yearFilter && !statusFilter}
            >
              Clear Filters
            </button>

          </div>
        </div>

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
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {files.length > 0 ? (
                files.map((file) => (

                  <StatusFileRow
                    key={file.id}
                    file={{
                      id: file.id,
                      user: file.uploadedByUsername,
                      originalFilename: file.fileName,
                      fileName: file.fileName,
                      fileNumber: file.fileNumber,
                      inputDate: file.inputDate,
                      expireDate: file.expireDate,
                      uploadedAt: file.uploadedAt,
                      documentType: file.categoryName,
                      amount: file.amount,
                      status: file.status
                    }}
                  />

                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                    {loading ? 'Loading...' : 'No files found'}
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

        <div className="pagination-section">

          <div className="pagination-wrapper">

            <div className="pagination nice-pagination">

              <button
                className="pagination-btn btn-prev"
                onClick={handlePrev}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </button>

              <span className="page-info">
                Page {currentPage}
              </span>

              <button
                className="pagination-btn btn-next"
                onClick={handleNext}
                disabled={!hasMorePages || loading}
              >
                Next
              </button>

            </div>

          </div>

        </div>

        <div className="export-section">
          <button
            className="export-btn"
            onClick={handleExport}
            disabled={files.length === 0 || loading}
            title="Export current page files to Excel"
          >
            📊 Export to Excel
          </button>
        </div>

      </div>

    </div>
  );
}