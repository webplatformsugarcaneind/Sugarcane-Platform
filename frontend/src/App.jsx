import React,
  {
  Suspense,
  useState
}

from 'react';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  NavLink,
  matchPath
}

from 'react-router-dom';
import './App.css';
import './components/Navbar.css';
import './pages/Auth.css';
import './components/Chatbot/Chatbot.css';
import TranslatorWidget from './components/TranslatorWidget.jsx';

import {
  getDashboardRouteForRole,
  getStoredUser,
  isAuthenticated
}

from './utils/authSession.js';

// Import components with proper ES6 imports
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RoleProtectedRoute from './components/RoleProtectedRoute.jsx';
import GuestRoute from './components/GuestRoute.jsx';
import AuthenticatedLayout from './components/AuthenticatedLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import UnauthorizedPage from './pages/UnauthorizedPage.jsx';


import FarmerDashboardPage from './pages/FarmerDashboardPage.jsx';

import MarketplacePage from './pages/MarketplacePage.jsx';

import ProfilePage from './pages/ProfilePage.jsx';
import FarmerProfile from './pages/FarmerProfile.jsx';

import FarmerHHMDirectoryPage from './pages/FarmerHHMDirectoryPage.jsx';

import FarmerFactoryDirectoryPage from './pages/FarmerFactoryDirectoryPage.jsx';

import AssociateHHMPage from './pages/AssociateHHMPage.jsx';

import HHMFactoryDirectoryPage from './pages/HHMFactoryDirectoryPage.jsx';

import HHMSpecificFactoryPage from './pages/HHMSpecificFactoryPage.jsx';
import HHMContractProposePage from './pages/HHMContractProposePage.jsx';

import FactoryDirectoryPage from './pages/FactoryDirectoryPage.jsx';

import FactoryProfilePage from './pages/FactoryProfilePage.jsx';

import HHMDashboardPage from './pages/HHMDashboardPage.jsx';

import HHMFactoryInvitationsPage from './pages/HHMFactoryInvitationsPage.jsx';

import HHMSentFactoryInvitationsPage from './pages/HHMSentFactoryInvitationsPage.jsx';

import HHMAssociatedFactoriesPage from './pages/HHMAssociatedFactoriesPage.jsx';

import HHMPerformancePage from './pages/HHMPerformancePage.jsx';

import HHMNotificationCenter from './pages/HHMNotificationCenter.jsx';

import NotificationTestPage from './pages/NotificationTestPage.jsx';

import LabourManagementPage from './pages/LabourManagementPage.jsx';

import LabourDashboardPage from './pages/LabourDashboardPage.jsx';

import LabourHHMDirectoryPage from './pages/LabourHHMDirectoryPage.jsx';

import AvailableJobsPage from './pages/AvailableJobsPage.jsx';

import MyApplicationsPage from './pages/MyApplicationsPage.jsx';

import InvitesAndApplicationsPage from './pages/InvitesAndApplicationsPage.jsx';
import InvitationDetailsPage from './pages/InvitationDetailsPage.jsx';

import FactoryDashboardPage from './pages/FactoryDashboardPage.jsx';
import FactoryPostBillPage from './pages/FactoryPostBillPage.jsx';

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

import EditListingPage from './pages/EditListingPage.jsx';
import SendInquiryPage from './pages/SendInquiryPage.jsx';

import FarmerProfileViewPage from './pages/FarmerProfileViewPage.jsx';

import LabourHHMProfileViewPage from './pages/LabourHHMProfileViewPage.jsx';

import HHMLabourProfileViewPage from './pages/HHMLabourProfileViewPage.jsx';

import FactoryHHMProfileViewPage from './pages/FactoryHHMProfileViewPage.jsx';

import UserProfilePage from './pages/UserProfilePage.jsx';
import CreateListingPage from './pages/CreateListingPage.jsx';

// Error Boundary Component

class ErrorBoundary extends React.Component {

  constructor(props) {

    super(props);

    this.state= {
      hasError: false, error: null
    }

    ;

  }

  static getDerivedStateFromError(error) {

    return {
      hasError: true, error
    }

    ;

  }

  componentDidCatch(error, errorInfo) {

    console.error(`Error in $ {
        this.props.componentName
      }

      :`, error, errorInfo);

  }

