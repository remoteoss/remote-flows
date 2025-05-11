import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LoginCallback, useOktaAuth } from '@okta/okta-react';
import { oktaAuth } from './config/oktaConfig';
import { RouterSecurityWrapper } from './routerSecurityWrapper';
import { RequireAuth } from './RequireAuth';
import { useEffect } from 'react';

const HomeApp = () => {
  const { oktaAuth } = useOktaAuth();

  useEffect(() => {
    oktaAuth.signInWithRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
const SecureApp = () => {
  return <div>secure app</div>;
};

export const RouteApp = () => {
  return (
    <BrowserRouter>
      <RouterSecurityWrapper oktaAuth={oktaAuth}>
        <Routes>
          <Route path="/" element={<HomeApp />} />
          <Route path="/login/callback" element={<LoginCallback />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <SecureApp />
              </RequireAuth>
            }
          />
        </Routes>
      </RouterSecurityWrapper>
    </BrowserRouter>
  );
};
