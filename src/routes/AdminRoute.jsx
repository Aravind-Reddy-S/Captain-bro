import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';

export const AdminRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <Loader fullPage={true} />;
  }

  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin');

  return isAdmin ? <Outlet /> : <Navigate to="/home" replace={true} />;
};
export default AdminRoute;
