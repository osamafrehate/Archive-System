import React, { useState } from 'react';
import './UploadForm.css';

const DeleteConfirmationModal = ({ isOpen, fileName, onConfirm, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setIsLoading(true);
    setError('');
    try {
      await onConfirm();
    } catch (err) {
      setError(err.message || 'Failed to delete file');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '500px' }}>
        <h2 style={{ color: '#d32f2f', marginTop: '2%' }}>Delete File</h2>
        <p style={{ marginLeft: '5%', fontSize: '16px' }}>
          Are you sure you want to delete <strong>"{fileName}"</strong>?
        </p>
        <p style={{ marginLeft: '5%', fontSize: '14px', color: '#666' }}>
          This action cannot be undone. The file will be marked as deleted and will no longer be accessible.
        </p>

        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#d32f2f',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: isLoading ? 0.6 : 1,
              marginBottom: '2%',

            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: isLoading ? 0.6 : 1,
              marginBottom: '2%',
              marginRight: '10px',
            }}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
