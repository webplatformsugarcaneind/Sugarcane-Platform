import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthSession, getDashboardRouteForRole, getStoredUser, normalizeRole } from '../utils/authSession.js';
import './Auth.css';

/**
 * UnauthorizedPage Component
 *
 * Displayed when:
 * - User tries to access a route for a different role
 * - User doesn't have required permissions for a resource
 * - JWT validation fails
 */
const UnauthorizedPage = () => {
    const navigate = useNavigate();
    const user = getStoredUser();
    const role = normalizeRole(user?.role);
    const dashboardRoute = role ? getDashboardRouteForRole(role) : '/';
    const hasSession = Boolean(localStorage.getItem('token')) || Boolean(user);

    const handleLogout = () => {
        clearAuthSession();
        window.dispatchEvent(new CustomEvent('authUpdate'));
        navigate('/login');
    };

    const handleGoToDashboard = () => {
        if (role) {
            navigate(dashboardRoute);
            return;
        }

        navigate('/');
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const handleBack = () => {
        navigate(-1);
    };

    const contextLabel = role
        ? `You are signed in as ${role}.`
        : hasSession
            ? 'Your session is no longer authorized for this page.'
            : 'This page requires an active authenticated session.';

    return (
        <div className="auth-page auth-body unauthorized-page" id="page-unauthorized">
            <div className="auth-page-mesh" aria-hidden="true"></div>
            <div className="auth-page-grid" aria-hidden="true"></div>
            <span className="auth-page-orb auth-page-orb-1" aria-hidden="true"></span>
            <span className="auth-page-orb auth-page-orb-2" aria-hidden="true"></span>
            <span className="auth-page-orb auth-page-orb-3" aria-hidden="true"></span>
            <span className="auth-page-particle auth-page-particle-1" aria-hidden="true"></span>
            <span className="auth-page-particle auth-page-particle-2" aria-hidden="true"></span>
            <span className="auth-page-particle auth-page-particle-3" aria-hidden="true"></span>

            <nav className="auth-nav unauthorized-nav" aria-label="Unauthorized page navigation">
                <button type="button" className="auth-nav-back" onClick={handleBack}>
                    Back
                </button>
                <a href="/" className="auth-nav-brand" onClick={(e) => { e.preventDefault(); handleGoHome(); }}>
                    <div className="auth-nav-brand-dot"></div>
                    <span className="auth-nav-brand-name">CaneSetu</span>
                </a>
            </nav>

            <main className="auth-main unauthorized-main">
                <section className="auth-section unauthorized-section" aria-labelledby="unauthorized-title">
                    <div className="auth-panel unauthorized-card" role="alert">
                        <div className="unauthorized-hero">
                            <div className="unauthorized-icon-wrap" aria-hidden="true">
                                <svg className="unauthorized-icon" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <linearGradient id="unauthorizedShieldGradient" x1="16" y1="12" x2="80" y2="84" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#B6F46B" />
                                            <stop offset="1" stopColor="#5A8E2B" />
                                        </linearGradient>
                                        <linearGradient id="unauthorizedGlowGradient" x1="22" y1="16" x2="72" y2="74" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="rgba(126,200,67,0.35)" />
                                            <stop offset="1" stopColor="rgba(126,200,67,0.02)" />
                                        </linearGradient>
                                    </defs>
                                    <circle cx="48" cy="48" r="41" stroke="url(#unauthorizedGlowGradient)" strokeWidth="1.5" opacity="0.8" />
                                    <path d="M48 13L71 22V40C71 56.1 61.5 69.8 48 77C34.5 69.8 25 56.1 25 40V22L48 13Z" fill="rgba(14,19,14,0.9)" stroke="url(#unauthorizedShieldGradient)" strokeWidth="2.4" />
                                    <path d="M38 43.5C38 37.7 42.7 33 48.5 33C54.3 33 59 37.7 59 43.5V48.2H38V43.5Z" stroke="url(#unauthorizedShieldGradient)" strokeWidth="2.2" />
                                    <rect x="39.5" y="47.2" width="18" height="14.8" rx="4" fill="rgba(126,200,67,0.08)" stroke="url(#unauthorizedShieldGradient)" strokeWidth="2.2" />
                                    <circle cx="48.5" cy="54.8" r="1.8" fill="#B6F46B" />
                                    <path d="M28 30L67 69" stroke="#FF7B72" strokeWidth="5" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div className="unauthorized-hero-copy">
                                <p className="unauthorized-eyebrow">Secure access checkpoint</p>
                                <h1 className="unauthorized-title" id="unauthorized-title">Access Denied</h1>
                                <p className="unauthorized-description">
                                    You do not have permission to view this part of CaneSetu. The page you requested is protected by role-based access controls.
                                </p>
                            </div>
                        </div>

                        <div className="unauthorized-context" aria-live="polite">
                            <div className="unauthorized-context-chip">{contextLabel}</div>
                            <div className="unauthorized-context-chip unauthorized-context-chip-soft">
                                {role ? `Redirect to ${role} dashboard when ready.` : 'Sign in with the correct account to continue.'}
                            </div>
                        </div>

                        <div className="unauthorized-notes" aria-label="Access denial details">
                            <div className="unauthorized-note">Different role dashboard</div>
                            <div className="unauthorized-note">Missing permission scope</div>
                            <div className="unauthorized-note">Expired or invalid session</div>
                            <div className="unauthorized-note">Switch to another account</div>
                        </div>

                        <div className="unauthorized-actions" aria-label="Unauthorized page actions">
                            <button type="button" className="auth-btn-solid unauthorized-primary" onClick={handleGoToDashboard}>
                                Go to My Dashboard
                            </button>
                            <button type="button" className="auth-btn-outline unauthorized-secondary" onClick={handleGoHome}>
                                Go Home
                            </button>
                            <button type="button" className="auth-btn-outline unauthorized-secondary unauthorized-logout" onClick={handleLogout}>
                                Log Out
                            </button>
                        </div>

                        <p className="unauthorized-support">
                            If this looks incorrect, contact support or return to your dashboard from the action above.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default UnauthorizedPage;
