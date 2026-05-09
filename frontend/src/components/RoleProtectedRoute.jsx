import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * RoleProtectedRoute Component - ENHANCED FOR STRICT RBAC
 * 
 * This component provides STRICT role-based route protection.
 * It checks:
 * 1. JWT token validity and expiration
 * 2. User role matches allowed roles (EXACT case-sensitive match)
 * 3. Token format is correct (3 parts separated by dots)
 * 4. User data is available and parseable
 * 
 * Props:
 * - allowedRoles: Array of roles that can access this route (REQUIRED for security)
 * - redirectTo: Custom redirect path (defaults to '/unauthorized')
 * 
 * Usage:
 * <Route path="/farmer" element={<RoleProtectedRoute allowedRoles={['Farmer']} />}>
 *   <Route path="dashboard" element={<FarmerDashboard />} />
 * </Route>
 * 
 * CRITICAL: This component prevents users from accessing routes of different roles
 * by redirecting to /unauthorized if role doesn't match.
 */
const RoleProtectedRoute = ({ allowedRoles = [], redirectTo = '/unauthorized' }) => {
  // Get token and user data from localStorage
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');

  // Validate authentication and authorization
  const checkAccess = () => {
    console.log('🔐 RoleProtectedRoute - Checking access...');
    console.log('   allowedRoles:', allowedRoles);
    console.log('   token exists:', !!token);
    console.log('   userData exists:', !!userData);

    // Check if token exists
    if (!token) {
      console.log('❌ RoleProtectedRoute - No token found');
      return { isAuthenticated: false, hasPermission: false, reason: 'no_token' };
    }

    try {
      // Validate token format (JWT has 3 parts separated by dots)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('❌ RoleProtectedRoute - Invalid token format');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { isAuthenticated: false, hasPermission: false, reason: 'invalid_format' };
      }

      // Decode and check token expiration
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;

      console.log('   Token exp:', payload.exp, 'Current time:', currentTime);

      if (payload.exp && payload.exp < currentTime) {
        console.log('❌ RoleProtectedRoute - Token expired');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { isAuthenticated: false, hasPermission: false, reason: 'token_expired' };
      }

      console.log('✅ RoleProtectedRoute - Token is valid');

      // Token is valid, now check role
      if (!userData) {
        console.log('⚠️  RoleProtectedRoute - Token valid but no user data');
        return { isAuthenticated: true, hasPermission: false, reason: 'no_user_data' };
      }

      try {
        const user = JSON.parse(userData);
        const userRole = user.role;

        console.log('   User role:', userRole);
        console.log('   Allowed roles:', allowedRoles);

        // If no specific roles required, just check authentication
        if (!allowedRoles || allowedRoles.length === 0) {
          console.log('✅ RoleProtectedRoute - No specific roles required, allowing access');
          return { isAuthenticated: true, hasPermission: true };
        }

        // Check if user role is in allowed roles (EXACT match, case-sensitive)
        if (!userRole) {
          console.log('❌ RoleProtectedRoute - User has no role');
          return { isAuthenticated: true, hasPermission: false, reason: 'no_role' };
        }

        // IMPORTANT: Role comparison is CASE-SENSITIVE and EXACT
        // Backend returns roles as: 'Farmer', 'HHM', 'Factory', 'Labour'
        const hasPermission = allowedRoles.includes(userRole);

        if (hasPermission) {
          console.log('✅ RoleProtectedRoute - User role permitted');
          return { isAuthenticated: true, hasPermission: true };
        } else {
          console.log('❌ RoleProtectedRoute - User role NOT permitted');
          console.log('   User role:', userRole, 'vs allowed:', allowedRoles);
          return { isAuthenticated: true, hasPermission: false, reason: 'wrong_role' };
        }
      } catch (userError) {
        console.error('❌ RoleProtectedRoute - Error parsing user data:', userError);
        return { isAuthenticated: true, hasPermission: false, reason: 'user_parse_error' };
      }

    } catch (error) {
      console.error('❌ RoleProtectedRoute - Token validation error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { isAuthenticated: false, hasPermission: false, reason: 'token_error' };
    }
  };

  const { isAuthenticated, hasPermission } = checkAccess();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('🔄 RoleProtectedRoute - Redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If authenticated but no permission, redirect to unauthorized
  if (!hasPermission) {
    console.log('🔄 RoleProtectedRoute - Redirecting to unauthorized');
    return <Navigate to={redirectTo} replace />;
  }

  // If authenticated and authorized, render child routes
  console.log('✅ RoleProtectedRoute - Access granted, rendering outlet');
  return <Outlet />;
};

export default RoleProtectedRoute;