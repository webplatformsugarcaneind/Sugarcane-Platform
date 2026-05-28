import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import LanguageSelector from './LanguageSelector.jsx';
import './Navbar.css';
import { getStoredToken, getStoredUser, getDashboardRouteForRole, clearAuthSession } from '../utils/authSession.js';

/* ── Inline SVG Icons ─────────────────────────────────────────────────── */
const Ico = {
  /* Logo mark – diamond spark */
  Logo: () => (
    <svg viewBox="0 0 20 20" fill="currentColor" style={{width:'1em',height:'1em'}}>
      <path d="M10 1l2.39 6.61L19 10l-6.61 2.39L10 19l-2.39-6.61L1 10l6.61-2.39z"/>
    </svg>
  ),
  /* Dashboard – grid */
  Dashboard: () => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{width:'1em',height:'1em'}}>
      <rect x="2" y="2" width="7" height="7" rx="1.5"/>
      <rect x="11" y="2" width="7" height="7" rx="1.5"/>
      <rect x="2" y="11" width="7" height="7" rx="1.5"/>
      <rect x="11" y="11" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  /* Marketplace – tag */
  Marketplace: () => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{width:'1em',height:'1em'}}>
      <path d="M3 3h5l8.5 8.5a2.12 2.12 0 010 3L13 18a2.12 2.12 0 01-3 0L2 9.5V3z"/>
      <circle cx="7" cy="7" r="1" fill="currentColor" stroke="none"/>
    </svg>
  ),
  /* HHMs / Labour – users */
  Users: () => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{width:'1em',height:'1em'}}>
      <circle cx="7" cy="6" r="3"/>
      <path d="M1 18c0-3.31 2.69-6 6-6s6 2.69 6 6"/>
      <path d="M14 9a3 3 0 010-6M19 18c0-3.31-1.34-6-3-6"/>
    </svg>
  ),
  /* Factory / Factories */
  Factory: () => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{width:'1em',height:'1em'}}>
      <path d="M2 18V8l5-3v3l5-3v3l5-3v13H2z"/>
      <rect x="7" y="13" width="2" height="5"/>
      <rect x="11" y="13" width="2" height="5"/>
    </svg>
  ),
  /* Factory Analysis – bar chart */
  Analysis: () => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{width:'1em',height:'1em'}}>
      <line x1="2" y1="18" x2="18" y2="18"/>
      <rect x="3" y="10" width="3" height="8" rx="1"/>
      <rect x="8.5" y="5" width="3" height="13" rx="1"/>
      <rect x="14" y="1" width="3" height="17" rx="1"/>
    </svg>
  ),
  /* Profile – person */
  Profile: () => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{width:'1em',height:'1em'}}>
      <circle cx="10" cy="6" r="4"/>
      <path d="M2 19c0-4.42 3.58-8 8-8s8 3.58 8 8"/>
    </svg>
  ),
  /* Home */
  Home: () => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{width:'1em',height:'1em'}}>
      <path d="M3 9.5L10 3l7 6.5V18a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
      <polyline points="7.5 19 7.5 12 12.5 12 12.5 19"/>
    </svg>
  ),
  /* About */
  About: () => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{width:'1em',height:'1em'}}>
      <circle cx="10" cy="10" r="8"/>
      <line x1="10" y1="9" x2="10" y2="14"/>
      <circle cx="10" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  ),
  /* Applications / briefcase */
  Applications: () => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{width:'1em',height:'1em'}}>
      <rect x="2" y="7" width="16" height="11" rx="2"/>
      <path d="M6 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/>
    </svg>
  ),
  /* Labour management – list */
  Labour: () => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{width:'1em',height:'1em'}}>
      <line x1="3" y1="5" x2="17" y2="5"/>
      <line x1="3" y1="10" x2="17" y2="10"/>
      <line x1="3" y1="15" x2="17" y2="15"/>
      <circle cx="17" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="1.6"/>
      <line x1="15.88" y1="8.88" x2="18.12" y2="11.12"/>
    </svg>
  ),
  /* Network / Factory Network */
  Network: () => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{width:'1em',height:'1em'}}>
      <circle cx="10" cy="10" r="2"/>
      <circle cx="3" cy="5" r="2"/>
      <circle cx="17" cy="5" r="2"/>
      <circle cx="3" cy="15" r="2"/>
      <circle cx="17" cy="15" r="2"/>
      <line x1="5" y1="5" x2="8" y2="9"/>
      <line x1="15" y1="5" x2="12" y2="9"/>
      <line x1="5" y1="15" x2="8" y2="11"/>
      <line x1="15" y1="15" x2="12" y2="11"/>
    </svg>
  ),
  /* Login */
  Login: () => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{width:'1em',height:'1em'}}>
      <path d="M13 3h4a1 1 0 011 1v12a1 1 0 01-1 1h-4"/>
      <polyline points="9 14 13 10 9 6"/>
      <line x1="3" y1="10" x2="13" y2="10"/>
    </svg>
  ),
  /* Logout */
  Logout: () => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{width:'1em',height:'1em'}}>
      <path d="M7 3H4a1 1 0 00-1 1v12a1 1 0 001 1h3"/>
      <polyline points="11 14 15 10 11 6"/>
      <line x1="15" y1="10" x2="5" y2="10"/>
    </svg>
  ),
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuthState = () => {
    const token = getStoredToken();
    const user = getStoredUser();
    const isAuth = !!token;
    setIsAuthenticated(isAuth);
    if (isAuth && user) {
      setUserRole(user.role);
    } else {
      setUserRole(null);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    checkAuthState();
  }, [location.pathname]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user' || e.key === null) checkAuthState();
    };
    const handleAuthUpdate = () => checkAuthState();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authUpdate', handleAuthUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authUpdate', handleAuthUpdate);
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu  = () => setIsMenuOpen(false);

  const handleLogout = () => {
    clearAuthSession();
    setIsAuthenticated(false);
    setUserRole(null);
    closeMenu();
    window.dispatchEvent(new CustomEvent('authUpdate'));
    navigate('/');
  };

  /* ── helper to render a desktop nav item ── */
  const NavItem = ({ to, icon: Icon, children }) => (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        onClick={closeMenu}
      >
        <Icon />
        {children}
      </NavLink>
    </li>
  );

  /* ── helper to render a mobile nav item ── */
  const MobileNavItem = ({ to, icon: Icon, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) => isActive ? 'mobile-nav-link active' : 'mobile-nav-link'}
      onClick={closeMenu}
    >
      <Icon />
      {children}
    </NavLink>
  );

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="navbar-container">

        {/* Logo */}
        <div className="navbar-logo">
          <NavLink
            to={isAuthenticated && userRole ? getDashboardRouteForRole(userRole) : '/'}
            className="logo-link"
            onClick={closeMenu}
          >
            <span className="logo-icon"><Ico.Logo /></span>
            <span className="logo-text notranslate">CaneSetu</span>
          </NavLink>
        </div>

        {/* Desktop Nav */}
        <div className="navbar-menu">
          <ul className={`navbar-nav ${userRole === 'Farmer' ? 'farmer-nav' : ''}`}>
            {!isAuthenticated ? (
              <>
              </>
            ) : (
              <>
                {userRole === 'Farmer' && (
                  <>
                    <NavItem to="/farmer/dashboard"        icon={Ico.Dashboard}>Dashboard</NavItem>
                    <NavItem to="/farmer/marketplace"      icon={Ico.Marketplace}>Marketplace</NavItem>
                    <NavItem to="/farmer/hhm-directory"    icon={Ico.Users}>HHMs</NavItem>
                    <NavItem to="/farmer/factory-directory" icon={Ico.Factory}>Factories</NavItem>
                    <NavItem to="/farmer/factory-analysis"  icon={Ico.Analysis}>Factory Analysis</NavItem>
                    <NavItem to="/farmer/profile"          icon={Ico.Profile}>Profile</NavItem>
                  </>
                )}
                {userRole === 'HHM' && (
                  <>
                    <NavItem to="/hhm/dashboard"  icon={Ico.Dashboard}>Dashboard</NavItem>
                    <NavItem to="/hhm/labor"      icon={Ico.Labour}>Labour Management</NavItem>
                    <NavItem to="/hhm/factories"  icon={Ico.Factory}>Factory Directory</NavItem>
                    <NavItem to="/hhm/farmers"    icon={Ico.Users}>Farmers</NavItem>
                    <NavItem to="/hhm/profile"    icon={Ico.Profile}>Profile</NavItem>
                  </>
                )}
                {userRole === 'Labour' && (
                  <>
                    <NavItem to="/labour/jobs"          icon={Ico.Dashboard}>Dashboard</NavItem>
                    <NavItem to="/labour/applications"  icon={Ico.Applications}>My Applications</NavItem>
                    <NavItem to="/labour/hhm-directory" icon={Ico.Users}>HHM Directory</NavItem>
                    <NavItem to="/labour/profile"       icon={Ico.Profile}>Profile</NavItem>
                  </>
                )}
                {userRole === 'Factory' && (
                  <>
                    <NavItem to="/factory/dashboard"         icon={Ico.Dashboard}>Dashboard</NavItem>
                    <NavItem to="/factory/hhm-directory"     icon={Ico.Users}>HHM Directory</NavItem>
                    <NavItem to="/factory/factory-directory" icon={Ico.Network}>Factory Network</NavItem>
                    <NavItem to="/factory/profile"           icon={Ico.Profile}>Profile</NavItem>
                  </>
                )}
              </>
            )}
          </ul>


          {/* Language Switcher */}
          <LanguageSelector />

          {/* Auth Button */}
          <div className="navbar-auth">
            {!isAuthenticated ? (
              <NavLink to="/login" className="auth-button" onClick={closeMenu}>
                <Ico.Login /> Login / Sign Up
              </NavLink>
            ) : (
              <button className="auth-button logout-button" onClick={handleLogout}>
                <Ico.Logout /> Logout
              </button>
            )}
          </div>
        </div>

        {/* Hamburger */}
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

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-content">
          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className="mobile-auth-button" onClick={closeMenu}>
                <Ico.Login /> Login / Sign Up
              </NavLink>
            </>
          ) : (
            <>
              {userRole === 'Farmer' && (
                <>
                  <MobileNavItem to="/farmer/dashboard"         icon={Ico.Dashboard}>Dashboard</MobileNavItem>
                  <MobileNavItem to="/farmer/marketplace"       icon={Ico.Marketplace}>Marketplace</MobileNavItem>
                  <MobileNavItem to="/farmer/hhm-directory"     icon={Ico.Users}>HHMs</MobileNavItem>
                  <MobileNavItem to="/farmer/factory-directory" icon={Ico.Factory}>Factories</MobileNavItem>
                  <MobileNavItem to="/farmer/factory-analysis"  icon={Ico.Analysis}>Factory Analysis</MobileNavItem>
                  <MobileNavItem to="/farmer/profile"           icon={Ico.Profile}>Profile</MobileNavItem>
                </>
              )}
              {userRole === 'HHM' && (
                <>
                  <MobileNavItem to="/hhm/dashboard"  icon={Ico.Dashboard}>Dashboard</MobileNavItem>
                  <MobileNavItem to="/hhm/labor"      icon={Ico.Labour}>Labour Management</MobileNavItem>
                  <MobileNavItem to="/hhm/factories"  icon={Ico.Factory}>Factory Directory</MobileNavItem>
                  <MobileNavItem to="/hhm/farmers"    icon={Ico.Users}>Farmers</MobileNavItem>
                  <MobileNavItem to="/hhm/profile"    icon={Ico.Profile}>Profile</MobileNavItem>
                </>
              )}
              {userRole === 'Labour' && (
                <>
                  <MobileNavItem to="/labour/jobs"          icon={Ico.Dashboard}>Dashboard</MobileNavItem>
                  <MobileNavItem to="/labour/applications"  icon={Ico.Applications}>My Applications</MobileNavItem>
                  <MobileNavItem to="/labour/hhm-directory" icon={Ico.Users}>HHM Directory</MobileNavItem>
                  <MobileNavItem to="/labour/profile"       icon={Ico.Profile}>Profile</MobileNavItem>
                </>
              )}
              {userRole === 'Factory' && (
                <>
                  <MobileNavItem to="/factory/dashboard"         icon={Ico.Dashboard}>Dashboard</MobileNavItem>
                  <MobileNavItem to="/factory/hhm-directory"     icon={Ico.Users}>HHM Directory</MobileNavItem>
                  <MobileNavItem to="/factory/factory-directory" icon={Ico.Network}>Factory Network</MobileNavItem>
                  <MobileNavItem to="/factory/profile"           icon={Ico.Profile}>Profile</MobileNavItem>
                </>
              )}
              <button className="mobile-auth-button logout-button" onClick={handleLogout}>
                <Ico.Logout /> Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;