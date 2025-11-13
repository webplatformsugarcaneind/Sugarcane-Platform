import React, { Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, NavLink } from 'react-router-dom';
import './App.css';
import './components/Navbar.css';

// Import components with proper ES6 imports
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AuthenticatedLayout from './components/AuthenticatedLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import FactoriesPage from './pages/FactoriesPage.jsx';
import SpecificFactoryPage from './pages/SpecificFactoryPage.jsx';
import AboutUsPage from './pages/AboutUsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import FarmerDashboardPage from './pages/FarmerDashboardPage.jsx';
import MarketplacePage from './pages/MarketplacePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import FarmerHHMDirectoryPage from './pages/FarmerHHMDirectoryPage.jsx';
import FarmerFactoryDirectoryPage from './pages/FarmerFactoryDirectoryPage.jsx';
import HHMFactoryDirectoryPage from './pages/HHMFactoryDirectoryPage.jsx';
import HHMSpecificFactoryPage from './pages/HHMSpecificFactoryPage.jsx';
import FactoryDirectoryPage from './pages/FactoryDirectoryPage.jsx';
import FactoryProfilePage from './pages/FactoryProfilePage.jsx';
import HHMDashboardPage from './pages/HHMDashboardPage.jsx';
import HHMFactoryInvitationsPage from './pages/HHMFactoryInvitationsPage.jsx';
import HHMSentFactoryInvitationsPage from './pages/HHMSentFactoryInvitationsPage.jsx';
import HHMAssociatedFactoriesPage from './pages/HHMAssociatedFactoriesPage.jsx';
import HHMPerformancePage from './pages/HHMPerformancePage.jsx';
import HHMNotificationCenter from './pages/HHMNotificationCenter.jsx';
import NotificationTestPage from './pages/NotificationTestPage.jsx';
import LaborManagementPage from './pages/LaborManagementPage.jsx';
import WorkerDashboardPage from './pages/WorkerDashboardPage.jsx';
import WorkerHHMDirectoryPage from './pages/WorkerHHMDirectoryPage.jsx';
import AvailableJobsPage from './pages/AvailableJobsPage.jsx';
import MyApplicationsPage from './pages/MyApplicationsPage.jsx';
import InvitesAndApplicationsPage from './pages/InvitesAndApplicationsPage.jsx';
import FactoryDashboardPage from './pages/FactoryDashboardPage.jsx';
import FactoryHHMDirectoryPage from './pages/FactoryHHMDirectoryPage.jsx';
import FactorySentInvitationsPage from './pages/FactorySentInvitationsPage.jsx';
import FactoryReceivedInvitationsPage from './pages/FactoryReceivedInvitationsPage.jsx';
import FactoryProfileViewPage from './pages/FactoryProfileViewPage.jsx';
import FactoryAssociatedHHMsPage from './pages/FactoryAssociatedHHMsPage.jsx';
import HHMProfileViewPage from './pages/HHMProfileViewPage.jsx';
import HHMPublicProfilePage from './pages/HHMPublicProfilePage.jsx';
import ContractsDashboard from './pages/ContractsDashboard.jsx';
import HHMFarmerDirectoryPage from './pages/HHMFarmerDirectoryPage.jsx';
import HHMFarmerProfilePage from './pages/HHMFarmerProfilePage.jsx';
import FarmerContractRequestPage from './pages/FarmerContractRequestPage.jsx';
import FarmerContractsDashboard from './pages/FarmerContractsDashboard.jsx';
import HHMContractDashboard from './pages/HHMContractDashboard.jsx';
import FarmerPublicProfilePage from './pages/FarmerPublicProfilePage.jsx';
import FactoryAnalysisPage from './pages/FactoryAnalysisPage.jsx';
import FactoryAnalysisDebug from './pages/FactoryAnalysisDebug.jsx';
import ListingDetailsPage from './pages/ListingDetailsPage.jsx';
import FarmerProfileViewPage from './pages/FarmerProfileViewPage.jsx';
import WorkerHHMProfileViewPage from './pages/WorkerHHMProfileViewPage.jsx';
import FactoryHHMProfileViewPage from './pages/FactoryHHMProfileViewPage.jsx';
import UserProfilePage from './pages/UserProfilePage.jsx';

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
    <Suspense fallback={<div style={{ padding: '1rem' }}>Loading {name}...</div>}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

