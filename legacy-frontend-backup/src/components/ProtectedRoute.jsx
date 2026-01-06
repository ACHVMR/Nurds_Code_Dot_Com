import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { role } = useRole();

  if (requiredRole && role !== requiredRole) {
    // Redirect to home if role doesn't match
    // Could also redirect to a "Not Authorized" page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
