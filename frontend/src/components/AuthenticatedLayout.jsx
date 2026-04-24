import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * AuthenticatedLayout Component
 * 
 * Layout wrapper for authenticated pages that includes:
 * - Outlet for page content
 * Note: Navbar and Footer are handled at the App level
 */
const AuthenticatedLayout = () => {
  return (
    <div className="authenticated-layout" style={{ background: '#0b0f0b', minHeight: '100%', width: '100%' }}>
      <main className="main-content" style={{ background: '#0b0f0b' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AuthenticatedLayout;