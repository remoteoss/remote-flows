import {
  RemoteFlows as RemoteFlowsAuth,
  RemoteFlowsSDKProps,
} from '@remoteoss/remote-flows';
import { ReactNode } from 'react';

const fetchToken = () => {
  return fetch('/api/token')
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

type RemoteFlowsProps = Omit<RemoteFlowsSDKProps, 'auth'> & {
  children: ReactNode;
  auth?: RemoteFlowsSDKProps['auth'];
  isClientToken?: boolean;
};

export const RemoteFlows = ({
  children,
  isClientToken,
  ...props
}: RemoteFlowsProps) => {
  return (
    <RemoteFlowsAuth
      environment={import.meta.env.VITE_REMOTE_GATEWAY || 'partners'}
      auth={!isClientToken ? fetchToken : fetchClientToken}
      {...props}
    >
      {children}
    </RemoteFlowsAuth>
  );
};
