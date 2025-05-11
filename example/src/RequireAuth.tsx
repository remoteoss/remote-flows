import { useOktaAuth } from '@okta/okta-react';
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { authState } = useOktaAuth();
  const location = useLocation();

  if (!authState || !authState.isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};
