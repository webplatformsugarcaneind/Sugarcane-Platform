import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * 
 * This component checks for a JWT token in localStorage to determine
 * if the user is authenticated. If authenticated, it renders child routes
 * using Outlet. If not authenticated, it redirects to the login page.
 * 
 * Usage:
 * <Route path="/dashboard" element={<ProtectedRoute />}>
 *   <Route path="profile" element={<Profile />} />
 *   <Route path="settings" element={<Settings />} />
 * </Route>
 */
const ProtectedRoute = () => {
  // Check if JWT token exists in localStorage
  const token = localStorage.getItem('token');
  
  // Optional: Additional token validation
  const isAuthenticated = () => {
    if (!token) {
      return false;
    }
    
    try {
      // Basic token format validation (JWT has 3 parts separated by dots)
      const parts = token.split('.');
      if (parts.length !== 3) {
        // Invalid token format, remove it
        localStorage.removeItem('token');
        return false;
      }
      
      // Optional: Check token expiration
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        // Token is expired, remove it
        localStorage.removeItem('token');
        localStorage.removeItem('user'); // Also remove user data if stored
        return false;
      }
      
      return true;
    } catch (error) {
      // Token is malformed, remove it
      console.error('Invalid token format:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
  };

  // If user is authenticated, render the child routes
  if (isAuthenticated()) {
    return <Outlet />;
  }

  // If not authenticated, redirect to login page
  // The 'replace' prop prevents the login page from being added to history stack
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;