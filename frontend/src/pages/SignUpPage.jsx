import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Auth.css';
import { useTranslation } from 'react-i18next';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phone: '',
    email: '',
    password: '',
    role: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const handleLangChange = (newLang) => {
    i18n.changeLanguage(newLang);
  };
  const [success, setSuccess] = useState('');

  // Check if role is passed in URL and pre-select it
  useEffect(() => {
    const roleFromUrl = searchParams.get('role');
    if (roleFromUrl) {
      setFormData(prev => ({
        ...prev,
        role: roleFromUrl.charAt(0).toUpperCase() + roleFromUrl.slice(1)
      }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleSelection = (roleValue) => {
    setFormData(prev => ({
      ...prev,
      role: roleValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/api/auth/register', formData);
      setSuccess('Account created successfully! Please login.');
      setFormData({
        name: '',
        username: '',
        phone: '',
        email: '',
        password: '',
        role: ''
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStrength = (v) => {
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    return score;
  };

  const score = calculateStrength(formData.password);
  const strengths = ['','Weak','Fair','Good','Strong'];
  const strengthColors = ['','s0','s1','s2','s3'];

  return (
    <div className="auth-page auth-body" id="page-signup">
      <div className="auth-page-mesh"></div>
      <div className="auth-page-grid"></div>

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
          <button className="auth-btn-solid" onClick={() => navigate('/login')}>{t('nav.logIn')}</button>
        </div>
      </nav>

      <div className="auth-wrap">
        {/* LEFT PANEL */}
        <div className="auth-left">
          <div className="auth-eyebrow">
            <div className="auth-eyebrow-pip"></div>
            <span>{t('auth.signupEyebrow')}</span>
          </div>

          <h1 className="auth-headline">
            {t('auth.signupCreate')}<br/>
            <span className="g">{t('auth.signupYour')}</span><br/>
            <span className="o">{t('auth.signupAccount')}</span>
          </h1>

          <p className="auth-sub">
            {t('auth.signupDesc')}
          </p>

          <div className="auth-stats">
            <div className="astat">
              <div className="astat-n">Free</div>
              <div className="astat-l">For all users</div>
            </div>
            <div className="astat">
              <div className="astat-n">Fast</div>
              <div className="astat-l">Quick request handling</div>
            </div>
            <div className="astat">
              <div className="astat-n">Simple</div>
              <div className="astat-l">Easy to use interface</div>
            </div>
            <div className="astat">
              <div className="astat-n">Access</div>
              <div className="astat-l">Web-based platform</div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - form card */}
        <div className="auth-card">
          <div className="card-tag">Create Account</div>
          <h2 className="card-title">Get <em>started.</em></h2>
          <p className="card-sub">Join the sugarcane platform — it takes 2 minutes</p>

          {error && <div className="auth-error-message">{error}</div>}
          {success && <div className="auth-success-message">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <div className="fields-row">
                <div className="field">
                  <label>Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ramesh Patil" required />
                </div>
                <div className="field">
                  <label>Username</label>
                  <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="ramesh_patil" required />
                </div>
              </div>

              <div className="fields-row">
                <div className="field">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" required />
                </div>
                <div className="field">
                  <label>Email (optional)</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="ramesh@example.com" />
                </div>
              </div>

              <div className="field">
                <label>Password</label>
                <div className="pw-wrap">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password" 
                    required 
                    minLength="6"
                  />
                  <button className="pw-toggle" type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="strength-bar">
                  <div className={`sb-seg ${score > 0 ? strengthColors[score] : ''}`}></div>
                  <div className={`sb-seg ${score > 1 ? strengthColors[score] : ''}`}></div>
                  <div className={`sb-seg ${score > 2 ? strengthColors[score] : ''}`}></div>
                  <div className={`sb-seg ${score > 3 ? strengthColors[score] : ''}`}></div>
                </div>
                <div className="strength-label">{formData.password ? strengths[score] || strengths[4] : ''}</div>
              </div>

              <div className="field">
                <label>Your Role</label>
                <div className="role-grid">
                  <label className={`role-opt ${formData.role === 'Farmer' ? 'sel' : ''}`}>
                    <input type="radio" name="role" value="Farmer" checked={formData.role === 'Farmer'} onChange={() => handleRoleSelection('Farmer')} />
                    <span className="role-emoji">🌾</span>
                    <span className="role-lbl">Farmer</span>
                    <span className="role-sub">Crop & payment tracking</span>
                  </label>
                  <label className={`role-opt ${formData.role === 'HHM' ? 'sel' : ''}`}>
                    <input type="radio" name="role" value="HHM" checked={formData.role === 'HHM'} onChange={() => handleRoleSelection('HHM')} />
                    <span className="role-emoji">👥</span>
                    <span className="role-lbl">HHM</span>
                    <span className="role-sub">Gang & harvest mgmt</span>
                  </label>
                  <label className={`role-opt ${formData.role === 'Labour' ? 'sel' : ''}`}>
                    <input type="radio" name="role" value="Labour" checked={formData.role === 'Labour'} onChange={() => handleRoleSelection('Labour')} />
                    <span className="role-emoji">⚒️</span>
                    <span className="role-lbl">Labour</span>
                    <span className="role-sub">Jobs, wages & schemes</span>
                  </label>
                  <label className={`role-opt ${formData.role === 'Factory' ? 'sel' : ''}`}>
                    <input type="radio" name="role" value="Factory" checked={formData.role === 'Factory'} onChange={() => handleRoleSelection('Factory')} />
                    <span className="role-emoji">🏭</span>
                    <span className="role-lbl">Factory</span>
                    <span className="role-sub">Supply chain & analytics</span>
                  </label>
                </div>
              </div>
            </div>

            <button className="auth-btn-submit" type="submit" disabled={loading || !formData.role}>
              {loading ? 'Creating Account...' : 'Create Account'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </button>
          </form>

          <div className="form-divider"><span>or</span></div>

          <div className="card-switch">
            Already have an account? <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Sign in here →</a>
          </div>
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

export default SignUpPage;
