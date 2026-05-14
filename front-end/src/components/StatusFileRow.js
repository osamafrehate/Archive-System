import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/apiService.js';
import { formatDate } from '../utils/dateUtils.js';

function getStatusColor(expireDateString) {
  const now = new Date();
  const expireDate = new Date(expireDateString);
  const msPerDay = 1000 * 60 * 60 * 24;
  const difference = expireDate - now;
  const days = Math.ceil(difference / msPerDay);

  if (days <= 14) {
    return { colorClass: 'status-red', text: days < 0 ? 'Expired' : 'Expiring soon' };
  }

  if (days < 180) {
    return { colorClass: 'status-yellow', text: `${days} days` };
  }

  return { colorClass: 'status-green', text: `${days} days` };
}

export default function StatusFileRow({ file: propFile, showAmount = false, onFileRename, canEdit = false, onEdit, canDelete = false, onDelete }) {
  const { token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const status = getStatusColor(propFile.expireDate);
  const [filename, setFilename] = useState(propFile.originalFilename || propFile.fileName || 'file');

  // Sync filename when prop changes (e.g., after metadata update)
  useEffect(() => {
    setFilename(propFile.originalFilename || propFile.fileName || 'file');
  }, [propFile.fileName, propFile.originalFilename]);

  const inputDateFormatted = formatDate(propFile.inputDate);
  const expireDateFormatted = formatDate(propFile.expireDate);
  const uploadedAtFormatted = formatDate(propFile.uploadedAt);

  const handlePreview = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.previewFile(propFile.id, token);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Preview failed:', error);
      alert('Failed to preview file');
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.downloadFile(propFile.id, token);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file');
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      // Open the edit modal with full file data
      onEdit(propFile);
    } else {
      // Fallback to inline editing if modal handler not provided
      setEditName(filename);
      setIsEditing(true);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(propFile);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName('');
  };

  const handleRename = async (e) => {
    if (e) e.preventDefault();
    if (!editName.trim()) return;

    setIsRenaming(true);
    try {
      await apiService.renameFile(propFile.id, editName, token);
      setFilename(editName);
      if (onFileRename) onFileRename(propFile.id, editName);
      setIsEditing(false);
      alert('File renamed successfully');
    } catch (error) {
      console.error('Rename failed:', error);
      alert('Failed to rename file: ' + error.message);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <tr>
      <td>{propFile.user || '-'}</td>
      <td>
        <div className="file-cell">
          {isEditing ? (
            <div className="edit-cell">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleCancel}
                className="edit-input"
                autoFocus
                disabled={isRenaming}
              />
              {/* <button onClick={handleRename} disabled={isRenaming || !editName.trim()}>
                {isRenaming ? 'Saving...' : 'Save'}
              </button> */}
              <button onClick={handleCancel} disabled={isRenaming}>
                Cancel
              </button>
            </div>
          ) : (
            <>
              {!propFile.isDeleted && (
                <>
                  <a 
                    href="#"
                    onClick={handleDownload}
                    className="file-download"
                    title="Download file"
                    aria-label="Download file"
                  >
                    <span aria-hidden="true">⬇</span>
                  </a>
                  {canEdit && (
                    <a 
                      href="#"
                      onClick={handleEdit}
                      className="file-edit"
                      title="Edit file metadata"
                      aria-label="Edit file metadata"
                    >
                      ✏️
                    </a>
                  )}
                  {canDelete && (
                    <a 
                      href="#"
                      onClick={handleDelete}
                      className="file-delete"
                      title="Delete file"
                      aria-label="Delete file"
                    >
                      🗑️
                    </a>
                  )}
                </>
              )}
              {propFile.isDeleted ? (
                <span 
                  className="file-link"
                  style={{ textDecoration: 'line-through', color: '#999' }}
                >
                  {filename}
                </span>
              ) : (
                <a 
                  href="#"
                  onClick={handlePreview}
                  className="file-link"
                  title="Preview file (opens in new tab)"
                >
                  {filename}
                </a>
              )}
            </>
          )}
        </div>
      </td>
      <td>{propFile.fileNumber || '-'}</td>
      <td className="date-cell">
        <div className="date-display">
          <div className="date-part">{propFile.isDeleted ? '-' : inputDateFormatted.date}</div>
          {/* <div className="time-part">{inputDateFormatted.time}</div> */}
        </div>
      </td>
      <td className="date-cell">
        <div className="date-display">
          <div className="date-part">{propFile.isDeleted ? '-' : expireDateFormatted.date}</div>
          {/* <div className="time-part">{expireDateFormatted.time}</div> */}
        </div>
      </td>
      <td className="date-cell">
        <div className="date-display">
          <div className="date-part">{uploadedAtFormatted.date}</div>
          <div className="time-part">{uploadedAtFormatted.time}</div>
        </div>
      </td>
      <td>{propFile.documentType || propFile.categoryName || '-'}</td>
      <td>
        {showAmount ? (
          propFile.isDeleted ? '0' : propFile.amount !== undefined ? `$${propFile.amount.toLocaleString()}` : '-'
        ) : (
          <span className={`status-chip ${status.colorClass}`}>
            {propFile.isDeleted ? 'Deleted' : status.text}
          </span>
        )}
      </td>
    </tr>
  );
}

