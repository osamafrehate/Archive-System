/**
 * Excel Export Utility
 * Generates CSV files that Excel opens with proper formatting
 */

export function exportToExcel(files, filename = 'Files.csv') {
  if (!files || files.length === 0) {
    alert('No files to export');
    return;
  }

  // Define columns
  const columns = [
    'File Number',
    'File Name',
    'Category',
    'Uploaded By',
    'Input Date',
    'Expire Date',
    'Amount',
    'Status'
  ];

  // Create CSV header (with BOM for proper UTF-8 encoding in Excel)
  const BOM = '\uFEFF';
  let csv = BOM + columns.map(col => escapeCSV(col)).join(',') + '\n';

  // Add data rows
  files.forEach((file) => {
    const row = [
      file.fileNumber || '',
      file.originalFilename || file.fileName || '',
      file.documentType || file.categoryName || '',
      file.user || file.uploadedByUsername || '',
      formatDateForExcel(file.inputDate),
      formatDateForExcel(file.expireDate),
      file.amount ? `$${formatAmount(file.amount)}` : '',
      getStatusText(file.expireDate)
    ];
    csv += row.map(cell => escapeCSV(cell)).join(',') + '\n';
  });

  // Create blob and download
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Escape CSV cell values (handle commas, quotes, newlines)
 */
function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  
  // If contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Format date for Excel display
 */
function formatDateForExcel(dateStr) {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    // Format as YYYY-MM-DD HH:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch {
    return '';
  }
}

/**
 * Format amount with thousands separator
 */
function formatAmount(amount) {
  if (typeof amount !== 'number') return '';
  return amount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
}

/**
 * Get status text based on expire date
 */
function getStatusText(expireDateString) {
  if (!expireDateString) return '';
  
  try {
    const now = new Date();
    const expireDate = new Date(expireDateString);
    const msPerDay = 1000 * 60 * 60 * 24;
    const difference = expireDate - now;
    const days = Math.ceil(difference / msPerDay);

    if (days < 0) return 'Expired';
    if (days <= 14) return 'Expiring soon';
    if (days < 180) return `${days} days`;
    return `${days} days`;
  } catch {
    return '';
  }
}

/**
 * Trigger file download
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
