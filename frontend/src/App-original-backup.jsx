// Backup of current App.jsx before modifications
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import FarmerDashboardLayout from './components/FarmerDashboardLayout';
import HomePage from './pages/HomePage';
import FactoriesPage from './pages/FactoriesPage';
import SpecificFactoryPage from './pages/SpecificFactoryPage';
import AboutUsPage from './pages/AboutUsPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import FarmerDashboardPage from './pages/FarmerDashboardPage';
import MarketplacePage from './pages/MarketplacePage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navbar is always displayed */}
        <Navbar />
        
        {/* Main content area */}
        <main className="main-content">
          <Routes>
            {/* Home Route - Back to Main HomePage */}
            <Route path="/" element={<HomePage />} />
            
            {/* Factories Routes */}
            <Route path="/factories" element={<FactoriesPage />} />
            <Route path="/factory/:id" element={<SpecificFactoryPage />} />
            
            {/* About Route */}
            <Route path="/about" element={<AboutUsPage />} />
            
            {/* Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            
            {/* Protected Farmer Routes */}
            <Route path="/farmer" element={<ProtectedRoute />}>
              <Route path="/" element={<FarmerDashboardLayout />}>
                <Route path="dashboard" element={<FarmerDashboardPage />} />
                <Route path="marketplace" element={<MarketplacePage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route index element={<FarmerDashboardPage />} />
              </Route>
            </Route>
            
            {/* Catch-all route for 404 pages */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        {/* Optional Footer */}
        <Footer />
      </div>
    </Router>
  );
}

// 404 Not Found Component
const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Page Not Found</h2>
        <p className="not-found-text">
          The page you're looking for doesn't exist.
        </p>
        <a 
          href="/" 
          className="not-found-button"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
};

// Simple Footer Component
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <p className="footer-copyright">
            &copy; 2025 Sugarcane Platform. All rights reserved.
          </p>
          <div className="footer-links">
            <a 
              href="/about" 
              className="footer-link"
            >
              About
            </a>
            <a 
              href="/contact" 
              className="footer-link"
            >
              Contact
            </a>
            <a 
              href="/privacy" 
              className="footer-link"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default App;