import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AuthRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

const AuthRoute: React.FC<AuthRouteProps> = ({ 
  children, 
  requireAuth = true,
  requireAdmin = false 
}) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  // If route doesn't require auth, allow access
  if (!requireAuth) {
    return <>{children}</>;
  }
  
  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  // If route requires admin and user is not admin, redirect to home
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default AuthRoute;