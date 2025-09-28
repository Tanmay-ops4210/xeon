import React from 'react';
import { useAuth } from '../contexts/NewAuthContext';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';

const AdminPanel: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  // Check if user has admin role
  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
};

export default AdminPanel;