import { useState, useContext, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/apiService';
import { CategoryContext } from '../context/CategoryContext';
import './UploadForm.css';
import './EditFileModal.css';

export default function EditFileModal({ file, isOpen, onClose, onSave }) {
  const { token } = useAuth();
  const { categories } = useContext(CategoryContext);
  const [loading, setLoading] = useState(false);
  const [allCategories, setAllCategories] = useState([]);

  const [formData, setFormData] = useState({
    fileName: '',
    fileNumber: '',
    categoryId: '',
    inputDate: '',
    expireDate: '',
    amount: ''
  });

  // Fetch all categories where user has WRITE permission
  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) return;
      try {
        const data = await apiService.getUserCategories(token);
        setAllCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, [token]);

  // Pre-fill form when file data is provided
  useEffect(() => {
    if (file && isOpen) {
      setFormData({
        fileName: file.fileName || '',
        fileNumber: file.fileNumber || '',
        categoryId: file.categoryId || '',
        inputDate: file.inputDate ? file.inputDate.split('T')[0] : '',
        expireDate: file.expireDate ? file.expireDate.split('T')[0] : '',
        amount: file.amount || ''
      });
    }
  }, [file, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isFormValid = () => {
    return formData.fileName.trim() !== '' &&
           formData.fileNumber.trim() !== '' &&
           formData.categoryId !== '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setLoading(true);
    try {
      // Validate dates if provided
      const inputDateObj = formData.inputDate ? new Date(formData.inputDate) : null;
      const expireDateObj = formData.expireDate ? new Date(formData.expireDate) : null;

      if (inputDateObj && expireDateObj && expireDateObj < inputDateObj) {
        alert('Expire Date must be after Input Date');
        setLoading(false);
        return;
      }

      const updateData = {
        fileName: formData.fileName,
        fileNumber: formData.fileNumber,
        categoryId: parseInt(formData.categoryId),
        inputDate: formData.inputDate || null,
        expireDate: formData.expireDate || null,
        amount: formData.amount ? parseFloat(formData.amount) : null
      };

      await apiService.updateFileMetadata(file.id, updateData, token);
      
      alert('File metadata updated successfully');
      
      // Call onSave callback to update parent component
      if (onSave) {
        // Get the category name for the updated category
        const selectedCategory = allCategories.find(cat => cat.id === parseInt(formData.categoryId));
        const categoryName = selectedCategory?.name || file.documentType || 'N/A';
        
        onSave({
          ...file,
          ...updateData,
          documentType: categoryName,
          categoryName: categoryName
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      if (error.message.includes('403')) {
        alert('Access Denied - You do not have EDIT FILE permission for this category.');
      } else {
        alert(`Update failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container edit-file-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit File Metadata</h2>
          <button className="modal-close" onClick={onClose} type="button">✕</button>
        </div>

        <form className="edit-file-form" onSubmit={handleSubmit}>
          <div className="form-group full-width">
            <label htmlFor="categoryId">Category *</label>
            <select
              id="categoryId"
              name="categoryId"
              className="form-input"
              value={formData.categoryId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a category</option>
              {allCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group full-width">
            <label htmlFor="fileName">File Name *</label>
            <input
              type="text"
              id="fileName"
              name="fileName"
              className="form-input"
              value={formData.fileName}
              onChange={handleInputChange}
              placeholder="Enter file name"
              required
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="fileNumber">File Number *</label>
            <input
              type="text"
              id="fileNumber"
              name="fileNumber"
              className="form-input"
              value={formData.fileNumber}
              onChange={handleInputChange}
              placeholder="Enter file number"
              required
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="inputDate">Document Date</label>
            <input
              type="date"
              id="inputDate"
              name="inputDate"
              className="form-input"
              value={formData.inputDate}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="expireDate">Expire Date</label>
            <input
              type="date"
              id="expireDate"
              name="expireDate"
              className="form-input"
              value={formData.expireDate}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              className="form-input"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Enter amount (optional)"
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`submit-button ${isFormValid() && !loading ? 'enabled' : 'disabled'}`}
              disabled={!isFormValid() || loading}
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
