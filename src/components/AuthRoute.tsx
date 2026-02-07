import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
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
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  // If route doesn't require auth, allow access
  if (!requireAuth) {
    return <>{children}</>;
  }
  
  // If user is not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    return <Navigate to={`/auth/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  
  // If route requires admin and user is not admin, redirect to home with error message
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/?error=unauthorized" replace />;
  }
  
  return <>{children}</>;
};

export default AuthRoute;