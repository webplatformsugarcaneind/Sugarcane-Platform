import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LanguageSelector from '../components/LanguageSelector';
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
          <LanguageSelector />
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
                    <span className="role-emoji"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3C12 3 6.5 8 6.5 13a5.5 5.5 0 0 0 11 0C17.5 8 12 3 12 3Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 13v8M9 18h6" /></svg></span>
                    <span className="role-lbl">Farmer</span>
                    <span className="role-sub">Crop & payment tracking</span>
                  </label>
                  <label className={`role-opt ${formData.role === 'HHM' ? 'sel' : ''}`}>
                    <input type="radio" name="role" value="HHM" checked={formData.role === 'HHM'} onChange={() => handleRoleSelection('HHM')} />
                    <span className="role-emoji"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg></span>
                    <span className="role-lbl">HHM</span>
                    <span className="role-sub">Gang & harvest mgmt</span>
                  </label>
                  <label className={`role-opt ${formData.role === 'Labour' ? 'sel' : ''}`}>
                    <input type="radio" name="role" value="Labour" checked={formData.role === 'Labour'} onChange={() => handleRoleSelection('Labour')} />
                    <span className="role-emoji"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77Z" /></svg></span>
                    <span className="role-lbl">Labour</span>
                    <span className="role-sub">Jobs, wages & schemes</span>
                  </label>
                  <label className={`role-opt ${formData.role === 'Factory' ? 'sel' : ''}`}>
                    <input type="radio" name="role" value="Factory" checked={formData.role === 'Factory'} onChange={() => handleRoleSelection('Factory')} />
                    <span className="role-emoji"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205v3m-5.25-9h-.008v.008h.008V3.75Z" /></svg></span>
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
