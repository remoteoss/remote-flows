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
  theme: {
    colors?: ThemeColors;
    spacing?: string;
    borderRadius?: string;
    font?: ThemeFont;
  };
}>;

export type ThemeColors = Partial<{
  borderInput: string;
  primaryBackground: string;
  primaryForeground: string;
  accentBackground: string;
  accentForeground: string;
  dangerBackground: string;
  dangerForeground: string;
}>;

export type CssThemeColors = {
  [K in keyof ThemeColors as `--${K}`]: string;
};

export type ThemeFont = {
  fontSizeBase: string;
};

export type CssThemeFont = {
  '--fontSizeBase': string;
};

export type CssThemeSpacing = {
  '--spacing': string;
};

export type CssThemeBorder = {
  '--radius': string;
};
