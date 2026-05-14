/**
 * Excel Export Utility
 * Generates XLSX files with proper Excel formatting
 */

import ExcelJS from 'exceljs';

export async function exportToExcel(files, filename = 'Files.xlsx') {
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
    'Document Date',
    'Expire Date',
    'Amount',
    'Status'
  ];

  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Files');

  // Add header row with bold styling
  const headerRow = worksheet.addRow(columns);
  headerRow.font = { bold: true };
  
  // Apply bold to each header cell
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
  });

  // Add data rows
  files.forEach((file) => {
    const row = [
      file.fileNumber || '',
      file.originalFilename || file.fileName || '',
      file.documentType || file.categoryName || '',
      file.user || file.uploadedByUsername || '',
      formatDateForExcel(file.inputDate),
      formatDateForExcel(file.expireDate),
      file.amount ? formatAmount(file.amount) : '',
      getStatusText(file.expireDate)
    ];
    worksheet.addRow(row);
  });

  // Auto-fit columns to content width
  worksheet.columns.forEach((column) => {
    let maxLength = 12;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const cellLength = cell.value ? String(cell.value).length : 0;
      if (cellLength > maxLength) {
        maxLength = cellLength;
      }
    });
    column.width = Math.min(maxLength + 2, 50);
  });

  // Generate buffer and download
  const buffer = await workbook.xlsx.writeBuffer();
  downloadFile(buffer, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

/**
 * Format date for Excel display
 */
function formatDateForExcel(dateStr) {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    // Format as M/D/YYYY (date only, no time)
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
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
function downloadFile(buffer, filename, mimeType) {
  const blob = new Blob([buffer], { type: mimeType });
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
