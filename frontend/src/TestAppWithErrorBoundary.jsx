// Test version of App.jsx with error boundaries to catch component issues
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

console.log('App test with error boundary starting...');

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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', border: '2px solid red', margin: '1rem' }}>
          <h2>Something went wrong with {this.props.componentName}</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.toString()}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Safe component loader
const SafeComponent = ({ componentName, children, fallback }) => (
  <ErrorBoundary componentName={componentName}>
    {children}
  </ErrorBoundary>
);

// Individual component imports with error handling
let Navbar, ProtectedRoute, FarmerDashboardLayout;
let HomePage, FactoriesPage, AboutUsPage, LoginPage, SignUpPage;
let FarmerDashboardPage, MarketplacePage, ProfilePage;

// Test loading components
try {
  console.log('Loading components...');
  
  // Import components dynamically in a way that can be caught
  const NavbarModule = require('./components/Navbar.jsx');
  Navbar = NavbarModule.default || NavbarModule;
  console.log('✅ Navbar loaded');
} catch (error) {
  console.error('❌ Navbar failed:', error);
  Navbar = () => <div style={{background: 'red', color: 'white', padding: '1rem'}}>Navbar failed to load: {error.message}</div>;
}

try {
  const HomePageModule = require('./pages/HomePage.jsx');
  HomePage = HomePageModule.default || HomePageModule;
  console.log('✅ HomePage loaded');
} catch (error) {
  console.error('❌ HomePage failed:', error);
  HomePage = () => <div style={{padding: '2rem'}}>HomePage failed to load: {error.message}</div>;
}

try {
  const LoginPageModule = require('./pages/LoginPage.jsx');
  LoginPage = LoginPageModule.default || LoginPageModule;
  console.log('✅ LoginPage loaded');
} catch (error) {
  console.error('❌ LoginPage failed:', error);
  LoginPage = () => <div style={{padding: '2rem'}}>LoginPage failed to load: {error.message}</div>;
}

// Fallback components for missing ones
const FallbackComponent = (name) => () => (
  <div style={{padding: '2rem', background: '#f0f0f0', margin: '1rem'}}>
    <h2>{name} Component</h2>
    <p>This component is not loaded in the test version.</p>
  </div>
);

// Use fallbacks for components we're not testing yet
ProtectedRoute = FallbackComponent('ProtectedRoute');
FarmerDashboardLayout = FallbackComponent('FarmerDashboardLayout');
FactoriesPage = FallbackComponent('FactoriesPage');
AboutUsPage = FallbackComponent('AboutUsPage');
SignUpPage = FallbackComponent('SignUpPage');
FarmerDashboardPage = FallbackComponent('FarmerDashboardPage');
MarketplacePage = FallbackComponent('MarketplacePage');
ProfilePage = FallbackComponent('ProfilePage');

const NotFound = () => (
  <div style={{textAlign: 'center', padding: '2rem'}}>
    <h1>404</h1>
    <p>Page Not Found</p>
  </div>
);

function TestAppWithErrorBoundary() {
  console.log('TestAppWithErrorBoundary rendering...');
  
  return (
    <Router>
      <div className="App" style={{ minHeight: '100vh' }}>
        <SafeComponent componentName="Navbar">
          <Navbar />
        </SafeComponent>
        
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={
              <SafeComponent componentName="HomePage">
                <HomePage />
              </SafeComponent>
            } />
            
            <Route path="/login" element={
              <SafeComponent componentName="LoginPage">
                <LoginPage />
              </SafeComponent>
            } />
            
            <Route path="/signup" element={
              <SafeComponent componentName="SignUpPage">
                <SignUpPage />
              </SafeComponent>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

console.log('TestAppWithErrorBoundary defined');
export default TestAppWithErrorBoundary;