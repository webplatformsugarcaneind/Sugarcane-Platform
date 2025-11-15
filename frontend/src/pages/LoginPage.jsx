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
        <div className="login-card">
          {/* Brand Header */}
          <div className="brand-header">
            {/* <span className="brand-icon">🌱</span> */}
            <span className="brand-name">Sugarcane Platform</span>
          </div>

          {/* Page Title */}
          <div className="login-header">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Log in to manage your factory operations.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Username/Email/Phone Input */}
            <div className="form-field">
              <label htmlFor="identifier" className="form-label">
                Username, Email, or Phone
              </label>
              <div className="input-wrapper">
                {/* <span className="input-icon">👤</span> */}
                <input
                  type="text"
                  id="identifier"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  required
                  placeholder="Enter your username, email, or phone"
                  className="form-input"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-field">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-wrapper">
                {/* <span className="input-icon">🔒</span> */}
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
                >
                  {showPassword ? '👁️' : '👁️'}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="forgot-password">
              <a href="/forgot-password">Forgot your password?</a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="signup-link">
            <span>Don't have an account? </span>
            <a href="/signup">Create one here</a>
          </div>

          {/* Footer Links */}
          <div className="login-footer">
            <a href="/terms">Terms of Service</a>
            <span className="separator">·</span>
            <a href="/privacy">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;