import { useState, useContext } from 'react';
import { CategoryContext } from '../context/CategoryContext';
import './SearchPage.css';
import Header from './Header';
import CategoryDropdown from './CategoryDropdown';
import StatusFileRow from './StatusFileRow';

export default function SearchPage() {
  // Get categories from global context (read-only for SearchPage)
  // SearchPage uses searchPageCategories which only grows, never shrinks
  const { searchPageCategories } = useContext(CategoryContext);

  const [searchFilters, setSearchFilters] = useState({
    category: '',
    fileName: '',
    fileNumber: '',
    inputDate: '',
    expireDate: ''
  });

  const mockFiles = [
    {
      id: 1,
      user: 'Ahmed1',
      originalFilename: 'License_001.pdf',
      fileNumber: 'LIC-2026-001',
      inputDate: '2026-03-15',
      expireDate: '2027-10-15',
      uploadedAt: '2026-03-15 09:20',
      documentType: 'Official Licenses',
      amount: 1500.00
    },
    {
      id: 2,
      user: 'Mohammad',
      originalFilename: 'Insurance_Policy_002.pdf',
      fileNumber: 'INS-2026-002',
      inputDate: '2026-03-20',
      expireDate: '2026-08-10',
      uploadedAt: '2026-03-20 11:05',
      documentType: 'General Insurance Policies',
      amount: 2500.50
    },
    {
      id: 3,
      user: 'Hassan',
      originalFilename: 'Car_Insurance_003.pdf',
      fileNumber: 'CAR-2026-003',
      inputDate: '2026-03-25',
      expireDate: '2026-04-05',
      uploadedAt: '2026-03-25 14:13',
      documentType: 'Car Insurance Policies',
      amount: 3200.75
    },
    {
      id: 4,
      user: 'Salem',
      originalFilename: 'Contract_004.pdf',
      fileNumber: 'CON-2026-004',
      inputDate: '2026-03-10',
      expireDate: '2026-09-01',
      uploadedAt: '2026-03-10 08:45',
      documentType: 'Contracts',
      amount: 5000.00
    },
    {
      id: 5,
      user: 'Fatima',
      originalFilename: 'Agreement_005.pdf',
      fileNumber: 'AGR-2026-005',
      inputDate: '2026-03-05',
      expireDate: '2027-03-05',
      uploadedAt: '2026-03-05 10:30',
      documentType: 'Agreements',
      amount: 1800.25
    }
  ];

  const [filteredFiles, setFilteredFiles] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const isCategorySelected = !!searchFilters.category;

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

    let results = mockFiles.filter(file => file.documentType === filters.category);

    if (filters.fileName.trim()) {
      results = results.filter(file =>
        file.originalFilename.toLowerCase().includes(filters.fileName.toLowerCase())
      );
    }

    if (filters.fileNumber.trim()) {
      results = results.filter(file =>
        file.fileNumber.toLowerCase().includes(filters.fileNumber.toLowerCase())
      );
    }

    if (filters.inputDate) {
      results = results.filter(file => file.inputDate === filters.inputDate);
    }

    if (filters.expireDate) {
      results = results.filter(file => file.expireDate === filters.expireDate);
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
//  console.log('Search submitted with filters:');
    applyFilters(searchFilters);
    setHasSearched(true);
  };

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
          {!hasSearched ? (
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