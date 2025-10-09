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
    <div className="authenticated-layout">
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthenticatedLayout;