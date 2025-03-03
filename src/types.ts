import { PropsWithChildren } from 'react';

// auth types
type AuthResponse = {
  access_token: string;
  expires_in: number;
};

export type RemoteFlowsSDKProps = {
  auth: () => Promise<AuthResponse>;
};

// theme type
export type ThemeProviderProps = PropsWithChildren<{
  theme?:
    | {
        colors?: ThemeColors;
        spacing?: string;
        radius?: string;
      }
    | undefined;
}>;

export type ThemeColors = Partial<{
  input: string;
  primary: string;
  accent: string;
}>;

export type CssThemeColors = {
  [K in keyof ThemeColors as `--${K}`]: string;
};

export type SpacingThemeVariables = {
  '--spacing': string;
};
