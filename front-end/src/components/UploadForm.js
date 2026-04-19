import { useState } from 'react';
import './UploadForm.css';

export default function UploadForm({ selectedCategory }) {
  const [formData, setFormData] = useState({
    fileName: '',
    fileNumber: '',
    inputDate: '',
    expireDate: '',
    amount: '',
    selectedFile: null
  });

  const isFormDisabled = !selectedCategory || selectedCategory === 'Select a category';

  const handleInputChange = (e) => {
    if (isFormDisabled) return;
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (isFormDisabled) return;
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        selectedFile: file,
        fileName: file.name 
      }));
    }
  };

  const isFormValid = () => {
    if (isFormDisabled) return false;
    return formData.fileName.trim() !== '' &&
           formData.fileNumber.trim() !== '' &&
           formData.inputDate !== '' &&
           formData.expireDate !== '' &&
           formData.amount !== '' &&
           formData.selectedFile !== null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid()) {
      const today = new Date();
      
      const inputDateObj = new Date(formData.inputDate);
      const expireDateObj = new Date(formData.expireDate);

      if (inputDateObj > today) {
        alert('Input Date cannot be in the future');
        return;
      }

      if (expireDateObj < inputDateObj) {
        alert('Expire Date must be after Input Date');
        return;
      }

      console.log('Form Data:', {
        category: selectedCategory,
        ...formData
      });
      console.log('File to upload:', formData.selectedFile);
    }
  };

  return (
    <div className="upload-form-container">
      <h3 className="form-title">Upload File for: {selectedCategory}</h3>

      <form className="upload-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fileName">File Name</label>
            <input
              type="text"
              id="fileName"
              name="fileName"
              className="form-input"
              value={formData.fileName}
              onChange={handleInputChange}
              placeholder="Enter file name"
              disabled={isFormDisabled}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fileNumber">File Number</label>
            <input
              type="text"
              id="fileNumber"
              name="fileNumber"
              className="form-input"
              value={formData.fileNumber}
              onChange={handleInputChange}
              placeholder="Enter file number"
              disabled={isFormDisabled}
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
              value={formData.inputDate}
              onChange={handleInputChange}
              disabled={isFormDisabled}
            />
          </div>

          <div className="form-group">
            <label htmlFor="expireDate">Expire Date</label>
            <input
              type="date"
              id="expireDate"
              name="expireDate"
              className="form-input"
              value={formData.expireDate}
              onChange={handleInputChange}
              disabled={isFormDisabled}
            />
          </div>
        </div>
           <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              className="form-input"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Enter amount"
              disabled={isFormDisabled}
            />
          </div>
         
        <div className="form-row">
          <div className="form-group file-select-group">
            <label htmlFor="fileSelect">Select File</label>
            <input
              type="file"
              id="fileSelect"
              className="file-input"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              disabled={isFormDisabled}
            />
            {formData.selectedFile && (
              <span className="file-name">Selected: {formData.selectedFile.name}</span>
            )}
          </div>
          
        </div>

        <button
          type="submit"
          className={`submit-button ${isFormValid() ? 'enabled' : 'disabled'}`}
          disabled={!isFormValid()}
        >
          Submit
        </button>
      </form>
    </div>
  );
}