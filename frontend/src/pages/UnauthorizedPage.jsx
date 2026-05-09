import React from 'react';
import { useNavigate } from 'react-router-dom';
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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('authUpdate'));
        navigate('/login');
    };

    const handleGoToDashboard = () => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                const dashboardRoutes = {
                    'Farmer': '/farmer/dashboard',
                    'HHM': '/hhm/dashboard',
                    'Labour': '/worker/jobs',
                    'Worker': '/worker/jobs',
                    'Factory': '/factory/dashboard'
                };

                const route = dashboardRoutes[user.role] || '/';
                navigate(route);
            } catch (err) {
                navigate('/');
            }
        } else {
            navigate('/');
        }
    };

    return (
        <div className="auth-page auth-body" id="page-unauthorized">
            <div className="auth-page-mesh"></div>
            <div className="auth-page-grid"></div>

            <nav className="auth-nav">
                <a href="/" className="auth-nav-brand" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                    <div className="auth-nav-brand-dot"></div>
                    <span className="auth-nav-brand-name">CaneSetu</span>
                </a>
            </nav>

            <main className="auth-main">
                <section className="auth-section">
                    <div className="auth-panel">
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🚫</div>

                            <h1 style={{
                                fontSize: '28px',
                                fontWeight: '600',
                                marginBottom: '0.5rem',
                                color: 'var(--white)'
                            }}>
                                Access Denied
                            </h1>

                            <p style={{
                                fontSize: '16px',
                                color: 'var(--muted)',
                                marginBottom: '2rem',
                                lineHeight: '1.6'
                            }}>
                                You don't have permission to access this page. This may be because:
                            </p>

                            <ul style={{
                                textAlign: 'left',
                                display: 'inline-block',
                                fontSize: '14px',
                                color: 'var(--muted)',
                                marginBottom: '2rem',
                                lineHeight: '1.8'
                            }}>
                                <li>✓ You're trying to access a different role's dashboard</li>
                                <li>✓ Your account doesn't have the required permissions</li>
                                <li>✓ Your session has expired</li>
                                <li>✓ You need to log in with a different account</li>
                            </ul>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button
                                    className="auth-btn-solid"
                                    onClick={handleGoToDashboard}
                                    style={{ background: 'var(--green)', color: 'var(--black)' }}
                                >
                                    Go to My Dashboard
                                </button>

                                <button
                                    className="auth-btn-outline"
                                    onClick={handleLogout}
                                >
                                    Log Out
                                </button>

                                <button
                                    className="auth-btn-outline"
                                    onClick={() => navigate('/')}
                                >
                                    Go Home
                                </button>
                            </div>

                            <p style={{
                                fontSize: '12px',
                                color: 'var(--muted)',
                                marginTop: '2rem'
                            }}>
                                If you believe this is an error, please contact support.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="auth-footer">
                <span className="auth-footer-copy">© 2025 CaneSetu Technologies Pvt. Ltd. All rights reserved.</span>
            </footer>
        </div>
    );
};

export default UnauthorizedPage;
