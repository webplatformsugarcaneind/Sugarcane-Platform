// Test App without CSS imports to isolate issues
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

console.log('TestAppWithRouter is loading...');

// Simple inline components to avoid external dependencies
const SimpleNavbar = () => (
  <nav style={{ background: '#4CAF50', padding: '1rem', color: 'white' }}>
    <h2>🌾 Sugarcane Platform</h2>
  </nav>
);

const SimpleHomePage = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>Welcome to Sugarcane Platform</h1>
    <p>This is a test version to verify routing works.</p>
  </div>
);

const SimpleLoginPage = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>Login Page</h1>
    <p>Login functionality will be here.</p>
  </div>
);

const NotFound = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>404 - Page Not Found</h1>
  </div>
);

function TestAppWithRouter() {
  console.log('TestAppWithRouter component is rendering...');
  
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <SimpleNavbar />
        
        <main style={{ flex: 1, background: '#f5f5f5' }}>
          <Routes>
            <Route path="/" element={<SimpleHomePage />} />
            <Route path="/login" element={<SimpleLoginPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        <footer style={{ background: '#333', color: 'white', padding: '1rem', textAlign: 'center' }}>
          © 2025 Sugarcane Platform Test
        </footer>
      </div>
    </Router>
  );
}

console.log('TestAppWithRouter loaded successfully');
export default TestAppWithRouter;