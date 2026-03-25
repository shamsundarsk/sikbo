/**
 * Utility functions for safe number formatting
 */

/**
 * Safely format a number to fixed decimal places
 * @param {any} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @param {string} fallback - Fallback value if not a number (default: 'N/A')
 * @returns {string} Formatted number or fallback
 */
export const safeToFixed = (value, decimals = 1, fallback = 'N/A') => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value.toFixed(decimals);
  }
  return fallback;
};

/**
 * Safely format a rating with /5.0 suffix
 * @param {any} rating - The rating value
 * @param {string} fallback - Fallback value (default: '4.0')
 * @returns {string} Formatted rating like "4.2/5.0"
 */
export const formatRating = (rating, fallback = '4.0') => {
  return `${safeToFixed(rating, 1, fallback)}/5.0`;
};

/**
 * Safely format currency
 * @param {any} amount - The amount to format
 * @param {string} currency - Currency symbol (default: '₹')
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = '₹', decimals = 2) => {
  if (typeof amount === 'number' && !isNaN(amount)) {
    return `${currency}${amount.toFixed(decimals)}`;
  }
  return `${currency}0.00`;
};

/**
 * Safely format percentage
 * @param {any} value - The value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (typeof value === 'number' && !isNaN(value)) {
    return `${value.toFixed(decimals)}%`;
  }
  return '0.0%';
};

/**
 * Safely calculate percentage change
 * @param {any} current - Current value
 * @param {any} previous - Previous value
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage change
 */
export const calculatePercentageChange = (current, previous, decimals = 1) => {
  if (typeof current === 'number' && typeof previous === 'number' && 
      !isNaN(current) && !isNaN(previous) && previous !== 0) {
    const change = ((current - previous) / previous * 100);
    return `${change >= 0 ? '+' : ''}${change.toFixed(decimals)}%`;
  }
  return '0.0%';
};