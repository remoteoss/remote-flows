// auth types
type AuthResponse = {
  access_token: string;
  expires_in: string;
};

export type RemoteFlowsSDKProps = {
  auth: () => Promise<AuthResponse>;
};
