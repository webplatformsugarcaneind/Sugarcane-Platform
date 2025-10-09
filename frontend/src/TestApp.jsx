// Test file to check basic React functionality
import React from 'react';

const TestApp = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'green' }}>Test App Running</h1>
      <p>If you see this, React is working properly.</p>
      <button onClick={() => alert('Button clicked!')}>
        Test Button
      </button>
    </div>
  );
};

export default TestApp;