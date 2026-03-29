import React, { useState } from 'react';
import axios from 'axios';

/**
 * Factory Analysis Debug Component
 * This component helps debug the Factory Analysis API connection
 */
const FactoryAnalysisDebug = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const results = {};

    // Test 1: Check if token exists
    const token = localStorage.getItem('token');
    results.tokenExists = !!token;
    results.tokenPreview = token ? `${token.substring(0, 20)}...` : 'No token found';

    // Test 2: Check user info
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userObj = JSON.parse(user);
        results.userRole = userObj.role;
        results.username = userObj.username;
      } catch (e) {
        results.userParseError = e.message;
      }
    }

    // Test 3: Test API endpoint without auth
    try {
      const response = await axios.get('/api/analytics/factory-profitability');
      results.unauthenticatedResult = 'Unexpected: Got response without auth';
    } catch (error) {
      results.unauthenticatedError = {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url
      };
    }

    // Test 4: Test API endpoint with auth (if token exists)
    if (token) {
      try {
        const response = await axios.get('/api/analytics/factory-profitability', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        results.authenticatedResult = {
          success: response.data.success,
          dataCount: response.data.data?.length,
          summary: response.data.summary
        };
      } catch (error) {
        results.authenticatedError = {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          url: error.config?.url
        };
      }
    }

    // Test 5: Test basic backend connectivity
    try {
      const response = await axios.get('/api/health');
      results.healthCheck = response.data;
    } catch (error) {
      results.healthError = {
        status: error.response?.status,
        message: error.message
      };
    }

    setDebugInfo(results);
    setLoading(false);
  };

  const clearStorage = () => {
    localStorage.clear();
    alert('Local storage cleared. Please login again.');
    window.location.href = '/login';
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔧 Factory Analysis Debug Panel</h1>
<<<<<<< HEAD
      
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={runDiagnostics} 
=======

      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={runDiagnostics}
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
          disabled={loading}
          style={{
            background: '#4caf50',
            color: 'white',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
<<<<<<< HEAD
          {loading ? '🔄 Running Tests...' : '🧪 Run Diagnostics'}
        </button>
        
        <button 
=======
          {loading ? (
            <>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Running Tests...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              Run Diagnostics
            </>
          )}
        </button>

        <button
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
          onClick={clearStorage}
          style={{
            background: '#ff9800',
            color: 'white',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🗑️ Clear Storage
        </button>
      </div>

      {Object.keys(debugInfo).length > 0 && (
        <div style={{
          background: '#f5f5f5',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}>
          <h3>📊 Diagnostic Results:</h3>
          <pre style={{
            background: 'white',
            padding: '1rem',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '0.9rem'
          }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#e3f2fd', borderRadius: '4px' }}>
        <h3>📋 Current Status:</h3>
        <ul>
          <li><strong>Frontend:</strong> Running on http://localhost:5174</li>
          <li><strong>Backend:</strong> Should be running on http://localhost:5000</li>
          <li><strong>API Endpoint:</strong> /api/analytics/factory-profitability</li>
          <li><strong>Required Role:</strong> Farmer</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#fff3e0', borderRadius: '4px' }}>
<<<<<<< HEAD
        <h3>🛠️ Common Solutions:</h3>
=======
        <h3>
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          Common Solutions:
        </h3>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
        <ol>
          <li><strong>If "Route not found":</strong> Backend server might not be running</li>
          <li><strong>If "401 Unauthorized":</strong> Token is missing or invalid</li>
          <li><strong>If "403 Forbidden":</strong> User doesn't have Farmer role</li>
          <li><strong>If "Network Error":</strong> Backend server is not accessible</li>
        </ol>
      </div>
    </div>
  );
};

export default FactoryAnalysisDebug;