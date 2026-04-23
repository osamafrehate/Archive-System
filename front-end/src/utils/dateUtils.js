/**
 * Date formatting utility for consistent UI display
 * Formats date string to { date: 'YYYY-MM-DD', time: 'HH:mm' }
 */

export function formatDate(dateStr) {
  if (!dateStr) return { date: '-', time: '' };
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return { date: '-', time: '' };
    
    // YYYY-MM-DD
    const datePart = date.toISOString().split('T')[0];
    
    // HH:mm (24hr)
    const timePart = date.toTimeString().split(' ')[0].slice(0, 5);
    
    return { date: datePart, time: timePart };
  } catch {
    return { date: '-', time: '' };
  }
}

