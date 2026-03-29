// Progressive test to identify problematic imports
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

console.log('Progressive test starting...');

// Test individual component imports one by one
let TestNavbar, TestHomePage, TestLoginPage;

try {
  // Test 1: Try importing Navbar
  console.log('Testing Navbar import...');
  const NavbarImport = await import('./components/Navbar.jsx');
  TestNavbar = NavbarImport.default;
  console.log('✅ Navbar imported successfully');
} catch (error) {
  console.error('❌ Navbar import failed:', error);
  TestNavbar = () => <nav style={{background: 'red', padding: '1rem', color: 'white'}}>Navbar Import Failed</nav>;
}

try {
  // Test 2: Try importing HomePage
  console.log('Testing HomePage import...');
  const HomePageImport = await import('./pages/HomePage.jsx');
  TestHomePage = HomePageImport.default;
  console.log('✅ HomePage imported successfully');
} catch (error) {
  console.error('❌ HomePage import failed:', error);
  TestHomePage = () => <div style={{padding: '2rem'}}>HomePage Import Failed: {error.message}</div>;
}

try {
  // Test 3: Try importing LoginPage
  console.log('Testing LoginPage import...');
  const LoginPageImport = await import('./pages/LoginPage.jsx');
  TestLoginPage = LoginPageImport.default;
  console.log('✅ LoginPage imported successfully');
} catch (error) {
  console.error('❌ LoginPage import failed:', error);
  TestLoginPage = () => <div style={{padding: '2rem'}}>LoginPage Import Failed: {error.message}</div>;
}

function ProgressiveTestApp() {
  console.log('ProgressiveTestApp rendering...');
  
  return (
    <Router>
      <div style={{ minHeight: '100vh' }}>
        <TestNavbar />
        
        <main style={{ padding: '2rem' }}>
          <h1>Progressive Component Test</h1>
          <p>Check console for import results</p>
          
          <Routes>
            <Route path="/" element={<TestHomePage />} />
            <Route path="/login" element={<TestLoginPage />} />
            <Route path="*" element={<div>404 - Not Found</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default ProgressiveTestApp;