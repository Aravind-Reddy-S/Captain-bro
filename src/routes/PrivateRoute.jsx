import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';

export const PrivateRoute = () => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader fullPage={true} />;
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace={true} />;
};
export default PrivateRoute;
