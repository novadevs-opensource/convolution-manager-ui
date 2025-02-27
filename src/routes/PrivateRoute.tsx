// src/routes/PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PrivateLayout from '../components/common/layouts/private/PrivateLayout';

type PrivateRouteProps = {
  children: React.ReactNode;
  pageTitle: string;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, pageTitle }) => {
  const { isAuthenticated } = useAuth(); 

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <PrivateLayout pageTitle={pageTitle}>{children}</PrivateLayout>;
};

export default PrivateRoute;
