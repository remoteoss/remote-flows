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
  theme?: Partial<{
    colors: ThemeColors;
    spacing: string;
    borderRadius: string;
    font: ThemeFont;
  }>;
  rules?: Rules;
}>;

export type Rules = {};

export type ThemeColors = Partial<{
  focus: string;
  borderInput: string;
  primaryBackground: string;
  primaryForeground: string;
  accentBackground: string;
  accentForeground: string;
  danger: string;
  /**
   * Used for the background of select options popover
   */
  popoverPrimaryBackground: string;
  popoverPrimaryForeground: string;
  textBase: string;
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
