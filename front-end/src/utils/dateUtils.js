/**
 * Date formatting utility for consistent UI display
 * Formats UTC date string to { date: 'YYYY-MM-DD', time: 'HH:mm' } in local timezone
 * 
 * Properly handles UTC timestamps (with 'Z' suffix) by:
 * 1. Creating a Date object from UTC time string
 * 2. Converting to local timezone using toLocaleString()
 * 3. Extracting date and time parts
 */

export function formatDate(dateStr) {
  if (!dateStr) return { date: '-', time: '' };
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return { date: '-', time: '' };
    
    // Get local date and time using toLocaleString()
    // This properly converts UTC to browser's local timezone
    const localDateString = date.toLocaleString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    // Format: YYYY-MM-DD HH:mm:ss
    const [datePart, timePart] = localDateString.split(' ');
    const timeOnly = timePart.substring(0, 5); // HH:mm only
    
    return { date: datePart, time: timeOnly };
  } catch {
    return { date: '-', time: '' };
  }
}

