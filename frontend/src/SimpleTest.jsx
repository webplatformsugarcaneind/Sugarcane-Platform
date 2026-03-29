// Simple test to verify React basics work
import React from 'react';

const SimpleTest = () => {
  console.log('SimpleTest component rendering...');
  
  return (
    <div style={{
      padding: '2rem',
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌾</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>React is Working!</h2>
      <p style={{ fontSize: '1.2rem', textAlign: 'center', maxWidth: '600px' }}>
        If you can see this page, React is rendering properly. 
        The issue might be with component imports or CSS files.
      </p>
      <div style={{ marginTop: '2rem' }}>
        <button 
          onClick={() => alert('Button clicked! JavaScript is working.')}
          style={{
            padding: '1rem 2rem',
            fontSize: '1rem',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Button
        </button>
      </div>
      <div style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.8 }}>
        Current time: {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default SimpleTest;