console.log('All components imported successfully');

// Component to conditionally render navbar based on route
const ConditionalNavbar = () => {
  const location = useLocation();

  // Show authenticated navbar for protected routes, public navbar for public routes
  const protectedRoutes = ['/farmer', '/hhm', '/worker', '/factory'];
  const isProtectedRoute = protectedRoutes.some(route =>
    location.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Show authenticated navbar (handles different user roles internally)
    return (
      <SafeComponent name="Navbar">
        <Navbar />
      </SafeComponent>
    );
  }

  // Show public navbar for non-protected routes
  return (
    <SafeComponent name="Navbar">
      <PublicNavbar />
    </SafeComponent>
  );
};

// Public Navbar Component (always shows public links)
const PublicNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo Section */}
        <div className="navbar-logo">
          <NavLink
            to="/"
            className="logo-link"
            onClick={closeMenu}
          >
            <span className="logo-icon">🌾</span>
            <span className="logo-text">Sugarcane Platform</span>
          </NavLink>
        </div>

        {/* Desktop Navigation Menu */}
        <div className="navbar-menu">
          <ul className="navbar-nav">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
                onClick={closeMenu}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/factories"
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
                onClick={closeMenu}
              >
                Factories
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
                onClick={closeMenu}
              >
                About Us
              </NavLink>
            </li>
          </ul>

          {/* Auth Button */}
          <div className="navbar-auth">
            <NavLink
              to="/login"
              className="auth-button"
              onClick={closeMenu}
            >
              Login / Sign Up
            </NavLink>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-content">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
            }
            onClick={closeMenu}
          >
            Home
          </NavLink>
          <NavLink
            to="/factories"
            className={({ isActive }) =>
              isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
            }
            onClick={closeMenu}
          >
            Factories
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
            }
            onClick={closeMenu}
          >
            About Us
          </NavLink>
          <NavLink
            to="/login"
            className="mobile-auth-button"
            onClick={closeMenu}
          >
            Login / Sign Up
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

// Component to conditionally render footer based on route
const ConditionalFooter = () => {
  const location = useLocation();

  // Hide footer for protected routes (farmer, HHM, worker, etc.)
  const hideFooterRoutes = ['/farmer', '/hhm', '/worker'];
  const shouldHideFooter = hideFooterRoutes.some(route =>
    location.pathname.startsWith(route)
  );

  if (shouldHideFooter) {
    return null;
  }

  return <Footer />;
};

