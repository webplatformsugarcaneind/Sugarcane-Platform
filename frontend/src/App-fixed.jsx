import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import components with error handling
let Navbar, ProtectedRoute, FarmerDashboardLayout;
let HomePage, FactoriesPage, SpecificFactoryPage, AboutUsPage, LoginPage, SignUpPage;
let FarmerDashboardPage, MarketplacePage, ProfilePage;

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`Error in ${this.props.componentName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '1rem', 
          margin: '1rem', 
          border: '2px solid #ff6b6b', 
          borderRadius: '8px',
          background: '#ffe0e0'
        }}>
          <h3 style={{ color: '#d63031' }}>Error in {this.props.componentName}</h3>
          <p style={{ color: '#636e72' }}>
            {this.state.error?.message || 'Unknown error occurred'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Safe component wrapper
const SafeComponent = ({ name, children }) => (
  <ErrorBoundary componentName={name}>
    <Suspense fallback={<div style={{padding: '1rem'}}>Loading {name}...</div>}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

// Try to import components safely
try {
  Navbar = require('./components/Navbar').default;
} catch (error) {
  console.error('Failed to load Navbar:', error);
  Navbar = () => (
    <nav style={{ background: '#2d3436', color: 'white', padding: '1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        🌾 Sugarcane Platform (Navbar Error: {error.message})
      </div>
    </nav>
  );
}

try {
  HomePage = require('./pages/HomePage').default;
} catch (error) {
  console.error('Failed to load HomePage:', error);
  HomePage = () => (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>🌾 Welcome to Sugarcane Platform</h1>
      <p>HomePage component failed to load: {error.message}</p>
      <p>But the app is working! You can navigate to other pages.</p>
    </div>
  );
}

try {
  LoginPage = require('./pages/LoginPage').default;
} catch (error) {
  console.error('Failed to load LoginPage:', error);
  LoginPage = () => (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Login Page</h1>
      <p>LoginPage component failed to load: {error.message}</p>
    </div>
  );
}

try {
  SignUpPage = require('./pages/SignUpPage').default;
} catch (error) {
  console.error('Failed to load SignUpPage:', error);
  SignUpPage = () => (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Sign Up Page</h1>
      <p>SignUpPage component failed to load: {error.message}</p>
    </div>
  );
}

// Fallback components for the rest
ProtectedRoute = () => <div style={{padding: '2rem'}}>ProtectedRoute not loaded yet</div>;
FarmerDashboardLayout = () => <div style={{padding: '2rem'}}>FarmerDashboardLayout not loaded yet</div>;
FactoriesPage = () => <div style={{padding: '2rem'}}>FactoriesPage not loaded yet</div>;
SpecificFactoryPage = () => <div style={{padding: '2rem'}}>SpecificFactoryPage not loaded yet</div>;
AboutUsPage = () => <div style={{padding: '2rem'}}>AboutUsPage not loaded yet</div>;
FarmerDashboardPage = () => <div style={{padding: '2rem'}}>FarmerDashboardPage not loaded yet</div>;
MarketplacePage = () => <div style={{padding: '2rem'}}>MarketplacePage not loaded yet</div>;
ProfilePage = () => <div style={{padding: '2rem'}}>ProfilePage not loaded yet</div>;

function App() {
  console.log('App component rendering...');
  
  return (
    <Router>
      <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Navbar with error boundary */}
        <SafeComponent name="Navbar">
          <Navbar />
        </SafeComponent>
        
        {/* Main content area */}
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Home Route */}
            <Route path="/" element={
              <SafeComponent name="HomePage">
                <HomePage />
              </SafeComponent>
            } />
            
            {/* Authentication Routes */}
            <Route path="/login" element={
              <SafeComponent name="LoginPage">
                <LoginPage />
              </SafeComponent>
            } />
            
            <Route path="/signup" element={
              <SafeComponent name="SignUpPage">
                <SignUpPage />
              </SafeComponent>
            } />
            
            {/* Factories Routes */}
            <Route path="/factories" element={
              <SafeComponent name="FactoriesPage">
                <FactoriesPage />
              </SafeComponent>
            } />
            
            <Route path="/factory/:id" element={
              <SafeComponent name="SpecificFactoryPage">
                <SpecificFactoryPage />
              </SafeComponent>
            } />
            
            {/* About Route */}
            <Route path="/about" element={
              <SafeComponent name="AboutUsPage">
                <AboutUsPage />
              </SafeComponent>
            } />
            
            {/* Protected Farmer Routes - Simplified for now */}
            <Route path="/farmer/*" element={
              <SafeComponent name="Farmer Routes">
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <h1>🌾 Farmer Dashboard</h1>
                  <p>Farmer routes will be enabled once basic components are working.</p>
                  <a href="/" style={{ color: '#4CAF50' }}>← Back to Home</a>
                </div>
              </SafeComponent>
            } />
            
            {/* Catch-all route for 404 pages */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        {/* Simple Footer */}
        <Footer />
      </div>
    </Router>
  );
}

// 404 Not Found Component
const NotFound = () => {
  return (
    <div style={{
      padding: '4rem 2rem',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ fontSize: '4rem', margin: '0' }}>404</h1>
      <h2 style={{ fontSize: '2rem', margin: '1rem 0' }}>Page Not Found</h2>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        The page you're looking for doesn't exist.
      </p>
      <a 
        href="/" 
        style={{
          background: '#4CAF50',
          color: 'white',
          padding: '1rem 2rem',
          textDecoration: 'none',
          borderRadius: '5px',
          fontSize: '1.1rem'
        }}
      >
        🏠 Go Back Home
      </a>
    </div>
  );
};

// Simple Footer Component
const Footer = () => {
  return (
    <footer style={{
      background: '#2d3436',
      color: 'white',
      padding: '2rem 0',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem',
        textAlign: 'center'
      }}>
        <p style={{ margin: '0' }}>
          &copy; 2025 Sugarcane Platform. All rights reserved.
        </p>
        <div style={{ marginTop: '1rem' }}>
          <a href="/about" style={{ color: '#74b9ff', marginRight: '1rem' }}>About</a>
          <a href="/contact" style={{ color: '#74b9ff', marginRight: '1rem' }}>Contact</a>
          <a href="/privacy" style={{ color: '#74b9ff' }}>Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default App;