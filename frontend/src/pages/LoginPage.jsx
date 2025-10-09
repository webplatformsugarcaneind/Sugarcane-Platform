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
      <div className="login-container">
        <h1>Welcome Back</h1>
        <p>Sign in to your account</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="identifier">Username, Email, or Phone</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              required
              placeholder="Enter your username, email, or phone"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="signup-link">
          <p>Don't have an account? <a href="/signup">Create one here</a></p>
        </div>

        <div className="forgot-password">
          <a href="/forgot-password">Forgot your password?</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;