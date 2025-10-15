/**
 * Input validation utilities for the Donation Impact Tracker
 */

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates donation amount
 */
export const isValidAmount = (amount: number): boolean => {
  return typeof amount === 'number' && amount > 0 && isFinite(amount);
};

/**
 * Sanitizes string input to prevent XSS
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .slice(0, 1000); // Limit length
};

/**
 * Validates date format (YYYY-MM-DD)
 */
export const isValidDate = (dateString: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Validates coordinates
 */
export const isValidCoordinates = (latitude: number, longitude: number): boolean => {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

/**
 * Validates donor ID format
 */
export const isValidId = (id: string): boolean => {
  if (typeof id !== 'string') return false;
  
  // Allow alphanumeric, hyphens, and underscores
  const idRegex = /^[a-zA-Z0-9_-]+$/;
  return idRegex.test(id) && id.length > 0 && id.length <= 100;
};

/**
 * Validates pagination parameters
 */
export const isValidPagination = (page?: number, perPage?: number): boolean => {
  if (page !== undefined && (page < 1 || !Number.isInteger(page))) {
    return false;
  }
  
  if (perPage !== undefined && (perPage < 1 || perPage > 100 || !Number.isInteger(perPage))) {
    return false;
  }
  
  return true;
};

/**
 * Validates region name
 */
export const isValidRegion = (region: string): boolean => {
  const validRegions = [
    'North America',
    'South America',
    'Europe',
    'Asia',
    'Africa',
    'Oceania',
    'Global'
  ];
  
  return validRegions.includes(region);
};

/**
 * Validates impact type
 */
export const isValidImpactType = (type: string): boolean => {
  const validTypes = [
    'meals_served',
    'books_distributed',
    'students_supported',
    'trees_planted',
    'scholarships_provided'
  ];
  
  return validTypes.includes(type);
};
