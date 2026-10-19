/**
 * UniLib - Layout Wrapper Component
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ToastContainer } from '@/components/feedback/Toast';
import './LayoutWrapper.css';

export const LayoutWrapper: React.FC = () => {
  return (
    <div className="unilib-app-shell">
      <Navbar />
      <main className="unilib-main-content">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
};