  render() {

    if (this.state.hasError) {

      return (<div style= {
            {

            padding: '1rem',

            margin: '1rem',

            border: '2px solid #ff6b6b',

            borderRadius: '8px',

            background: '#ffe0e0'

          }
        }

        > <h3 style= {
            {
            color: '#d63031'
          }
        }

        >Error in {
          this.props.componentName
        }

        </h3> <p style= {
            {
            color: '#636e72'
          }
        }

        > {
          this.state.error?.message || 'Unknown error occurred'
        }

        </p> </div>);

    }

    return this.props.children;

  }

}

// Safe component wrapper

const SafeComponent=( {
    name, children
  }

)=>(<ErrorBoundary componentName= {
    name
  }

  > <Suspense fallback= {
    <div style= {
        {
        padding: '1rem'
      }
    }

    >Loading {
      name
    }

    ...</div>
  }

  > {
    children
  }

  </Suspense> </ErrorBoundary>);

console.log('All components imported successfully');

// Component to conditionally render navbar based on route

const ConditionalNavbar=()=> {
  const location=useLocation();

  // Pages that render their own internal/immersive navigation
  const pagesWithInternalNav=['/',
  '/signup'];

  const knownRoutePatterns=[ '/',
  '/login',
  '/signup',
  '/unauthorized',
  '/about',
  '/factories',
  '/notification-test',
  '/debug-factory-analysis',
  '/factory/:id',
  '/hhm/profile/:hhmId',
  '/farmers',
  '/farmer/*',
  '/factory/*',
  '/hhm/*',
  '/labour/*'
  ];

  const isKnownRoute=knownRoutePatterns.some((pattern)=> matchPath( {
        path: pattern, end: pattern==='/'|| pattern==='/login'|| pattern==='/signup'|| pattern==='/unauthorized'|| pattern==='/about'|| pattern==='/factories'|| pattern==='/notification-test'|| pattern==='/debug-factory-analysis'
      }

      , location.pathname));

  if (pagesWithInternalNav.includes(location.pathname) || !isKnownRoute) {
    return null;
  }

  return (<SafeComponent name="Navbar"> <Navbar /> </SafeComponent>);
}

;

const Footer=()=>(<footer className="auth-footer"style= {
      {
      marginTop: 'auto'
    }
  }

  > <span className="auth-footer-copy">© 2025 CaneSetu Technologies Pvt. Ltd. All rights reserved.</span> <div className="auth-footer-links"> <a href="/about"onClick= {
    (e)=> e.preventDefault()
  }

  >About</a> <a href="#contact"onClick= {
    (e)=> e.preventDefault()
  }

  >Contact</a> <a href="#privacy"onClick= {
    (e)=> e.preventDefault()
  }

  >Privacy Policy</a> </div> </footer>);

const ConditionalFooter=()=> {
  const location=useLocation();
  // Only hide on home, login, and signup - those pages have their own footers
  const hideFooterRoutes=['/',
  '/login',
  '/signup'];

  const shouldHide=hideFooterRoutes.includes(location.pathname);

  return shouldHide ? null: <Footer />;
}

;

