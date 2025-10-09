// Test App.jsx - simplified version to identify issues
import React from 'react';

console.log('App.jsx is loading...');

function TestAppMinimal() {
  console.log('TestAppMinimal component is rendering...');
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'blue' }}>Minimal Test App</h1>
      <p>If you see this, the basic App structure is working.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
}

console.log('App.jsx loaded successfully');
export default TestAppMinimal;