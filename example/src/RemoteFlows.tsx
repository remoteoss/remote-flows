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

type RemoteFlowsProps = Omit<RemoteFlowsSDKProps, 'auth'> & {
  children: ReactNode;
  auth?: RemoteFlowsSDKProps['auth'];
};

export const RemoteFlows = ({ children, ...props }: RemoteFlowsProps) => {
  return (
    <RemoteFlowsAuth
      environment={import.meta.env.VITE_REMOTE_GATEWAY || 'partners'}
      auth={fetchToken}
      {...props}
    >
      {children}
    </RemoteFlowsAuth>
  );
};
