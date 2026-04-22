import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/apiService';
import Header from './Header';
import StatusFileRow from './StatusFileRow';
import './StatusFilePage.css';

export default function StatusFilePage() {

  const { token } = useAuth();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);

  const PAGE_SIZE = 10;

  const fetchFiles = async (page) => {

    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {

      const data = await apiService.getFiles(page, token);

      setFiles(data);

      setCurrentPage(page);

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

  useEffect(() => {
    fetchFiles(1);
  }, [token]);

  const handlePrev = () => {

    if (currentPage > 1 && !loading) {
      fetchFiles(currentPage - 1);
    }

  };

  const handleNext = () => {

    if (hasMorePages && !loading) {
      fetchFiles(currentPage + 1);
    }

  };

  if (loading) {

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

              {files.map((file) => (

                <StatusFileRow
                  key={file.id}
                  file={{
                    user: file.uploadedByUsername,
                    originalFilename: file.fileName,
                    fileNumber: file.fileNumber,
                    inputDate: file.inputDate,
                    expireDate: file.expireDate,
                    uploadedAt: file.uploadedAt,
                    documentType: file.categoryName,
                    amount: file.amount,
                    status: file.status
                  }}
                />

              ))}

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

      </div>

    </div>
  );
}