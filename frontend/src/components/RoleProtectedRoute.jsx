import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * RoleProtectedRoute Component
 * 
 * This component provides role-based route protection in addition to authentication.
 * It checks for JWT token and user role before allowing access to routes.
 * 
 * Props:
 * - allowedRoles: Array of roles that can access this route (optional)
 * - redirectTo: Custom redirect path if not authorized (defaults to '/login')
 * 
 * Usage:
 * <Route path="/farmer" element={<RoleProtectedRoute allowedRoles={['Farmer']} />}>
 *   <Route path="dashboard" element={<FarmerDashboard />} />
 * </Route>
 */
const RoleProtectedRoute = ({ allowedRoles = [], redirectTo = '/login' }) => {
  // Get token and user data from localStorage
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  // Check authentication and authorization
  const checkAccess = () => {
    // Check if token exists
    if (!token) {
      return { isAuthenticated: false, hasPermission: false };
    }
    
    try {
      // Validate token format
      const parts = token.split('.');
      if (parts.length !== 3) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { isAuthenticated: false, hasPermission: false };
      }
      
      // Check token expiration
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { isAuthenticated: false, hasPermission: false };
      }
      
      // If no specific roles required, just check authentication
      if (allowedRoles.length === 0) {
        return { isAuthenticated: true, hasPermission: true };
      }
      
      // Check user role if roles are specified
      if (!userData) {
        return { isAuthenticated: true, hasPermission: false };
      }
      
      const user = JSON.parse(userData);
      const userRole = user.role;
      
      if (!userRole || !allowedRoles.includes(userRole)) {
        return { isAuthenticated: true, hasPermission: false };
      }
      
      return { isAuthenticated: true, hasPermission: true };
      
    } catch (error) {
      console.error('Token validation error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { isAuthenticated: false, hasPermission: false };
    }
  };

  const { isAuthenticated, hasPermission } = checkAccess();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but no permission, redirect to unauthorized page or login
  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and authorized, render child routes
  return <Outlet />;
};

export default RoleProtectedRoute;