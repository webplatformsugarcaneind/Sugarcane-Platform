import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import { getStoredToken, getStoredUser, getDashboardRouteForRole, clearAuthSession } from '../utils/authSession.js';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to check authentication state
  const checkAuthState = () => {
    console.log('🔍 ==> NAVBAR: Starting auth state check...');

    const token = getStoredToken();
    const user = getStoredUser();

    const isAuth = !!token;
    setIsAuthenticated(isAuth);
    console.log('🔍 ==> NAVBAR: Set isAuthenticated to:', isAuth);

    if (isAuth && user) {
      console.log('✅ ==> NAVBAR: User authenticated as:', user.role);
      setUserRole(user.role);
    } else {
      console.log('🔍 ==> NAVBAR: No user authenticated');
      setUserRole(null);
    }

    console.log('🔍 ==> NAVBAR: Auth state check completed');
  };

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check for authentication token and user role on component mount and location changes
  useEffect(() => {
    checkAuthState();
  }, [location.pathname]);

  // Listen for storage changes (when login happens in another tab or programmatically)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user' || e.key === null) {
        console.log('🔄 Storage changed, rechecking auth state');
        checkAuthState();
      }
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (for same-tab updates)
    const handleAuthUpdate = () => {
      console.log('🔄 Auth update event received');
      checkAuthState();
    };

    window.addEventListener('authUpdate', handleAuthUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authUpdate', handleAuthUpdate);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    console.log('🔓 Logging out...');

    // Use centralized session clearing
    clearAuthSession();

    setIsAuthenticated(false);
    setUserRole(null);
    closeMenu();

    // Dispatch custom event to notify other components of authentication change
    window.dispatchEvent(new CustomEvent('authUpdate'));

    console.log('✅ Logout complete, redirecting to home');
    navigate('/');
  };

  // Debug log for render
  console.log('🎨 ==> NAVBAR RENDER: Current state values:', {
    isAuthenticated,
    userRole,
    location: location.pathname
  });

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo Section - Redirects to home if not authenticated, role dashboard if authenticated */}
        <div className="navbar-logo">
          <NavLink
            to={isAuthenticated && userRole ? getDashboardRouteForRole(userRole) : "/"}
            className="logo-link"
            onClick={closeMenu}
          >
            <span className="logo-icon">✦</span>
            <span className="logo-text">CaneSetu</span>
          </NavLink>
        </div>

        {/* Desktop Navigation Menu */}
        <div className="navbar-menu">
          <ul className={`navbar-nav ${userRole === 'Farmer' ? 'farmer-nav' : ''}`}>
            {!isAuthenticated ? (
              // Public navigation links
              <>
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
              </>
            ) : (
              // Role-based authenticated navigation links
              <>
                {userRole === 'Farmer' && (
                  <>
                    <li>
                      <NavLink
                        to="/farmer/dashboard"
                        className={({ isActive }) =>
                          isActive ? 'nav-link active' : 'nav-link'
                        }
                        onClick={closeMenu}
                      >
                        Dashboard
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/farmer/marketplace"
                        className={({ isActive }) =>
                          isActive ? 'nav-link active' : 'nav-link'
                        }
                        onClick={closeMenu}
                      >
                        Marketplace
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/farmer/hhm-directory"
                        className={({ isActive }) =>
                          isActive ? 'nav-link active' : 'nav-link'
                        }
                        onClick={closeMenu}
                      >
                        HHMs
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/farmer/factory-directory"
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
                        to="/farmer/factory-analysis"
                        className={({ isActive }) =>
                          isActive ? 'nav-link active' : 'nav-link'
                        }
                        onClick={closeMenu}
                      >
                        📊 Factory Analysis
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/farmer/profile"
                        className={({ isActive }) =>
                          isActive ? 'nav-link active' : 'nav-link'
                        }
                        onClick={closeMenu}
                      >
                        Profile
                      </NavLink>
                    </li>
                  </>
                )}

                {userRole === 'HHM' && (
                  <>
                    <li>
                      <NavLink
                        to="/hhm/dashboard"
                        className={({ isActive }) =>
                          isActive ? 'nav-link active' : 'nav-link'
                        }
                        onClick={closeMenu}
                      >
                        Dashboard
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/hhm/labor"
                        className={({ isActive }) =>
                          isActive ? 'nav-link active' : 'nav-link'
                        }
                        onClick={closeMenu}
                      >
                        Labor Management
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/hhm/factories"
                        className={({ isActive }) =>
                          isActive ? 'nav-link active' : 'nav-link'
                        }
                        onClick={closeMenu}
                      >
                        Factory Directory
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/hhm/farmers"
                        className={({ isActive }) =>
                          isActive ? 'nav-link active' : 'nav-link'
                        }
                        onClick={closeMenu}
                      >
                        Farmers
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/hhm/profile"
                        className={({ isActive }) =>
                          isActive ? 'nav-link active' : 'nav-link'
                        }
                        onClick={closeMenu}
                      >
                        Profile
                      </NavLink>
                    </li>
                  </>
                )}

                {userRole === 'Labour' && (
                  <>
                    <li>
                      <NavLink
                        to="/worker/jobs"
                        className={({ isActive }) =>
                          isActive ? 'nav-link active' : 'nav-link'
                        }
                        onClick={closeMenu}
                      >
                        Dashbord
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/worker/applications"
                        className={({ isActive }) =>
                          isActive ? 'nav-link active' : 'nav-link'
                        }
                        onClick={closeMenu}
                      >
                        My Applications
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/worker/hhm-directory"
                        className={({ isActive }) =>
                          isActive ? 'nav-link active' : 'nav-link'
                        }
                        onClick={closeMenu}
                      >
                        HHM Directory
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/worker/profile"
                        className={({ isActive }) =>
                          isActive ? 'nav-link active' : 'nav-link'
                        }
                        onClick={closeMenu}
                      >
                        Profile
                      </NavLink>
                    </li>
                  </>
                )}

                {userRole === 'Factory' && (
                  <>
                    {console.log('🏭 RENDERING FACTORY NAVIGATION')}
                    <li>
                      <NavLink
                        to="/factory/dashboard"
                        className={({ isActive }) =>
                          isActive ? 'nav-link active' : 'nav-link'
                        }
                        onClick={closeMenu}
                      >
                        Dashboard
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/factory/hhm-directory"
                        className={({ isActive }) =>
                          isActive ? 'nav-link active' : 'nav-link'
                        }
                        onClick={closeMenu}
                      >
                        HHM Directory
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/factory/factory-directory"
                        className={({ isActive }) =>
                          isActive ? 'nav-link active' : 'nav-link'
                        }
                        onClick={closeMenu}
                      >
                        Factory Network
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/factory/profile"
                        className={({ isActive }) =>
                          isActive ? 'nav-link active' : 'nav-link'
                        }
                        onClick={closeMenu}
                      >
                        Profile
                      </NavLink>
                    </li>
                  </>
                )}
              </>
            )}
          </ul>

          {/* Auth Button */}
          <div className="navbar-auth">
            {!isAuthenticated ? (
              <NavLink
                to="/login"
                className="auth-button"
                onClick={closeMenu}
              >
                Login / Sign Up
              </NavLink>
            ) : (
              <button
                className="auth-button logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}
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
          {!isAuthenticated ? (
            // Public mobile navigation links
            <>
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
            </>
          ) : (
            // Role-based authenticated mobile navigation links
            <>
              {userRole === 'Farmer' && (
                <>
                  <NavLink
                    to="/farmer/dashboard"
                    className={({ isActive }) =>
                      isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                    }
                    onClick={closeMenu}
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/farmer/marketplace"
                    className={({ isActive }) =>
                      isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                    }
                    onClick={closeMenu}
                  >
                    Marketplace
                  </NavLink>
                  <NavLink
                    to="/farmer/hhm-directory"
                    className={({ isActive }) =>
                      isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                    }
                    onClick={closeMenu}
                  >
                    HHMs
                  </NavLink>
                  <NavLink
                    to="/farmer/factory-directory"
                    className={({ isActive }) =>
                      isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                    }
                    onClick={closeMenu}
                  >
                    Factories
                  </NavLink>
                  <NavLink
                    to="/farmer/factory-analysis"
                    className={({ isActive }) =>
                      isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                    }
                    onClick={closeMenu}
                  >
                    📊 Factory Analysis
                  </NavLink>
                  <NavLink
                    to="/farmer/profile"
                    className={({ isActive }) =>
                      isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                    }
                    onClick={closeMenu}
                  >
                    Profile
                  </NavLink>
                </>
              )}

              {userRole === 'HHM' && (
                <>
                  <NavLink
                    to="/hhm/dashboard"
                    className={({ isActive }) =>
                      isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                    }
                    onClick={closeMenu}
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/hhm/labor"
                    className={({ isActive }) =>
                      isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                    }
                    onClick={closeMenu}
                  >
                    Labor Management
                  </NavLink>
                  <NavLink
                    to="/hhm/factories"
                    className={({ isActive }) =>
                      isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                    }
                    onClick={closeMenu}
                  >
                    Factory Directory
                  </NavLink>
                  <NavLink
                    to="/hhm/profile"
                    className={({ isActive }) =>
                      isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                    }
                    onClick={closeMenu}
                  >
                    Profile
                  </NavLink>
                </>
              )}

              {userRole === 'Labour' && (
                <>
                  <NavLink
                    to="/worker/jobs"
                    className={({ isActive }) =>
                      isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                    }
                    onClick={closeMenu}
                  >
                    Available Jobs
                  </NavLink>
                  <NavLink
                    to="/worker/applications"
                    className={({ isActive }) =>
                      isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                    }
                    onClick={closeMenu}
                  >
                    My Applications
                  </NavLink>
                  <NavLink
                    to="/worker/hhm-directory"
                    className={({ isActive }) =>
                      isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                    }
                    onClick={closeMenu}
                  >
                    HHM Directory
                  </NavLink>
                  <NavLink
                    to="/worker/profile"
                    className={({ isActive }) =>
                      isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                    }
                    onClick={closeMenu}
                  >
                    Profile
                  </NavLink>
                </>
              )}

              {userRole === 'Factory' && (
                <>
                  {console.log('🏭 RENDERING MOBILE FACTORY NAVIGATION')}
                  <NavLink
                    to="/factory/dashboard"
                    className={({ isActive }) =>
                      isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                    }
                    onClick={closeMenu}
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/factory/hhm-directory"
                    className={({ isActive }) =>
                      isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                    }
                    onClick={closeMenu}
                  >
                    HHM Directory
                  </NavLink>
                  <NavLink
                    to="/factory/factory-directory"
                    className={({ isActive }) =>
                      isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                    }
                    onClick={closeMenu}
                  >
                    Factory Network
                  </NavLink>
                  <NavLink
                    to="/factory/profile"
                    className={({ isActive }) =>
                      isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                    }
                    onClick={closeMenu}
                  >
                    Profile
                  </NavLink>
                </>
              )}

              <button
                className="mobile-auth-button logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;