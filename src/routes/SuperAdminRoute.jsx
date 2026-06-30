import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';

export const SuperAdminRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <Loader fullPage={true} />;
  }

  const isSuperAdmin = currentUser && currentUser.role === 'super_admin';

  return isSuperAdmin ? <Outlet /> : <Navigate to="/admin" replace={true} />;
};
export default SuperAdminRoute;
