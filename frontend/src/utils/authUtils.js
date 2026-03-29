/**
 * Authentication Error Handler Utility
 * 
 * Handles common authentication errors, especially the "user no longer exists" case
 */

/**
 * Handles authentication errors and clears session if necessary
 * @param {Object} error - The error object from API response
 * @param {Function} setError - State setter function for error messages
 * @returns {boolean} - Returns true if error was handled, false otherwise
 */
export const handleAuthError = (error, setError) => {
  // Check for 401 Unauthorized with "user no longer exists" message
  if (error.response?.status === 401) {
    const message = error.response?.data?.message || '';
    
    if (message.includes('user no longer exists') || 
        message.includes('User not found') ||
        message.includes('Token is valid but user no longer exists')) {
      
      // Clear localStorage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (setError) {
        setError('Your session has expired. Please log in again.');
      }
      
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      
      return true; // Error was handled
    }
    
    // Handle other 401 errors (invalid token, expired token, etc.)
    if (message.includes('Invalid token') || 
        message.includes('Token expired') ||
        message.includes('No token provided')) {
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (setError) {
        setError('Authentication failed. Please log in again.');
      }
      
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      
      return true; // Error was handled
    }
  }
  
  return false; // Error was not handled
};

/**
 * Generic API error handler that includes auth error handling
 * @param {Object} error - The error object from API response
 * @param {Function} setError - State setter function for error messages
 * @param {string} fallbackMessage - Default error message if no specific message found
 */
export const handleApiError = (error, setError, fallbackMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  // First try to handle auth-specific errors
  if (handleAuthError(error, setError)) {
    return;
  }
  
  // Handle other API errors
  const errorMessage = error.response?.data?.message || 
                      error.message || 
                      fallbackMessage;
  
  if (setError) {
    setError(errorMessage);
  }
};

/**
 * Check if current stored token/user is valid
 * @returns {boolean} - True if user data exists in localStorage
 */
export const hasValidSession = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    return false;
  }
  
  try {
    JSON.parse(user); // Validate user data is valid JSON
    return true;
  } catch {
    return false;
  }
};

/**
 * Clear all authentication data from localStorage
 */
export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};