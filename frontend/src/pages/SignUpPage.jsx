import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SignUpPage.css';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phone: '',
    email: '',
    password: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

      // Navigate to login page after successful registration
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      {/* Left Side - Hero Image */}
      <div className="signup-left">
        <div className="hero-overlay">
          <div className="hero-content">
            {/* <div className="hero-icon">🌱</div> */}
            <h1 className="hero-title">Connecting the Sugarcane Ecosystem</h1>
            <p className="hero-subtitle">Powering the future of sugar production through seamless digital integration.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="signup-right">
        <div className="signup-card">
          {/* Brand Header */}
          <div className="brand-header">
            {/* <span className="brand-icon">🌱</span> */}
            <span className="brand-name">Sugarcane Platform</span>
          </div>

          {/* Page Title */}
          <div className="signup-header">
            <h2 className="signup-title">Create Your Account</h2>
            <p className="signup-subtitle">Create an account to manage your operations.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="success-message">
              <span className="success-icon">✓</span>
              <span>{success}</span>
            </div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="signup-form">
            {/* Full Name and Username - Two Column */}
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Choose a username"
                  className="form-input"
                />
              </div>
            </div>

            {/* Phone Number with Prefix */}
            <div className="form-field">
              <label htmlFor="phone" className="form-label">Phone Number</label>
              <div className="phone-input-wrapper">
                {/* <span className="phone-prefix">+1</span> */}
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="123-456-7890"
                  className="form-input phone-input"
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-field">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email address"
                className="form-input"
              />
            </div>

            {/* Password with Toggle */}
            <div className="form-field">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="form-input"
                  minLength="6"
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

            {/* Role Dropdown */}
            <div className="form-field">
              <label htmlFor="role" className="form-label">Your Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="">Farmer</option>
                <option value="Farmer">Farmer</option>
                <option value="HHM">HHM (Hub Head Manager)</option>
                <option value="Labour">Labour</option>
                <option value="Factory">Factory</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="signup-btn"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="login-link">
            <span>Already have an account? </span>
            <a href="/login">Login here</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;