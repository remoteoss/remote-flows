// auth types
type AuthResponse = {
  access_token: string;
  expires_in: number;
};

export type RemoteFlowsSDKProps = {
  auth: () => Promise<AuthResponse>;
};
