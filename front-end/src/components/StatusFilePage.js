import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/apiService';
import Header from './Header';
import StatusFileRow from './StatusFileRow';
import EditFileModal from './EditFileModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { exportToExcel } from '../utils/excelExportUtils';
import './StatusFilePage.css';

export default function StatusFilePage() {

  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [files, setFiles] = useState([]);
  const [readCategories, setReadCategories] = useState([]);
  const [editFileCategories, setEditFileCategories] = useState([]);
  const [deleteFileCategories, setDeleteFileCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFileForEdit, setSelectedFileForEdit] = useState(null);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFileForDelete, setSelectedFileForDelete] = useState(null);

  // Filter states
  const [categoryId, setCategoryId] = useState(null);
  const [fileName, setFileName] = useState('');
  const [yearInput, setYearInput] = useState(''); // For typing
  const [yearFilter, setYearFilter] = useState(''); // For filtering
  const [statusFilter, setStatusFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);

  // Fetch categories with READ permission for the filter dropdown
  useEffect(() => {
    const fetchReadCategories = async () => {
      if (!token) return;
      try {
        const data = await apiService.getUserCategoriesReadPermission(token);
        setReadCategories(data);
      } catch (err) {
        console.error('Failed to fetch READ categories:', err);
        setReadCategories([]);
      }
    };
    fetchReadCategories();
  }, [token]);

  // Fetch categories with EDIT FILE permission for showing edit icons
  useEffect(() => {
    const fetchEditFileCategories = async () => {
      if (!token) return;
      try {
        const data = await apiService.getUserCategoriesEditFilePermission(token);
        setEditFileCategories(data);
      } catch (err) {
        console.error('Failed to fetch EDIT FILE categories:', err);
        setEditFileCategories([]);
      }
    };
    fetchEditFileCategories();
  }, [token]);

  // Fetch categories with DELETE FILE permission for showing delete icons
  useEffect(() => {
    const fetchDeleteFileCategories = async () => {
      if (!token) return;
      try {
        const data = await apiService.getUserCategoriesDeleteFilePermission(token);
        setDeleteFileCategories(data);
      } catch (err) {
        console.error('Failed to fetch DELETE FILE categories:', err);
        setDeleteFileCategories([]);
      }
    };
    fetchDeleteFileCategories();
  }, [token]);

  const PAGE_SIZE = 50;

  // Parse URL query parameters on component mount
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    
    const page = parseInt(queryParams.get('page')) || 1;
    const cat = queryParams.get('categoryId') ? parseInt(queryParams.get('categoryId')) : null;
    const fname = queryParams.get('fileName') || '';
    const yr = queryParams.get('year') || '';
    const stat = queryParams.get('status') || '';

    setCurrentPage(page);
    setCategoryId(cat);
    setFileName(fname);
    setYearInput(yr);
    setYearFilter(yr);
    setStatusFilter(stat);
  }, [location.search]);

  // Fetch files whenever page or filters change
  useEffect(() => {
    fetchFiles(currentPage, categoryId, fileName, yearFilter, statusFilter);
  }, [currentPage, categoryId, fileName, yearFilter, statusFilter, token]);

  const fetchFiles = async (page, catId, fname, yr, stat) => {

    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {

      const filters = {};
      if (catId) filters.categoryId = catId;
      if (fname) filters.fileName = fname;
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
  const updateFilters = (newCategoryId, newFileName, newYear, newStatus, newPage = 1) => {
    const queryParams = new URLSearchParams();
    
    if (newPage) queryParams.append('page', newPage);
    if (newCategoryId) queryParams.append('categoryId', newCategoryId);
    if (newFileName) queryParams.append('fileName', newFileName);
    if (newYear) queryParams.append('year', newYear);
    if (newStatus) queryParams.append('status', newStatus);

    navigate(`?${queryParams.toString()}`);
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value ? parseInt(e.target.value) : null;
    setCategoryId(catId);
    updateFilters(catId, fileName, yearFilter, statusFilter, 1); // Reset to page 1
    setCurrentPage(1);
  };

  const handleFileNameChange = (e) => {
    const fname = e.target.value;
    setFileName(fname);
    updateFilters(categoryId, fname, yearFilter, statusFilter, 1); // Reset to page 1
    setCurrentPage(1);
  };

  const handleYearChange = (e) => {
    // Only update input state, don't filter yet
    setYearInput(e.target.value);
  };

  const handleYearBlur = () => {
    // Apply filter when user leaves the field
    setYearFilter(yearInput);
    updateFilters(categoryId, fileName, yearInput, statusFilter, 1);
    setCurrentPage(1);
  };

  const handleYearKeyPress = (e) => {
    // Apply filter when user presses Enter
    if (e.key === 'Enter') {
      setYearFilter(yearInput);
      updateFilters(categoryId, fileName, yearInput, statusFilter, 1);
      setCurrentPage(1);
    }
  };

  const handleStatusChange = (e) => {
    const stat = e.target.value;
    setStatusFilter(stat);
    updateFilters(categoryId, fileName, yearFilter, stat, 1); // Reset to page 1
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setCategoryId(null);
    setFileName('');
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
      if (fileName) queryParams.append('fileName', fileName);
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
      if (fileName) queryParams.append('fileName', fileName);
      if (yearFilter) queryParams.append('year', yearFilter);
      if (statusFilter) queryParams.append('status', statusFilter);
      navigate(`?${queryParams.toString()}`);
    }

  };

  const handleExport = async () => {
    if (files.length === 0) {
      alert('No files to export');
      return;
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    await exportToExcel(files, `Files_${timestamp}.xlsx`);
  };

  const handleOpenEditModal = (file) => {
    setSelectedFileForEdit(file);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedFileForEdit(null);
  };

  const handleSaveFileMetadata = (updatedFile) => {
    // Update the file in the list with new metadata
    setFiles(prevFiles =>
      prevFiles.map(f =>
        f.id === updatedFile.id
          ? {
              ...f,
              fileName: updatedFile.fileName,
              fileNumber: updatedFile.fileNumber,
              categoryId: updatedFile.categoryId,
              categoryName: updatedFile.categoryName || updatedFile.documentType,
              inputDate: updatedFile.inputDate,
              expireDate: updatedFile.expireDate,
              amount: updatedFile.amount
            }
          : f
      )
    );
    handleCloseEditModal();
  };

  const handleOpenDeleteModal = (file) => {
    setSelectedFileForDelete(file);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedFileForDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedFileForDelete || !token) return;

    try {
      await apiService.deleteFile(selectedFileForDelete.id, token);
      // Remove file from current page (deleted files move to last page naturally via database sorting)
      setFiles(prevFiles => prevFiles.filter(f => f.id !== selectedFileForDelete.id));
      handleCloseDeleteModal();
    } catch (err) {
      console.error('Failed to delete file:', err);
      alert('Failed to delete file: ' + err.message);
    }
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
              <label htmlFor="category-filter">Documents:</label>
              <select
                id="category-filter"
                value={categoryId || ''}
                onChange={handleCategoryChange}
                className="filter-input"
              >
                <option value="">-- Document Types --</option>
                {readCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="file-name-filter">File Name:</label>
              <input
                id="file-name-filter"
                type="text"
                placeholder="Search file name..."
                value={fileName}
                onChange={handleFileNameChange}
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
              disabled={!categoryId && !fileName && !yearFilter && !statusFilter}
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
                <th>Document Date</th>
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
                      categoryId: file.categoryId,
                      user: file.uploadedByUsername,
                      originalFilename: file.fileName,
                      fileName: file.fileName,
                      fileNumber: file.fileNumber,
                      inputDate: file.inputDate,
                      expireDate: file.expireDate,
                      uploadedAt: file.uploadedAt,
                      documentType: file.categoryName,
                      amount: file.amount,
                      status: file.status,
                      isDeleted: file.isDeleted
                    }}
                    canEdit={editFileCategories.some(cat => cat.id === file.categoryId)}
                    onEdit={handleOpenEditModal}
                    canDelete={deleteFileCategories.some(cat => cat.id === file.categoryId)}
                    onDelete={handleOpenDeleteModal}
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

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        fileName={selectedFileForDelete?.fileName}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteModal}
      />

      <EditFileModal
        file={selectedFileForEdit}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveFileMetadata}
      />

    </div>
  );
}