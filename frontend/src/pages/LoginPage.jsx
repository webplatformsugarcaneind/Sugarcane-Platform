import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

      // Save JWT token to localStorage
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Set default authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Dispatch custom event to notify navbar of authentication change
      window.dispatchEvent(new CustomEvent('authUpdate'));

      // Navigate to dashboard based on user role
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
      case 'farmer':
        return '/farmer/dashboard';
      case 'hhm':
        return '/hhm/dashboard';
      case 'worker':
      case 'labour':
        return '/worker/jobs';
      case 'factory':
        return '/factory/dashboard';
      default:
        return '/';
    }
  };

  return (
    <div className="login-page">
      {/* Left Side - Hero Image */}
      <div className="login-left">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-title">Empowering the Future of Sugarcane Production</h1>
            <p className="hero-subtitle">Streamline your factory operations from field to final product with our integrated platform.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-right">
        <div className="login-container">
          <div className="login-card">
            {/* Brand Header */}
            {/* <div className="brand-header">
              <div className="brand-icon">🌾</div>
              <h1 className="brand-name">Sugarcane Platform</h1>
            </div> */}

            {/* Page Title */}
            <div className="login-header">
              <h2 className="login-title">Welcome Back</h2>
              <p className="login-subtitle">Log in to manage your factory operations.</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                {/* <svg className="error-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg> */}
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="login-form">
              {/* Username/Email/Phone Input */}
              <div className="form-group">
                <label htmlFor="identifier" className="form-label">
                  USERNAME, EMAIL, OR PHONE
                </label>
                <div className="input-wrapper">
                  {/* <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg> */}
                  <input
                    type="text"
                    id="identifier"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    required
                    placeholder="testfarmar1"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  PASSWORD
                </label>
                <div className="input-wrapper">
                  {/* <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg> */}
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" className="checkbox-input" />
                  <span>Remember me</span>
                </label>
                <a href="/forgot-password" className="forgot-link">Forgot password?</a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="spinner" viewBox="0 0 24 24">
                      <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    </svg>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="signup-link">
              <span>Don't have an account? </span>
              <a href="/signup">Create one here</a>
            </div>
          </div>

          {/* Footer Links */}
          {/* <div className="login-footer">
            <a href="/terms">Terms of Service</a>
            <span className="separator">·</span>
            <a href="/privacy">Privacy Policy</a>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;