function App() {

  console.log('App component rendering...');

  return (<Router> <div className="App"style= {
        {
        minHeight: '100vh', display: 'flex', flexDirection: 'column'
      }
    }

    >
    <TranslatorWidget />
    {
      /* Conditional Navbar */
    }

    <ConditionalNavbar /> {
      /* Main content area */
    }

    <main className="main-content"style= {
        {
        flex: 1, display: 'flex', flexDirection: 'column', background: '#0b0f0b'
      }
    }

    > <Routes> {
      /* Home Route */
    }

    <Route path="/"element= {
      <SafeComponent name="HomePage"> <HomePage /> </SafeComponent>
    }

    /> {
      /* Authentication Routes - Protected from authenticated users */
    }

      {
      /* Login Route - Only accessible to guests (not authenticated users) */
    }

    <Route path="/login"element= {

      <SafeComponent name="GuestRoute"> <GuestRoute /> </SafeComponent>
    }

    > <Route index element= {

      <SafeComponent name="LoginPage"> <LoginPage /> </SafeComponent>
    }

    /> </Route> {
      /* Signup Route - Only accessible to guests (not authenticated users) */
    }

    <Route path="/signup"element= {

      <SafeComponent name="GuestRoute"> <GuestRoute /> </SafeComponent>
    }

    > <Route index element= {

      <SafeComponent name="SignUpPage"> <SignUpPage /> </SafeComponent>
    }

    /> </Route> {
      /* Unauthorized Route - Shown when user tries to access a route for a different role */
    }

    <Route path="/unauthorized"element= {

      <SafeComponent name="UnauthorizedPage"> <UnauthorizedPage /> </SafeComponent>
    }

    /> {
      /* Debug Route - Temporary */
    }

    <Route path="/debug-factory-analysis"element= {

      <SafeComponent name="FactoryAnalysisDebug"> <FactoryAnalysisDebug /> </SafeComponent>
    }

    /> {
      /* Notification Test Route */
    }

    <Route path="/notification-test"element= {

      <SafeComponent name="NotificationTestPage"> <NotificationTestPage /> </SafeComponent>
    }

    /> {
      /* HHM Profile View Route - Accessible by any authenticated user */
    }

    <Route path="/hhm/profile/:hhmId"element= {

      <SafeComponent name="ProtectedRoute"> <ProtectedRoute /> </SafeComponent>
    }

    > <Route index element= {

      <SafeComponent name="HHMProfileViewPage"> <HHMProfileViewPage /> </SafeComponent>
    }

    /> </Route> {
      /* Factory Profile View Route - Accessible by any authenticated user */
    }

    <Route path="/factory/profile/:factoryId"element= {

      <SafeComponent name="ProtectedRoute"> <ProtectedRoute /> </SafeComponent>
    }

    > <Route index element= {

      <SafeComponent name="FactoryProfileViewPage"> <FactoryProfileViewPage /> </SafeComponent>
    }

    /> </Route> {
      /* Protected Farmer Routes - Only Farmer role can access */
    }

    <Route path="/farmer"element= {

      <SafeComponent name="RoleProtectedRoute"> <RoleProtectedRoute allowedRoles= {
        ['Farmer']
      }

      /> </SafeComponent>
    }

    > <Route path="profile"element= {
      <SafeComponent name="FarmerProfile"> <FarmerProfile /> </SafeComponent>
    }

    /> <Route element= {

      <SafeComponent name="AuthenticatedLayout"> <AuthenticatedLayout /> </SafeComponent>
    }

    > <Route path="dashboard"element= {

      <SafeComponent name="FarmerDashboardPage"> <FarmerDashboardPage /> </SafeComponent>
    }

    /> <Route path="marketplace"element= {

      <SafeComponent name="MarketplacePage"> <MarketplacePage /> </SafeComponent>
    }

    /> <Route path="hhm-directory"element= {

      <SafeComponent name="FarmerHHMDirectoryPage"> <FarmerHHMDirectoryPage /> </SafeComponent>
    }

    /> <Route path="hhm-directory/:userId"element= {

      <SafeComponent name="UserProfilePage"> <UserProfilePage /> </SafeComponent>
    }

    /> <Route path="hhms"element= {

      <SafeComponent name="FarmerHHMDirectoryPage"> <FarmerHHMDirectoryPage /> </SafeComponent>
    }

    /> <Route path="factory-directory"element= {

      <SafeComponent name="FarmerFactoryDirectoryPage"> <FarmerFactoryDirectoryPage /> </SafeComponent>
    }

    /> <Route path="factory-directory/:userId"element= {

      <SafeComponent name="UserProfilePage"> <UserProfilePage /> </SafeComponent>
    }

    /> <Route path="associate-hhm/:factoryId"element= {

      <SafeComponent name="AssociateHHMPage"> <AssociateHHMPage /> </SafeComponent>
    }

    /> <Route path="factory/:id"element= {

      <SafeComponent name="FactoryProfileViewPage"> <FactoryProfileViewPage /> </SafeComponent>
    }

    /> <Route path="hhm/public-profile/:id"element= {

      <SafeComponent name="HHMPublicProfilePage"> <HHMPublicProfilePage /> </SafeComponent>
    }

    /> <Route path="hhms/:hhmId/contract"element= {

      <SafeComponent name="FarmerContractRequestPage"> <FarmerContractRequestPage /> </SafeComponent>
    }

    /> <Route path="contracts"element= {

      <SafeComponent name="FarmerContractsDashboard"> <FarmerContractsDashboard /> </SafeComponent>
    }

    /> <Route path="factory-analysis"element= {

      <SafeComponent name="FactoryAnalysisPage"> <FactoryAnalysisPage /> </SafeComponent>
    }

    /> <Route path="profile/:farmerId"element= {

      <SafeComponent name="FarmerPublicProfilePage"> <FarmerPublicProfilePage /> </SafeComponent>
    }

    /> <Route path="listing/:listingId"element= {

      <SafeComponent name="ListingDetailsPage"> <ListingDetailsPage /> </SafeComponent>
    }

    /> <Route path="listing/inquiry/:listingId"element= {

      <SafeComponent name="SendInquiryPage"> <SendInquiryPage /> </SafeComponent>
    }

    /> <Route path="listing/edit/:listingId"element= {

      <SafeComponent name="EditListingPage"> <EditListingPage /> </SafeComponent>
    }

    /> <Route path="listing/create"element= {
      <SafeComponent name="CreateListingPage"> <CreateListingPage /> </SafeComponent>
    }

    /> <Route path="listing/:listingId/farmer/:userId"element= {

      <SafeComponent name="UserProfilePage"> <UserProfilePage /> </SafeComponent>
    }

    /> <Route index element= {

      <SafeComponent name="FarmerDashboardPage"> <FarmerDashboardPage /> </SafeComponent>
    }

    /> </Route> </Route> {
      /* Protected HHM Routes - Only HHM role can access */
    }

    <Route path="/hhm"element= {
      <SafeComponent name="RoleProtectedRoute"> <RoleProtectedRoute allowedRoles= {
        ['HHM']
      }

      /> </SafeComponent>
    }

    > <Route path="profile"element= {
      <SafeComponent name="ProfilePage"> <ProfilePage /> </SafeComponent>
    }

    /> <Route element= {
      <SafeComponent name="AuthenticatedLayout"> <AuthenticatedLayout /> </SafeComponent>
    }

    > <Route path="dashboard"element= {

      <SafeComponent name="HHMDashboardPage"> <HHMDashboardPage /> </SafeComponent>
    }

    /> <Route path="labor"element= {

      <SafeComponent name="LabourManagementPage"> <LabourManagementPage /> </SafeComponent>
    }

    /> <Route path="labour/:labourId"element= {

      <SafeComponent name="HHMLabourProfileViewPage"> <HHMLabourProfileViewPage /> </SafeComponent>
    }

    /> <Route path="factory-directory"element= {

      <SafeComponent name="HHMFactoryDirectoryPage"> <HHMFactoryDirectoryPage /> </SafeComponent>
    }

    /> <Route path="factory-directory/:userId"element= {

      <SafeComponent name="UserProfilePage"> <UserProfilePage /> </SafeComponent>
    }

    /> <Route path="factories"element= {

      <SafeComponent name="HHMFactoryDirectoryPage"> <HHMFactoryDirectoryPage /> </SafeComponent>
    }

    /> <Route path="factories/:id" element={

      <SafeComponent name="HHMSpecificFactoryPage"> <HHMSpecificFactoryPage /> </SafeComponent>
    }

    /> <Route path="factories/:id/propose-contract" element={

      <SafeComponent name="HHMContractProposePage"> <HHMContractProposePage /> </SafeComponent>
    }

    /> <Route path="factory-invitations" element={

      <SafeComponent name="HHMFactoryInvitationsPage"> <HHMFactoryInvitationsPage /> </SafeComponent>
    }

    /> <Route path="sent-factory-invitations"element= {

      <SafeComponent name="HHMSentFactoryInvitationsPage"> <HHMSentFactoryInvitationsPage /> </SafeComponent>
    }

    /> <Route path="associated-factories"element= {
      <SafeComponent name="HHMAssociatedFactoriesPage"> <HHMAssociatedFactoriesPage /> </SafeComponent>
    }
    /> <Route path="associated-factories/:id"element= {
      <SafeComponent name="HHMSpecificFactoryPage"> <HHMSpecificFactoryPage /> </SafeComponent>
    }

    /> <Route path="performance"element= {

      <SafeComponent name="HHMPerformancePage"> <HHMPerformancePage /> </SafeComponent>
    }

    /> <Route path="notifications"element= {

      <SafeComponent name="HHMNotificationCenter"> <HHMNotificationCenter /> </SafeComponent>
    }

    /> <Route path="contracts"element= {

      <SafeComponent name="HHMContractDashboard"> <HHMContractDashboard /> </SafeComponent>
    }

    /> <Route path="farmers"element= {

      <SafeComponent name="HHMFarmerDirectoryPage"> <HHMFarmerDirectoryPage /> </SafeComponent>
    }

    /> <Route path="farmers/:userId"element= {

      <SafeComponent name="UserProfilePage"> <UserProfilePage /> </SafeComponent>
    }

    /> <Route path="farmer/profile/:id"element= {

      <SafeComponent name="HHMFarmerProfilePage"> <HHMFarmerProfilePage /> </SafeComponent>
    }

    /> <Route index element= {

      <SafeComponent name="HHMDashboardPage"> <HHMDashboardPage /> </SafeComponent>
    }

    /> </Route> </Route> {
      /* Protected Worker Routes - Only Worker/Labour role can access */
    }

    <Route path="/labour"element= {
      <SafeComponent name="RoleProtectedRoute"> <RoleProtectedRoute allowedRoles= {
        ['Labour', 'Worker']
      }

      /> </SafeComponent>
    }

    > <Route path="profile"element= {
      <SafeComponent name="ProfilePage"> <ProfilePage /> </SafeComponent>
    }

    /> <Route element= {
      <SafeComponent name="AuthenticatedLayout"> <AuthenticatedLayout /> </SafeComponent>
    }

    > <Route path="dashboard"element= {

      <SafeComponent name="LabourDashboardPage"> <LabourDashboardPage /> </SafeComponent>
    }

    /> <Route path="jobs"element= {

      <SafeComponent name="LabourDashboardPage"> <LabourDashboardPage /> </SafeComponent>
    }

    /> <Route path="applications"element= {

      <SafeComponent name="InvitesAndApplicationsPage"> <InvitesAndApplicationsPage /> </SafeComponent>
    }

    /> <Route path="applications/:id"element= {

      <SafeComponent name="InvitationDetailsPage"> <InvitationDetailsPage /> </SafeComponent>
    }

    /> <Route path="hhm-directory"element= {

      <SafeComponent name="LabourHHMDirectoryPage"> <LabourHHMDirectoryPage /> </SafeComponent>
    }

    /> <Route path="hhm-directory/:userId"element= {

      <SafeComponent name="UserProfilePage"> <UserProfilePage /> </SafeComponent>
    }

    /> <Route path="hhm/profile/:id"element= {

      <SafeComponent name="LabourHHMProfileViewPage"> <LabourHHMProfileViewPage /> </SafeComponent>
    }

    /> <Route index element= {

      <SafeComponent name="LabourDashboardPage"> <LabourDashboardPage /> </SafeComponent>
    }

    /> </Route> </Route> {
      /* Protected Factory Routes - Only Factory role can access */
    }

    <Route path="/factory"element= {
      <SafeComponent name="RoleProtectedRoute"> <RoleProtectedRoute allowedRoles= {
        ['Factory']
      }

      /> </SafeComponent>
    }

    > <Route path="profile"element= {
      <SafeComponent name="ProfilePage"> <ProfilePage /> </SafeComponent>
    }

    /> <Route element= {
      <SafeComponent name="AuthenticatedLayout"> <AuthenticatedLayout /> </SafeComponent>
    }

    > <Route path="dashboard"element= {

      <SafeComponent name="FactoryDashboardPage"> <FactoryDashboardPage /> </SafeComponent>
    }

    /> <Route path="post-bill"element= {

      <SafeComponent name="FactoryPostBillPage"> <FactoryPostBillPage /> </SafeComponent>
    }

    /> <Route path="hhm-directory"element= {

      <SafeComponent name="FactoryHHMDirectoryPage"> <FactoryHHMDirectoryPage /> </SafeComponent>
    }

    /> <Route path="hhm-directory/:userId"element= {

      <SafeComponent name="UserProfilePage"> <UserProfilePage /> </SafeComponent>
    }

    /> <Route path="hhm/profile/:id"element= {

      <SafeComponent name="FactoryHHMProfileViewPage"> <FactoryHHMProfileViewPage /> </SafeComponent>
    }

    /> <Route path="hhm-profile/:id"element= {

      <SafeComponent name="HHMPublicProfilePage"> <HHMPublicProfilePage /> </SafeComponent>
    }

    /> <Route path="sent-invitations"element= {

      <SafeComponent name="FactorySentInvitationsPage"> <FactorySentInvitationsPage /> </SafeComponent>
    }

    /> <Route path="received-invitations"element= {

      <SafeComponent name="FactoryReceivedInvitationsPage"> <FactoryReceivedInvitationsPage /> </SafeComponent>
    }

    /> <Route path="associated-hhms"element= {

      <SafeComponent name="FactoryAssociatedHHMsPage"> <FactoryAssociatedHHMsPage /> </SafeComponent>
    }

    /> <Route path="associated-hhms/:userId"element= {

      <SafeComponent name="UserProfilePage"> <UserProfilePage /> </SafeComponent>
    }

    /> <Route path="factory-directory"element= {

      <SafeComponent name="FactoryDirectoryPage"> <FactoryDirectoryPage /> </SafeComponent>
    }

    /> <Route path="factory-directory/:id"element= {

      <SafeComponent name="FactoryProfilePage"> <FactoryProfilePage /> </SafeComponent>
    }

    /> <Route path="contracts"element= {

      <SafeComponent name="ContractsDashboard"> <ContractsDashboard /> </SafeComponent>
    }

    /> <Route index element= {

      <SafeComponent name="FactoryDashboardPage"> <FactoryDashboardPage /> </SafeComponent>
    }

    /> </Route> </Route> {
      /* Catch-all route for 404 pages */
    }

    <Route path="*"element= {
      <NotFound />
    }

    /> </Routes> </main> <ConditionalFooter /> {
      /* Conditional Footer */
    }

    </div> </Router>);

}

