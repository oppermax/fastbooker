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

/**
 * Checks if a seat is reserved based on keywords in its description.
 * @param {Object} seat - The seat object to check
 * @param {string[]} reservedKeywords - Array of keywords to check for (default: ['riservat', 'reserved'])
 * @returns {boolean} - True if the seat description contains any of the reserved keywords
 */
export const isReserved = (seat, reservedKeywords = ['riservat', 'reserved']) => {
  if (!seat.description) return false;
  const lowerDescription = seat.description.toLowerCase();
  const lowerKeywords = reservedKeywords.map(keyword => keyword.toLowerCase());
  return lowerKeywords.some(keyword => lowerDescription.includes(keyword));
};