function App() {
  console.log('App component rendering...');

  return (
    <Router>
      <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Conditional Navbar */}
        <ConditionalNavbar />

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

            {/* Debug Route - Temporary */}
            <Route path="/debug-factory-analysis" element={
              <SafeComponent name="FactoryAnalysisDebug">
                <FactoryAnalysisDebug />
              </SafeComponent>
            } />

            {/* Notification Test Route */}
            <Route path="/notification-test" element={
              <SafeComponent name="NotificationTestPage">
                <NotificationTestPage />
              </SafeComponent>
            } />

            {/* HHM Profile View Route - Accessible by any authenticated user */}
            <Route path="/hhm/profile/:hhmId" element={
              <SafeComponent name="ProtectedRoute">
                <ProtectedRoute />
              </SafeComponent>
            }>
              <Route index element={
                <SafeComponent name="HHMProfileViewPage">
                  <HHMProfileViewPage />
                </SafeComponent>
              } />
            </Route>

            {/* Factory Profile View Route - Accessible by any authenticated user */}
            <Route path="/factory/profile/:factoryId" element={
              <SafeComponent name="ProtectedRoute">
                <ProtectedRoute />
              </SafeComponent>
            }>
              <Route index element={
                <SafeComponent name="FactoryProfileViewPage">
                  <FactoryProfileViewPage />
                </SafeComponent>
              } />
            </Route>

            {/* Protected Farmer Routes */}
            <Route path="/farmer" element={
              <SafeComponent name="ProtectedRoute">
                <ProtectedRoute />
              </SafeComponent>
            }>
              <Route element={
                <SafeComponent name="AuthenticatedLayout">
                  <AuthenticatedLayout />
                </SafeComponent>
              }>
                <Route path="dashboard" element={
                  <SafeComponent name="FarmerDashboardPage">
                    <FarmerDashboardPage />
                  </SafeComponent>
                } />
                <Route path="marketplace" element={
                  <SafeComponent name="MarketplacePage">
                    <MarketplacePage />
                  </SafeComponent>
                } />
                <Route path="profile" element={
                  <SafeComponent name="ProfilePage">
                    <ProfilePage />
                  </SafeComponent>
                } />
                <Route path="hhm-directory" element={
                  <SafeComponent name="FarmerHHMDirectoryPage">
                    <FarmerHHMDirectoryPage />
                  </SafeComponent>
                } />
                <Route path="hhm-directory/:userId" element={
                  <SafeComponent name="UserProfilePage">
                    <UserProfilePage />
                  </SafeComponent>
                } />
                <Route path="hhms" element={
                  <SafeComponent name="FarmerHHMDirectoryPage">
                    <FarmerHHMDirectoryPage />
                  </SafeComponent>
                } />
                <Route path="factory-directory" element={
                  <SafeComponent name="FarmerFactoryDirectoryPage">
                    <FarmerFactoryDirectoryPage />
                  </SafeComponent>
                } />
                <Route path="factory-directory/:userId" element={
                  <SafeComponent name="UserProfilePage">
                    <UserProfilePage />
                  </SafeComponent>
                } />
                <Route path="factory/profile/:id" element={
                  <SafeComponent name="FarmerProfileViewPage">
                    <FarmerProfileViewPage />
                  </SafeComponent>
                } />
                <Route path="hhm/public-profile/:id" element={
                  <SafeComponent name="HHMPublicProfilePage">
                    <HHMPublicProfilePage />
                  </SafeComponent>
                } />
                <Route path="hhms/:hhmId/contract" element={
                  <SafeComponent name="FarmerContractRequestPage">
                    <FarmerContractRequestPage />
                  </SafeComponent>
                } />
                <Route path="contracts" element={
                  <SafeComponent name="FarmerContractsDashboard">
                    <FarmerContractsDashboard />
                  </SafeComponent>
                } />
                <Route path="factory-analysis" element={
                  <SafeComponent name="FactoryAnalysisPage">
                    <FactoryAnalysisPage />
                  </SafeComponent>
                } />
                <Route path="profile/:farmerId" element={
                  <SafeComponent name="FarmerPublicProfilePage">
                    <FarmerPublicProfilePage />
                  </SafeComponent>
                } />
                <Route path="listing/:listingId" element={
                  <SafeComponent name="ListingDetailsPage">
                    <ListingDetailsPage />
                  </SafeComponent>
                } />
                <Route path="listing/:listingId/farmer/:userId" element={
                  <SafeComponent name="UserProfilePage">
                    <UserProfilePage />
                  </SafeComponent>
                } />
                <Route index element={
                  <SafeComponent name="FarmerDashboardPage">
                    <FarmerDashboardPage />
                  </SafeComponent>
                } />
              </Route>
            </Route>

            {/* Protected HHM Routes */}
            <Route path="/hhm" element={
              <SafeComponent name="ProtectedRoute">
                <ProtectedRoute />
              </SafeComponent>
            }>
              <Route element={
                <SafeComponent name="AuthenticatedLayout">
                  <AuthenticatedLayout />
                </SafeComponent>
              }>
                <Route path="dashboard" element={
                  <SafeComponent name="HHMDashboardPage">
                    <HHMDashboardPage />
                  </SafeComponent>
                } />
                <Route path="labor" element={
                  <SafeComponent name="LaborManagementPage">
                    <LaborManagementPage />
                  </SafeComponent>
                } />
                <Route path="profile" element={
                  <SafeComponent name="ProfilePage">
                    <ProfilePage />
                  </SafeComponent>
                } />
                <Route path="factory-directory" element={
                  <SafeComponent name="HHMFactoryDirectoryPage">
                    <HHMFactoryDirectoryPage />
                  </SafeComponent>
                } />
                <Route path="factory-directory/:userId" element={
                  <SafeComponent name="UserProfilePage">
                    <UserProfilePage />
                  </SafeComponent>
                } />
                <Route path="factories" element={
                  <SafeComponent name="HHMFactoryDirectoryPage">
                    <HHMFactoryDirectoryPage />
                  </SafeComponent>
                } />
                <Route path="factories/:id" element={
                  <SafeComponent name="HHMSpecificFactoryPage">
                    <HHMSpecificFactoryPage />
                  </SafeComponent>
                } />
                <Route path="factory-invitations" element={
                  <SafeComponent name="HHMFactoryInvitationsPage">
                    <HHMFactoryInvitationsPage />
                  </SafeComponent>
                } />
                <Route path="sent-factory-invitations" element={
                  <SafeComponent name="HHMSentFactoryInvitationsPage">
                    <HHMSentFactoryInvitationsPage />
                  </SafeComponent>
                } />
                <Route path="associated-factories" element={
                  <SafeComponent name="HHMAssociatedFactoriesPage">
                    <HHMAssociatedFactoriesPage />
                  </SafeComponent>
                } />
                <Route path="performance" element={
                  <SafeComponent name="HHMPerformancePage">
                    <HHMPerformancePage />
                  </SafeComponent>
                } />
                <Route path="notifications" element={
                  <SafeComponent name="HHMNotificationCenter">
                    <HHMNotificationCenter />
                  </SafeComponent>
                } />
                <Route path="contracts" element={
                  <SafeComponent name="HHMContractDashboard">
                    <HHMContractDashboard />
                  </SafeComponent>
                } />
                <Route path="farmers" element={
                  <SafeComponent name="HHMFarmerDirectoryPage">
                    <HHMFarmerDirectoryPage />
                  </SafeComponent>
                } />
                <Route path="farmers/:userId" element={
                  <SafeComponent name="UserProfilePage">
                    <UserProfilePage />
                  </SafeComponent>
                } />
                <Route path="farmer/profile/:id" element={
                  <SafeComponent name="HHMFarmerProfilePage">
                    <HHMFarmerProfilePage />
                  </SafeComponent>
                } />
                <Route index element={
                  <SafeComponent name="HHMDashboardPage">
                    <HHMDashboardPage />
                  </SafeComponent>
                } />
              </Route>
            </Route>

            {/* Protected Worker Routes */}
            <Route path="/worker" element={
              <SafeComponent name="ProtectedRoute">
                <ProtectedRoute />
              </SafeComponent>
            }>
              <Route element={
                <SafeComponent name="AuthenticatedLayout">
                  <AuthenticatedLayout />
                </SafeComponent>
              }>
                <Route path="dashboard" element={
                  <SafeComponent name="WorkerDashboardPage">
                    <WorkerDashboardPage />
                  </SafeComponent>
                } />
                <Route path="jobs" element={
                  <SafeComponent name="WorkerDashboardPage">
                    <WorkerDashboardPage />
                  </SafeComponent>
                } />
                <Route path="applications" element={
                  <SafeComponent name="InvitesAndApplicationsPage">
                    <InvitesAndApplicationsPage />
                  </SafeComponent>
                } />
                <Route path="hhm-directory" element={
                  <SafeComponent name="WorkerHHMDirectoryPage">
                    <WorkerHHMDirectoryPage />
                  </SafeComponent>
                } />
                <Route path="hhm-directory/:userId" element={
                  <SafeComponent name="UserProfilePage">
                    <UserProfilePage />
                  </SafeComponent>
                } />
                <Route path="hhm/profile/:id" element={
                  <SafeComponent name="WorkerHHMProfileViewPage">
                    <WorkerHHMProfileViewPage />
                  </SafeComponent>
                } />
                <Route path="profile" element={
                  <SafeComponent name="ProfilePage">
                    <ProfilePage />
                  </SafeComponent>
                } />
                <Route index element={
                  <SafeComponent name="WorkerDashboardPage">
                    <WorkerDashboardPage />
                  </SafeComponent>
                } />
              </Route>
            </Route>

            {/* Protected Factory Routes */}
            <Route path="/factory" element={
              <SafeComponent name="ProtectedRoute">
                <ProtectedRoute />
              </SafeComponent>
            }>
              <Route element={
                <SafeComponent name="AuthenticatedLayout">
                  <AuthenticatedLayout />
                </SafeComponent>
              }>
                <Route path="dashboard" element={
                  <SafeComponent name="FactoryDashboardPage">
                    <FactoryDashboardPage />
                  </SafeComponent>
                } />
                <Route path="hhm-directory" element={
                  <SafeComponent name="FactoryHHMDirectoryPage">
                    <FactoryHHMDirectoryPage />
                  </SafeComponent>
                } />
                <Route path="hhm-directory/:userId" element={
                  <SafeComponent name="UserProfilePage">
                    <UserProfilePage />
                  </SafeComponent>
                } />
                <Route path="hhm/profile/:id" element={
                  <SafeComponent name="FactoryHHMProfileViewPage">
                    <FactoryHHMProfileViewPage />
                  </SafeComponent>
                } />
                <Route path="hhm-profile/:id" element={
                  <SafeComponent name="HHMPublicProfilePage">
                    <HHMPublicProfilePage />
                  </SafeComponent>
                } />
                <Route path="sent-invitations" element={
                  <SafeComponent name="FactorySentInvitationsPage">
                    <FactorySentInvitationsPage />
                  </SafeComponent>
                } />
                <Route path="received-invitations" element={
                  <SafeComponent name="FactoryReceivedInvitationsPage">
                    <FactoryReceivedInvitationsPage />
                  </SafeComponent>
                } />
                <Route path="associated-hhms" element={
                  <SafeComponent name="FactoryAssociatedHHMsPage">
                    <FactoryAssociatedHHMsPage />
                  </SafeComponent>
                } />
                <Route path="associated-hhms/:userId" element={
                  <SafeComponent name="UserProfilePage">
                    <UserProfilePage />
                  </SafeComponent>
                } />
                <Route path="profile" element={
                  <SafeComponent name="ProfilePage">
                    <ProfilePage />
                  </SafeComponent>
                } />
                <Route path="factory-directory" element={
                  <SafeComponent name="FactoryDirectoryPage">
                    <FactoryDirectoryPage />
                  </SafeComponent>
                } />
                <Route path="factory-directory/:id" element={
                  <SafeComponent name="FactoryProfilePage">
                    <FactoryProfilePage />
                  </SafeComponent>
                } />
                <Route path="contracts" element={
                  <SafeComponent name="ContractsDashboard">
                    <ContractsDashboard />
                  </SafeComponent>
                } />
                <Route index element={
                  <SafeComponent name="FactoryDashboardPage">
                    <FactoryDashboardPage />
                  </SafeComponent>
                } />
              </Route>
            </Route>

            {/* Unauthorized page */}
            <Route path="/unauthorized" element={
              <div style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                color: 'white',
                minHeight: '60vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <h1 style={{ fontSize: '3rem', margin: '0' }}>🚫</h1>
                <h2 style={{ fontSize: '2rem', margin: '1rem 0' }}>Access Denied</h2>
                <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
                  You don't have permission to access this page.
                </p>
                <a
                  href="/"
                  style={{
                    background: '#27ae60',
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
            } />

            {/* Catch-all route for 404 pages */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Conditional Footer */}
        <ConditionalFooter />
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