// 404 Not Found Component

const NotFound=()=> {
  const navigate=useNavigate();
  const location=useLocation();

  const authenticated=isAuthenticated();
  const storedUser=getStoredUser();
  const dashboardRoute=authenticated && storedUser?.role ? getDashboardRouteForRole(storedUser.role): '/';
  const primaryActionLabel=authenticated ? 'Return to Dashboard': 'Go Home';
  const secondaryActionLabel=authenticated ? 'Go Back': 'Login';

  const ErrorPageNavbar=()=>(<header className="not-found-nav"aria-label="404 page navigation"> <button type="button"
    className="not-found-nav-back"

    onClick= {
      ()=> navigate(-1)
    }

    > ← Back </button> <NavLink to= {
      authenticated ? dashboardRoute : '/'
    }

    className="not-found-nav-brand"onClick= {
      (e)=> {
        e.preventDefault(); navigate(authenticated ? dashboardRoute : '/');
      }
    }

    > <span className="not-found-nav-mark">✦</span> <span className="not-found-nav-text">CaneSetu</span> </NavLink> </header>);

  return (<div className="not-found-page"> <ErrorPageNavbar /> <div className="not-found-ambient not-found-ambient-left"aria-hidden="true"/> <div className="not-found-ambient not-found-ambient-right"aria-hidden="true"/> <div className="not-found-shell"> <aside className="not-found-illustration-card"aria-hidden="true"> <span className="not-found-float not-found-float-one"/> <span className="not-found-float not-found-float-two"/> <span className="not-found-float not-found-float-three"/> <span className="not-found-grid-lines"/> <div className="not-found-illustration-frame"> <svg viewBox="0 0 340 280"className="not-found-illustration"role="img"aria-label="Sugarcane platform illustration"> <defs> <linearGradient id="nfGlow"x1="0"y1="0"x2="1"y2="1"> <stop offset="0%"stopColor="rgba(126, 200, 67, 0.95)"/> <stop offset="100%"stopColor="rgba(126, 200, 67, 0.15)"/> </linearGradient> <linearGradient id="nfLeaf"x1="0"y1="0"x2="0"y2="1"> <stop offset="0%"stopColor="#a7e463"/> <stop offset="100%"stopColor="#4f8227"/> </linearGradient> </defs> <rect x="18"y="20"width="304"height="236"rx="24"fill="rgba(255,255,255,0.03)"stroke="rgba(255,255,255,0.08)"/> <circle cx="260"cy="58"r="36"fill="url(#nfGlow)"opacity="0.55"/> <circle cx="260"cy="58"r="18"fill="rgba(126,200,67,0.18)"stroke="rgba(126,200,67,0.5)"/> <path d="M250 58l7 7 14-16"fill="none"stroke="#f0f5ec"strokeWidth="4"strokeLinecap="round"strokeLinejoin="round"/> <path d="M106 206c16-36 38-60 63-93 20-27 36-50 53-72"fill="none"stroke="url(#nfLeaf)"strokeWidth="10"strokeLinecap="round"strokeLinejoin="round"/> <path d="M130 197c11-31 22-50 38-72"fill="none"stroke="#7ec843"strokeWidth="7"strokeLinecap="round"opacity="0.85"/> <path d="M164 124c-18-7-33-21-40-39 18 1 35 8 46 21"fill="none"stroke="#a7e463"strokeWidth="6"strokeLinecap="round"strokeLinejoin="round"/> <path d="M189 88c18-2 34 2 49 13-18 8-35 10-51 7"fill="none"stroke="#7ec843"strokeWidth="6"strokeLinecap="round"strokeLinejoin="round"/> <path d="M88 205c19-7 38-8 62-4"fill="none"stroke="rgba(126,200,67,0.55)"strokeWidth="7"strokeLinecap="round"/> <path d="M102 220c15-2 34 1 54 9"fill="none"stroke="rgba(240,245,236,0.28)"strokeWidth="5"strokeLinecap="round"/> <g fill="rgba(240,245,236,0.88)"> <circle cx="80"cy="66"r="4"/> <circle cx="110"cy="50"r="3"/> <circle cx="224"cy="176"r="4"/> <circle cx="256"cy="146"r="3"/> <circle cx="62"cy="172"r="2.5"/> <circle cx="286"cy="100"r="2.5"/> </g> <g stroke="rgba(126,200,67,0.55)"strokeWidth="2"fill="none"> <path d="M78 66h18"/> <path d="M110 50h20"/> <path d="M224 176h18"/> <path d="M256 146h15"/> <path d="M52 172h18"/> <path d="M276 100h16"/> </g> <circle cx="62"cy="216"r="14"fill="none"stroke="rgba(126,200,67,0.24)"strokeWidth="2"/> <circle cx="290"cy="214"r="10"fill="none"stroke="rgba(240,245,236,0.18)"strokeWidth="2"/> </svg> </div> <div className="not-found-mini-grid"> <span /> <span /> <span /> <span /> </div> </aside> <section className="not-found-card"> <div className="not-found-badge">Sugarcane Platform</div> <div className="not-found-code">404</div> <h1 className="not-found-title">Page Not Found</h1> <p className="not-found-text"> The page you&apos; re looking for doesn&apos; t exist or may have been moved. </p> <div className="not-found-path"title= {
      location.pathname
    }

    > <span>Requested path</span> <strong> {
      location.pathname
    }

    </strong> </div> <div className="not-found-actions"> <button type="button"
    className="not-found-button not-found-button-secondary"

    onClick= {
      ()=> navigate(authenticated ? -1 : '/')
    }

    > {
      secondaryActionLabel
    }

    </button> <button type="button"
    className="not-found-button not-found-button-primary"

    onClick= {
      ()=> navigate(authenticated ? dashboardRoute : '/', {
          replace: true
        }

      )
    }

    > {
      primaryActionLabel
    }

    </button> {
       !authenticated && (<button type="button"
        className="not-found-button not-found-button-tertiary"

        onClick= {
          ()=> navigate('/login', {
              replace: true
            }

          )
        }

        > Login </button>)
    }

    </div> <div className="not-found-footer-note"> {
      authenticated ? 'Your session is active, so we can take you back to your dashboard.' : 'You can return home or log in to continue.'
    }

    </div> </section> </div> </div>);

}

;



export default App;