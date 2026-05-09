import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, getDashboardRouteForRole, getStoredUser } from '../utils/authSession.js';

/**
 * GuestRoute Component - INVERSE OF ProtectedRoute
 * 
 * This component provides guest-only route protection.
 * It allows ONLY unauthenticated users to access auth pages.
 * 
 * If an authenticated user tries to access:
 * - /login
 * - /signup
 * - /register
 * - any other guest-only route
 * 
 * They are automatically redirected to their role-specific dashboard.
 * 
 * This prevents:
 * - Authenticated users from accessing login page
 * - Authenticated users from accessing signup page
 * - Session hijacking by redirecting back to dashboard
 * - Confusion from seeing login form when already logged in
 * 
 * Usage:
 * <Route path="/login" element={<GuestRoute />}>
 *   <Route index element={<LoginPage />} />
 * </Route>
 * 
 * <Route path="/signup" element={<GuestRoute />}>
 *   <Route index element={<SignUpPage />} />
 * </Route>
 */
const GuestRoute = () => {
    console.log('🔐 GuestRoute - Checking guest access...');

    // Check if user is already authenticated
    const authenticated = isAuthenticated();
    console.log('   isAuthenticated:', authenticated);

    if (authenticated) {
        // User is authenticated, get their role and redirect to dashboard
        const user = getStoredUser();
        console.log('   User is already authenticated:', user?.name, `(${user?.role})`);

        if (user && user.role) {
            const dashboardRoute = getDashboardRouteForRole(user.role);
            console.log('🔄 GuestRoute - Redirecting authenticated user to:', dashboardRoute);
            return <Navigate to={dashboardRoute} replace />;
        } else {
            // Should never happen, but fallback to home
            console.log('⚠️  GuestRoute - No user role found, redirecting to home');
            return <Navigate to="/" replace />;
        }
    }

    // User is not authenticated, allow access to guest page (login/signup)
    console.log('✅ GuestRoute - User is guest, allowing access to page');
    return <Outlet />;
};

export default GuestRoute;
