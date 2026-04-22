import { useState, useContext, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/apiService';
import { CategoryContext } from '../context/CategoryContext';
import './UploadPage.css';
import Header from './Header';
import CategoryDropdown from './CategoryDropdown';
import UploadForm from './UploadForm';



export default function UploadPage() {
  // Get categories from global context
  const { categories, setCategories, syncWithSearchPage } = useContext(CategoryContext);
  const { token } = useAuth();
  
  const [editCategories, setEditCategories] = useState([]);

  useEffect(() => {
    if (token) {
      apiService.getUserCategoriesEditPermission(token)
        .then(setEditCategories)
        .catch(error => {
          console.error('Failed to fetch edit categories:', error);
          setEditCategories([]);
        });
    } else {
      setEditCategories([]);
    }
  }, [token]);

  const [selectedCategory, setSelectedCategory] = useState('');


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempCategories, setTempCategories] = useState([]);
  const [originalCategories, setOriginalCategories] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState(null);

  const handleOpenPopup = async () => {
    try {
      const editableCats = await apiService.getUserCategoriesEditPermission(token);
      const editableNames = editableCats.map(cat => cat.name);
      setTempCategories(editableNames);
      setOriginalCategories(editableNames);
      setHasChanges(false);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to load editable categories:', error);
      // Fallback to context categories
      setOriginalCategories([...categories]);
      setTempCategories([...categories]);
      setHasChanges(false);
      setIsModalOpen(true);
    }
  };


  const handleClosePopup = () => {
    setIsModalOpen(false);
    setIsConfirmSaveOpen(false);
    setIsConfirmDeleteOpen(false);
    setPendingDeleteIndex(null);
    setHasChanges(false);
  };

  const handleEditCategory = (index, value) => {
    const updated = [...tempCategories];
    updated[index] = value;
    setTempCategories(updated);
    setHasChanges(true);
  };

  const handleAddCategory = () => {
    setTempCategories([...tempCategories, '']);
    setHasChanges(true);
  };

  const handleDeleteCategory = (index) => {
    setPendingDeleteIndex(index);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteIndex === null) return;

    const updated = tempCategories.filter((_, idx) => idx !== pendingDeleteIndex);
    setTempCategories(updated);
    setHasChanges(true);
    setPendingDeleteIndex(null);
    setIsConfirmDeleteOpen(false);
  };

  const handleCancelDelete = () => {
    setPendingDeleteIndex(null);
    setIsConfirmDeleteOpen(false);
  };

  const handleSaveChanges = () => {
    if (!hasChanges) return;
    setIsConfirmSaveOpen(true);
  };

  const handleConfirmSave = () => {
    // Clean up empty strings and trim whitespace
    const cleaned = tempCategories.map(item => item.trim()).filter(item => item !== '');
    
    // Find new categories that weren't in the original list
    const newAddedCategories = cleaned.filter(cat => !originalCategories.includes(cat));
    
    // Sync new categories with SearchPage before updating main categories
    newAddedCategories.forEach(cat => syncWithSearchPage(cat));
    
    // Save the complete list (including deletions, additions, and edits)
    // This syncs all changes to the context for AdminPanel to see
    setCategories(cleaned);

    if (!cleaned.includes(selectedCategory)) {
      setSelectedCategory('');
    }

    setIsConfirmSaveOpen(false);
    setIsModalOpen(false);
    setHasChanges(false);
  };

  const handleCancelSave = () => {
    setIsConfirmSaveOpen(false);
  };

  return (
    <div className="upload-page">
      <Header />
      <div className="upload-content">
        <div className="category-section">
          <span className="document-type-label">Document Type:</span>

          <CategoryDropdown
            categories={['Select a category', ...categories.map(cat => cat.name || cat)]}
            selectedCategory={selectedCategory || 'Select a category'}
            onCategoryChange={(value) => {
              if (value === 'Select a category') {
                setSelectedCategory('');
              } else {
                setSelectedCategory(value);
              }
            }}
          />

          {editCategories.length > 0 && (
            <button className="manage-button" onClick={handleOpenPopup}>
              Manage Categories
            </button>
          )}

        </div>

        <UploadForm selectedCategory={selectedCategory} />
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleClosePopup}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h2>Manage Categories</h2>

            <div className="category-list">
              {tempCategories.map((cat, index) => (
                <div key={`category-${index}`} className="category-item">
                  <input
                    value={cat}
                    onChange={(e) => handleEditCategory(index, e.target.value)}
                    className="category-input"
                    placeholder="Category name"
                  />
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteCategory(index)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <button className="add-button" onClick={handleAddCategory}>
              Add Category
            </button>

            <div className="modal-actions">
              <button className="close-button" onClick={handleClosePopup}>
                Close
              </button>
              <button
                className={`save-button ${hasChanges ? 'active' : 'disabled'}`}
                onClick={handleSaveChanges}
                disabled={!hasChanges}
              >
                Save
              </button>
            </div>

            {isConfirmSaveOpen && (
              <div className="confirm-overlay" onClick={handleCancelSave}>
                <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
                  <p>Are you sure to save these changes?</p>
                  <div className="confirm-actions">
                    <button className="ok-button" onClick={handleConfirmSave}>
                      OK
                    </button>
                    <button className="no-button" onClick={handleCancelSave}>
                      No
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isConfirmDeleteOpen && (
              <div className="confirm-overlay" onClick={handleCancelDelete}>
                <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
                  <p>Are you sure to delete this category?</p>
                  <div className="confirm-actions">
                    <button className="ok-button" onClick={handleConfirmDelete}>
                      Yes
                    </button>
                    <button className="no-button" onClick={handleCancelDelete}>
                      No
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
