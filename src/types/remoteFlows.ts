// auth types
type AuthResponse = {
  accessToken: string;
  expiresIn: number;
};

export type RemoteFlowsSDKProps = {
  auth: () => Promise<AuthResponse>;
  environment?: 'staging' | 'production';
};
