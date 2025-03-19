import { ThemeProviderProps } from '@/src/types/theme';

// auth types
type AuthResponse = {
  accessToken: string;
  expiresIn: number;
};

export type RemoteFlowsSDKProps = Omit<ThemeProviderProps, 'children'> & {
  auth: () => Promise<AuthResponse>;
  isTestingMode?: boolean;
};
