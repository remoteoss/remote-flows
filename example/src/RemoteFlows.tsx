import {
  RemoteFlows as RemoteFlowsAuth,
  RemoteFlowsSDKProps,
} from '@remoteoss/remote-flows';
import { ReactNode, useMemo } from 'react';

const fetchCompanyToken = () => {
<<<<<<< HEAD
  return fetch('/api/token')
=======
  return fetch('/api/fetch-refresh-token')
>>>>>>> main
    .then((res) => res.json())
    .then((data) => ({
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    }))
    .catch((error) => {
      console.error({ error });
      throw error;
    });
};

const fetchClientToken = () => {
  const accessToken = btoa(
    `${import.meta.env.VITE_CLIENT_ID}:${import.meta.env.VITE_CLIENT_TOKEN}`,
  );
  return Promise.resolve({
    accessToken: accessToken || '',
    expiresIn: 3600, // Default expiration time in seconds
  });
};

const fetchCompanyManagerToken = () => {
<<<<<<< HEAD
  return fetch('/api/jwt-token')
=======
  return fetch('/api/fetch-company-manager')
>>>>>>> main
    .then((res) => res.json())
    .then((data) => ({
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    }))
    .catch((error) => {
      console.error({ error });
      throw error;
    });
};

type RemoteFlowsProps = Omit<RemoteFlowsSDKProps, 'auth'> & {
  children: ReactNode;
  auth?: RemoteFlowsSDKProps['auth'];
  isClientToken?: boolean;
  authType?: 'refresh-token' | 'company-manager' | 'client';
};

export const RemoteFlows = ({
  children,
  isClientToken,
  authType,
  ...props
}: RemoteFlowsProps) => {
  const auth = useMemo(() => {
    if (authType === 'company-manager') {
      return fetchCompanyManagerToken;
    }
    if (authType === 'client' || isClientToken) {
      return fetchClientToken;
    }

    return fetchCompanyToken;
  }, [authType, isClientToken]);
  return (
    <RemoteFlowsAuth
      environment={import.meta.env.VITE_REMOTE_GATEWAY || 'partners'}
      auth={auth}
      authId={!isClientToken ? 'default' : 'client'}
      {...props}
    >
      {children}
    </RemoteFlowsAuth>
  );
};
