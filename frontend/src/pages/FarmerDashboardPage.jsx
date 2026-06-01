import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FarmerContractsTab from '../components/FarmerContractsTab';
import './FarmerDashboardPage.css';
import { useTranslation } from 'react-i18next';

/**
 * Premium SVG Icons
 */
const Icons = {
  Sprout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.974 0-5.749-.536-8.227-1.5" />
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  Handshake: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
    </svg>
  ),
  Market: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
  ),
  Chart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  ),
  List: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  ),
  Empty: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51-4.66-2.51m0 0-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V8.844a2.25 2.25 0 0 1 1.183-1.981l7.5-4.039a2.25 2.25 0 0 1 2.134 0l7.5 4.039a2.25 2.25 0 0 1 1.183 1.98V19.5Z" />
    </svg>
  ),
  Alert: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" />
    </svg>
  )
};

/**
 * Animated Vector Illustration for Hero section
 */
const HeroIllustration = () => (
  <svg viewBox="0 0 400 300" fill="none" className="fr-hero-svg" xmlns="http://www.w3.org/2000/svg">
    <path className="fr-svg-path" d="M50 250C100 250 150 150 200 150C250 150 300 200 350 100" stroke="url(#gradient-line)" strokeWidth="4" strokeLinecap="round" />
    <circle cx="350" cy="100" r="8" fill="var(--green)" className="fr-svg-dot" />
    <circle cx="200" cy="150" r="6" fill="var(--surface)" stroke="var(--blue)" strokeWidth="3" className="fr-svg-dot" style={{animationDelay: '0.5s'}} />
    <defs>
      <linearGradient id="gradient-line" x1="50" y1="250" x2="350" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="var(--blue)" stopOpacity="0.2" />
        <stop offset="0.5" stopColor="var(--green)" />
        <stop offset="1" stopColor="var(--green)" />
      </linearGradient>
    </defs>
    
    <g className="fr-svg-card">
      <rect x="70" y="80" width="80" height="120" rx="16" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
      <rect x="85" y="100" width="50" height="6" rx="3" fill="var(--green)" opacity="0.6" />
      <rect x="85" y="120" width="30" height="6" rx="3" fill="var(--muted)" />
      <rect x="85" y="140" width="40" height="6" rx="3" fill="var(--muted)" />
      <circle cx="110" cy="170" r="16" fill="var(--blue)" opacity="0.2" />
      <path d="M104 170L108 174L116 166" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    
    <g className="fr-svg-card" style={{animationDelay: '0.4s'}}>
      <rect x="230" y="180" width="100" height="70" rx="16" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
      <circle cx="280" cy="215" r="20" fill="none" stroke="var(--amber)" opacity="0.4" strokeWidth="4" />
      <path d="M280 195 A 20 20 0 0 1 300 215" fill="none" stroke="var(--amber)" strokeWidth="4" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * FarmerDashboardPage Component
 * Refined and evolved based on the original structure.
 */
const FarmerDashboardPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  return (
    <div className="fr-page">
      {/* Background ambient glows integrated organically into layout */}
      <div className="fr-ambient-glow fr-ambient-left"></div>
      <div className="fr-ambient-glow fr-ambient-right"></div>

      {/* Page Header (Hero Banner) */}
      <div className="fr-header">
        <div className="fr-header-inner">
          <div className="fr-welcome">
            <div className="fr-eyebrow">
              <span className="fr-eyebrow-icon"><Icons.Sprout /></span>
              {t('farmerDash.eyebrow')}
            </div>
            <h1 className="fr-title">
              {t('farmerDash.welcomePrefix')} <em>{user?.name || t('farmerDash.defaultName')}</em>
            </h1>
            <p className="fr-sub">
              {t('farmerDash.sub')}
            </p>
          </div>
          <div className="fr-hero-illustration-wrapper">
            <HeroIllustration />
          </div>
        </div>
      </div>

      {/* Single Page Content */}
      <div className="fr-content">
        <FarmerContractsTab />
      </div>

      
    </div>
  );
};

export default FarmerDashboardPage;
