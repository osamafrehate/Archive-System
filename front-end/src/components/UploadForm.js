// import { useState, useContext } from 'react';
// import { useAuth } from '../hooks/useAuth';
// import { apiService } from '../services/apiService';
// import { CategoryContext } from '../context/CategoryContext';
// import { useNavigate } from 'react-router-dom';
// import './UploadForm.css';

// export default function UploadForm({ selectedCategory }) {
//   const { token } = useAuth();
//   const { categories } = useContext(CategoryContext);
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     fileName: '',
//     fileNumber: '',
//     inputDate: '',
//     expireDate: '',
//     amount: '',
//     selectedFile: null
//   });

//   const isFormDisabled = !selectedCategory || selectedCategory === 'Select a category';

//   const handleInputChange = (e) => {
//     if (isFormDisabled) return;
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleFileChange = (e) => {
//     if (isFormDisabled) return;
//     const file = e.target.files[0];
//     if (file) {
//       setFormData(prev => ({
//         ...prev,
//         selectedFile: file,
//         fileName: file.name 
//       }));
//     }
//   };

//   const isFormValid = () => {
//     if (isFormDisabled) return false;
//     return formData.fileName.trim() !== '' &&
//            formData.fileNumber.trim() !== '' &&
//            formData.inputDate !== '' &&
//            formData.expireDate !== '' &&
//            formData.selectedFile !== null;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (isFormValid()) {
//       const today = new Date();
      
//       const inputDateObj = new Date(formData.inputDate);
//       const expireDateObj = new Date(formData.expireDate);

//       if (inputDateObj > today) {
//         alert('Input Date cannot be in the future');
//         return;
//       }

//       if (expireDateObj < inputDateObj) {
//         alert('Expire Date must be after Input Date');
//         return;
//       }

//       try {
//         const category = categories.find(c => c.name === selectedCategory);
//         if (!category) throw new Error('Invalid category');
//         const uploadFormData = new FormData();
//         uploadFormData.append('file', formData.selectedFile);
//         uploadFormData.append('CategoryId', category.id.toString());
//         uploadFormData.append('FileNumber', formData.fileNumber);
//         uploadFormData.append('FileName', formData.fileName);
//         if (formData.inputDate) uploadFormData.append('InputDate', formData.inputDate);
//         if (formData.expireDate) uploadFormData.append('ExpireDate', formData.expireDate);
//         if (formData.amount) uploadFormData.append('Amount', formData.amount.toString());
        
//         const result = await apiService.uploadFile(uploadFormData, token);
//         alert(`File uploaded successfully`);
//         navigate('/status-file');
//       } catch (error) {
//         console.error('Upload error:', error);
//         if (error.message.includes('401') || error.message.includes('403')) {
//           alert('Access Denied - Check category permissions.');
//         } else {
//           alert(`Upload failed: ${error.message}`);
//         }
//       }
//     }
//   };

//   return (
//     <div className="upload-form-container">
//       <h3 className="form-title">Upload File for: {selectedCategory}</h3>

//       <form className="upload-form" onSubmit={handleSubmit}>
//         <div className="form-row">
//           <div className="form-group">
//             <label htmlFor="fileName">File Name</label>
//             <input
//               type="text"
//               id="fileName"
//               name="fileName"
//               className="form-input"
//               value={formData.fileName}
//               onChange={handleInputChange}
//               placeholder="Enter file name"
//               disabled={isFormDisabled}
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="fileNumber">File Number</label>
//             <input
//               type="text"
//               id="fileNumber"
//               name="fileNumber"
//               className="form-input"
//               value={formData.fileNumber}
//               onChange={handleInputChange}
//               placeholder="Enter file number"
//               disabled={isFormDisabled}
//             />
//           </div>
//         </div>

//         <div className="form-row">
//           <div className="form-group">
//             <label htmlFor="inputDate">Document Date</label>
//             <input
//               type="date"
//               id="inputDate"
//               name="inputDate"
//               className="form-input"
//               value={formData.inputDate}
//               onChange={handleInputChange}
//               disabled={isFormDisabled}
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="expireDate">Expire Date</label>
//             <input
//               type="date"
//               id="expireDate"
//               name="expireDate"
//               className="form-input"
//               value={formData.expireDate}
//               onChange={handleInputChange}
//               disabled={isFormDisabled}
//             />
//           </div>
//         </div>
//            <div className="form-group">
//             <label htmlFor="amount">Amount</label>
//             <input
//               type="number"
//               id="amount"
//               name="amount"
//               className="form-input"
//               value={formData.amount}
//               onChange={handleInputChange}
//               placeholder="Enter amount"
//               disabled={isFormDisabled}
//             />
//           </div>
         
//         <div className="form-row">
//           <div className="form-group file-select-group">
//             <label htmlFor="fileSelect">Select File</label>
//             <input
//               type="file"
//               id="fileSelect"
//               className="file-input"
//               onChange={handleFileChange}
//               accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
//               disabled={isFormDisabled}
//             />
//             {formData.selectedFile && (
//               <span className="file-name">Selected: {formData.selectedFile.name}</span>
//             )}
//           </div>
          
//         </div>

//         <button
//           type="submit"
//           className={`submit-button ${isFormValid() ? 'enabled' : 'disabled'}`}
//           disabled={!isFormValid()}
//         >
//           Submit
//         </button>
//       </form>
//     </div>
//   );
// }
import { useState, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/apiService';
import { CategoryContext } from '../context/CategoryContext';
import { useNavigate } from 'react-router-dom';
import './UploadForm.css';

export default function UploadForm({ selectedCategory }) {
  const { token } = useAuth();
  const { categories } = useContext(CategoryContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fileName: '',
    fileNumber: '',
    inputDate: '',
    expireDate: '',
    amount: '',
    selectedFile: null
  });

  const isFormDisabled =
    !selectedCategory || selectedCategory === 'Select a category';

  const handleInputChange = (e) => {
    if (isFormDisabled || loading) return;

    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (isFormDisabled || loading) return;

    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        selectedFile: file,
        fileName: file.name
      }));
    }
  };

  const isFormValid = () => {
    if (isFormDisabled || loading) return false;

    return (
      formData.fileName.trim() !== '' &&
      formData.fileNumber.trim() !== '' &&
      formData.inputDate !== '' &&
      formData.expireDate !== '' &&
      formData.selectedFile !== null
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) return;

    setLoading(true);

    try {
      const today = new Date();
      const inputDateObj = new Date(formData.inputDate);
      const expireDateObj = new Date(formData.expireDate);

      if (inputDateObj > today) {
        alert('Input Date cannot be in the future');
        setLoading(false);
        return;
      }

      if (expireDateObj < inputDateObj) {
        alert('Expire Date must be after Input Date');
        setLoading(false);
        return;
      }

      const category = categories.find(
        (c) => c.name === selectedCategory
      );

      if (!category) throw new Error('Invalid category');

      const uploadFormData = new FormData();
      uploadFormData.append('file', formData.selectedFile);
      uploadFormData.append('CategoryId', category.id.toString());
      uploadFormData.append('FileNumber', formData.fileNumber);
      uploadFormData.append('FileName', formData.fileName);

      if (formData.inputDate)
        uploadFormData.append('InputDate', formData.inputDate);

      if (formData.expireDate)
        uploadFormData.append('ExpireDate', formData.expireDate);

      if (formData.amount)
        uploadFormData.append('Amount', formData.amount.toString());

      await apiService.uploadFile(uploadFormData, token);

      alert('File uploaded successfully');

      navigate('/status-file');
    } catch (error) {
      console.error('Upload error:', error);

      if (
        error.message.includes('401') ||
        error.message.includes('403')
      ) {
        alert('Access Denied - Check category permissions.');
      } else {
        alert(`Upload failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-form-container">
      <h3 className="form-title">
        Upload File for: {selectedCategory}
      </h3>

      <form className="upload-form" onSubmit={handleSubmit}>
        {/* File Name + File Number */}
        <div className="form-row">
          <div className="form-group">
            <label>File Name</label>
            <input
              type="text"
              name="fileName"
              className="form-input"
              value={formData.fileName}
              onChange={handleInputChange}
              disabled={isFormDisabled || loading}
            />
          </div>

          <div className="form-group">
            <label>File Number</label>
            <input
              type="text"
              name="fileNumber"
              className="form-input"
              value={formData.fileNumber}
              onChange={handleInputChange}
              disabled={isFormDisabled || loading}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="form-row">
          <div className="form-group">
            <label>Document Date</label>
            <input
              type="date"
              name="inputDate"
              className="form-input"
              value={formData.inputDate}
              onChange={handleInputChange}
              disabled={isFormDisabled || loading}
            />
          </div>

          <div className="form-group">
            <label>Expire Date</label>
            <input
              type="date"
              name="expireDate"
              className="form-input"
              value={formData.expireDate}
              onChange={handleInputChange}
              disabled={isFormDisabled || loading}
            />
          </div>
        </div>

        {/* Amount */}
        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            name="amount"
            className="form-input"
            value={formData.amount}
            onChange={handleInputChange}
            disabled={isFormDisabled || loading}
          />
        </div>

        {/* File */}
        <div className="form-group file-select-group">
          <label>Select File</label>
          <input
            type="file"
            className="file-input"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            disabled={isFormDisabled || loading}
          />

          {formData.selectedFile && (
            <span className="file-name">
              Selected: {formData.selectedFile.name}
            </span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`submit-button ${
            isFormValid() ? 'enabled' : 'disabled'
          }`}
          disabled={!isFormValid() || loading}
        >
          {loading ? (
            <span className="spinner-container">
              <span className="spinner"></span>
              Uploading...
            </span>
          ) : (
            'Submit'
          )}
        </button>
      </form>
    </div>
  );
}