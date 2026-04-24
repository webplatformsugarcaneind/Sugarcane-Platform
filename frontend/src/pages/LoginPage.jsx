import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const handleLangChange = (newLang) => {
    i18n.changeLanguage(newLang);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/login', formData);
      
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      window.dispatchEvent(new CustomEvent('authUpdate'));
      
      const dashboardRoute = getDashboardRoute(user.role);
      navigate(dashboardRoute);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const getDashboardRoute = (role) => {
    switch (role.toLowerCase()) {
      case 'farmer': return '/farmer/dashboard';
      case 'hhm': return '/hhm/dashboard';
      case 'worker':
      case 'labour': return '/worker/jobs';
      case 'factory': return '/factory/dashboard';
      default: return '/';
    }
  };

  return (
    <div className="auth-page auth-body" id="page-login">
      {/* Background Effects */}
      <div className="auth-page-mesh"></div>
      <div className="auth-page-grid"></div>

      {/* Internal Minimal Nav if required (The HTML has it, we map it to routes) */}
      <nav className="auth-nav">
        <a href="/" className="auth-nav-brand" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          <div className="auth-nav-brand-dot"></div>
          <span className="auth-nav-brand-name">CaneSetu</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="nav-lang-switcher" style={{ position: 'relative', marginRight: '12px' }}>
            <div className="lang-trigger" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '8px 14px', borderRadius: '100px', border: '1px solid var(--border)', transition: 'all 0.2s' }}>
              <span style={{ fontSize: '14px', color: 'var(--green)' }}>文/A</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{lang === 'en' ? 'English' : lang === 'hi' ? 'हिन्दी' : 'मराठी'}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            <div className="lang-dropdown-menu" style={{ position: 'absolute', top: '100%', right: '0', marginTop: '8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '120px', zIndex: 100, opacity: 0, pointerEvents: 'none', transform: 'translateY(-10px)', transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
              <button onClick={() => handleLangChange('en')} style={{ background: lang === 'en' ? 'rgba(126,200,67,0.1)' : 'transparent', color: lang === 'en' ? 'var(--green)' : 'var(--white)', border: 'none', padding: '8px 12px', textAlign: 'left', borderRadius: '6px', fontSize: '0.82rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>English {lang === 'en' && '✓'}</button>
              <button onClick={() => handleLangChange('hi')} style={{ background: lang === 'hi' ? 'rgba(126,200,67,0.1)' : 'transparent', color: lang === 'hi' ? 'var(--green)' : 'var(--white)', border: 'none', padding: '8px 12px', textAlign: 'left', borderRadius: '6px', fontSize: '0.82rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>हिन्दी {lang === 'hi' && '✓'}</button>
              <button onClick={() => handleLangChange('mr')} style={{ background: lang === 'mr' ? 'rgba(126,200,67,0.1)' : 'transparent', color: lang === 'mr' ? 'var(--green)' : 'var(--white)', border: 'none', padding: '8px 12px', textAlign: 'left', borderRadius: '6px', fontSize: '0.82rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>मराठी {lang === 'mr' && '✓'}</button>
            </div>
          </div>
          <button 
            className="auth-btn-solid" 
            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--white)', border: '1px solid var(--border)', boxShadow: 'none' }} 
            onClick={() => navigate('/')}
          >
            {t('nav.backHome')}
          </button>
          <button className="auth-btn-solid" onClick={() => navigate('/signup')}>{t('nav.signUp')}</button>
        </div>
      </nav>

      <div className="auth-wrap">
        {/* LEFT PANEL */}
        <div className="auth-left">
          <div className="auth-eyebrow">
            <div class="auth-eyebrow-pip"></div>
            <span>CaneSetu</span>
          </div>

          <h1 className="auth-headline">
            {t('auth.loginWelcome')}<br/>
            <span className="g">{t('auth.loginBack')}</span><br/>
            <span className="o">{t('auth.loginPlatform')}</span>
          </h1>

          <p className="auth-sub">
            {t('auth.loginDesc')}
          </p>

          <div className="auth-stats">
            <div className="astat">
              <div className="astat-n">Users</div>
              <div className="astat-l">Farmers, Workers, HHMs, Factories</div>
            </div>
            <div className="astat">
              <div className="astat-n">Requests</div>
              <div className="astat-l">Track and manage activities</div>
            </div>
            <div className="astat">
              <div className="astat-n">Tasks</div>
              <div className="astat-l">Assigned and completed work</div>
            </div>
            <div className="astat">
              <div className="astat-n">Records</div>
              <div className="astat-l">Centralized data access</div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - FORM */}
        <div className="auth-card">
          <div className="card-tag">Secure Sign In</div>
          <h2 className="card-title">Welcome <em>back.</em></h2>
          <p className="card-sub">Sign in to your account to continue</p>

          {error && <div className="auth-error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <div className="field">
                <label>Username, Email, or Phone</label>
                <input 
                  type="text" 
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  placeholder="e.g. ramesh_patil or +91 98765 43210" 
                  required
                />
              </div>

              <div className="field">
                <label>Password</label>
                <div className="pw-wrap">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password" 
                    required
                  />
                  <button 
                    className="pw-toggle" 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            <button className="auth-btn-submit" type="submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </button>
          </form>

          <div className="form-divider"><span>or</span></div>

          <div className="card-switch">
            Don't have an account? <a href="/signup" onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>Create one here →</a>
          </div>
          <a href="/forgot-password" onClick={(e) => e.preventDefault()} className="forgot-link">Forgot your password?</a>
        </div>
      </div>

      <footer className="auth-footer">
        <span className="auth-footer-copy">© 2025 CaneSetu Technologies Pvt. Ltd.</span>
        <div className="auth-footer-links">
          <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
