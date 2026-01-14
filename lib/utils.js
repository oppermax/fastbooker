export const formatDate = (date) => {
    let month = '' + (date.getMonth() + 1);
    let day = '' + date.getDate();
    const year = date.getFullYear().toString();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
  };

// Pre-computed lowercase reserved keywords for performance
const DEFAULT_RESERVED_KEYWORDS = ['riservat', 'reserved', 'docenti', 'dottorandi'].map(k => k.toLowerCase());

/**
 * Checks if a seat is reserved based on keywords in its description.
 * @param {Object} seat - The seat object to check
 * @param {string[]} reservedKeywords - Array of keywords to check for (default: ['riservat', 'reserved'])
 *                                      Note: 'riservat' matches both 'riservato' and 'riservata' (Italian masculine/feminine)
 * @returns {boolean} - True if the seat description contains any of the reserved keywords
 */
export const isReserved = (seat, reservedKeywords = DEFAULT_RESERVED_KEYWORDS) => {
  if (!seat.description) return false;
  const lowerDescription = seat.description.toLowerCase();
  
  // If custom keywords are provided, convert them to lowercase
  const keywords = reservedKeywords === DEFAULT_RESERVED_KEYWORDS 
    ? reservedKeywords 
    : reservedKeywords.map(k => k.toLowerCase());
    
  return keywords.some(keyword => lowerDescription.includes(keyword));
};
