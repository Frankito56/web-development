import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import '../auth.css';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="unilib-auth-guard-loading">
        <div className="unilib-auth-guard-content">
          <div className="unilib-auth-guard-spinner" />
          <p className="unilib-auth-guard-text">Loading academic session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/books" replace />;
  }

  return <>{children}</>;
};
