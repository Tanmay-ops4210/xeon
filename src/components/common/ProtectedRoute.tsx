import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/NewAuthContext';
import { Loader2 } from 'lucide-react';

// A full-page loading spinner to show while we check auth status
const FullPageLoader: React.FC = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="text-center">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
      <p className="text-lg text-gray-600">Loading...</p>
    </div>
  </div>
);

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[];
  requiredRole?: string;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles, requiredRole, adminOnly }) => {
  // We use `profile` to get the user's role, not `user`
  const { isAuthenticated, profile, loading } = useAuth();
  const location = useLocation();

  // Show a loading screen while checking if you're logged in
  if (loading || !profile && isAuthenticated) {
    return <FullPageLoader />;
  }

  // If you are not logged in, redirect to the home page
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if your role is allowed to see the page
  const userRole = profile?.role;

  if (adminOnly && userRole !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If everything is okay, show the page
  return children;
};

export default ProtectedRoute;
