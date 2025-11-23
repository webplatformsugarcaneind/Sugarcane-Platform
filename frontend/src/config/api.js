// API Configuration
// This file centralizes all API endpoint configurations

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export { API_BASE_URL };

// For axios default configuration
export const configureAxios = (axios) => {
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.withCredentials = true;
};

// Helper function to build API URLs
export const apiURL = (path) => {
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${API_BASE_URL}/${cleanPath}`;
};
