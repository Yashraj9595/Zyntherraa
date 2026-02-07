import React from 'react';
import AuthRoute from './AuthRoute';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route component specifically for admin panel routes.
 * Ensures user is authenticated and has admin role.
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  return (
    <AuthRoute requireAuth={true} requireAdmin={true}>
      {children}
    </AuthRoute>
  );
};

export default AdminRoute;


