import { useNavigate } from 'react-router-dom';
import { Security } from '@okta/okta-react';
import OktaAuth from '@okta/okta-auth-js';

type RouterSecurityWrapperProps = {
  oktaAuth: OktaAuth;
  children: React.ReactNode;
};

export const RouterSecurityWrapper = ({
  oktaAuth,
  children,
}: RouterSecurityWrapperProps) => {
  const navigate = useNavigate();

  return (
    <Security
      oktaAuth={oktaAuth}
      restoreOriginalUri={async (_oktaAuth, originalUri) => {
        navigate(originalUri || '/');
      }}
    >
      {children}
    </Security>
  );
};
