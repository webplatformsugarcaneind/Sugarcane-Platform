import axios from 'axios';

/**
 * Centralized Authentication Session Management
 * 
 * This module provides all authentication-related utilities to prevent
 * scattered localStorage reads and ensure consistent auth state across the app.
 * 
 * Features:
 * - Get/set token and user data
 * - Get/normalize user role
 * - Initialize auth headers on app startup
 * - Persist/clear auth session
 * - Check authentication status
 */

// ==========================================
// TOKEN MANAGEMENT
// ==========================================

/**
 * Get stored JWT token from localStorage
 * @returns {string|null} JWT token or null if not found
 */
export const getStoredToken = () => {
    const token = localStorage.getItem('token');
    console.log('📋 getStoredToken:', token ? `exists (${token.length} chars)` : 'null');
    return token;
};

/**
 * Set token in localStorage and axios headers
 * @param {string} token - JWT token to store
 */
export const setStoredToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('✅ setStoredToken: Token stored and headers set');
    }
};

// ==========================================
// USER MANAGEMENT
// ==========================================

/**
 * Get stored user data from localStorage
 * @returns {Object|null} User object or null if not found
 */
export const getStoredUser = () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
        console.log('📋 getStoredUser: null');
        return null;
    }

    try {
        const user = JSON.parse(userData);
        console.log('📋 getStoredUser:', { name: user.name, role: user.role, id: user.id });
        return user;
    } catch (err) {
        console.error('❌ getStoredUser: Failed to parse user data', err);
        return null;
    }
};

/**
 * Set user data in localStorage
 * @param {Object} user - User object to store
 */
export const setStoredUser = (user) => {
    if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        console.log('✅ setStoredUser:', { name: user.name, role: user.role });
    }
};

// ==========================================
// ROLE MANAGEMENT
// ==========================================

/**
 * Normalize role string to handle variations
 * @param {string} role - Raw role string from API or storage
 * @returns {string} Normalized role (Farmer, HHM, Factory, Labour)
 */
export const normalizeRole = (role) => {
    if (!role) return null;

    const normalized = role.trim().toLowerCase();

    // Map variations to canonical role names
    const roleMap = {
        'farmer': 'Farmer',
        'hhm': 'HHM',
        'factory': 'Factory',
        'labour': 'Labour',
        'labor': 'Labour',
        'worker': 'Labour'
    };

    const result = roleMap[normalized] || role; // Return original if not found
    console.log('🔄 normalizeRole:', role, '->', result);
    return result;
};

/**
 * Get stored user role
 * @returns {string|null} Normalized role or null
 */
export const getStoredRole = () => {
    const user = getStoredUser();
    if (!user) {
        console.log('📋 getStoredRole: No user found');
        return null;
    }

    const normalized = normalizeRole(user.role);
    console.log('📋 getStoredRole:', normalized);
    return normalized;
};

/**
 * Get role key for conditionals (lowercase for switch statements)
 * @returns {string|null} Lowercase role for conditionals
 */
export const getRoleKey = () => {
    const role = getStoredRole();
    if (!role) return null;
    return role.toLowerCase();
};

// ==========================================
// DASHBOARD ROUTING
// ==========================================

/**
 * Get dashboard route for a given role
 * @param {string} role - User role
 * @returns {string} Dashboard route path
 */
export const getDashboardRouteForRole = (role) => {
    const normalized = normalizeRole(role);

    const routes = {
        'Farmer': '/farmer/dashboard',
        'HHM': '/hhm/dashboard',
        'Factory': '/factory/dashboard',
        'Labour': '/labour/dashboard'
    };

    const route = routes[normalized] || '/';
    console.log('🗺️  getDashboardRouteForRole:', role, '->', route);
    return route;
};

// ==========================================
// SESSION PERSISTENCE
// ==========================================

/**
 * Persist authentication session (after successful login)
 * @param {Object} user - User object from API
 * @param {string} token - JWT token from API
 */
export const persistAuthSession = (user, token) => {
    console.log('💾 persistAuthSession: Starting...');

    setStoredToken(token);
    setStoredUser(user);

    // Also set in axios headers immediately
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    console.log('✅ persistAuthSession: Complete');
};

/**
 * Clear authentication session (on logout)
 */
export const clearAuthSession = () => {
    console.log('🧹 clearAuthSession: Starting...');

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];

    console.log('✅ clearAuthSession: Complete');
};

// ==========================================
// SESSION INITIALIZATION
// ==========================================

/**
 * Initialize auth session on app startup
 * Restores JWT headers from localStorage if token exists
 * This prevents users from being logged out on page refresh
 */
export const initializeAuthSession = () => {
    console.log('🚀 initializeAuthSession: Starting app initialization...');

    const token = getStoredToken();
    const user = getStoredUser();

    if (token && user) {
        console.log('🔑 Restoring auth session from localStorage...');

        try {
            // Validate token format
            const parts = token.split('.');
            if (parts.length === 3) {
                // Validate token expiration
                const payload = JSON.parse(atob(parts[1]));
                const currentTime = Date.now() / 1000;

                if (payload.exp && payload.exp > currentTime) {
                    // Token is valid, restore it in axios headers
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    console.log('✅ Auth session restored from localStorage');
                    return true;
                } else {
                    console.log('⏰ Token has expired, clearing session');
                    clearAuthSession();
                    return false;
                }
            } else {
                console.log('❌ Invalid token format, clearing session');
                clearAuthSession();
                return false;
            }
        } catch (err) {
            console.error('❌ Error restoring auth session:', err);
            clearAuthSession();
            return false;
        }
    } else {
        console.log('📭 No auth session found in localStorage');
        return false;
    }
};

// ==========================================
// STATUS CHECKING
// ==========================================

/**
 * Check if user is currently authenticated
 * @returns {boolean} True if token exists and is valid
 */
export const isAuthenticated = () => {
    const token = getStoredToken();

    if (!token) {
        console.log('❌ isAuthenticated: false (no token)');
        return false;
    }

    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.log('❌ isAuthenticated: false (invalid format)');
            return false;
        }

        const payload = JSON.parse(atob(parts[1]));
        const currentTime = Date.now() / 1000;

        if (payload.exp && payload.exp < currentTime) {
            console.log('❌ isAuthenticated: false (expired)');
            return false;
        }

        console.log('✅ isAuthenticated: true');
        return true;
    } catch (err) {
        console.log('❌ isAuthenticated: false (error)');
        return false;
    }
};

/**
 * Check if user has a specific role
 * @param {string|string[]} roles - Role or array of roles to check
 * @returns {boolean} True if user has any of the specified roles
 */
export const hasRole = (roles) => {
    const userRole = getStoredRole();
    const rolesArray = Array.isArray(roles) ? roles : [roles];

    if (!userRole) {
        console.log('❌ hasRole: false (no user role)');
        return false;
    }

    // Normalize all roles for comparison
    const normalized = rolesArray.map(r => normalizeRole(r));
    const hasPermission = normalized.includes(userRole);

    console.log('🔍 hasRole:', userRole, 'in', normalized, '=', hasPermission);
    return hasPermission;
};

// ==========================================
// EXPORTS SUMMARY
// ==========================================

export default {
    // Token management
    getStoredToken,
    setStoredToken,

    // User management
    getStoredUser,
    setStoredUser,

    // Role management
    normalizeRole,
    getStoredRole,
    getRoleKey,
    getDashboardRouteForRole,

    // Session persistence
    persistAuthSession,
    clearAuthSession,
    initializeAuthSession,

    // Status checking
    isAuthenticated,
    hasRole
};
