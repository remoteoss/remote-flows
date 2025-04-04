import { PropsWithChildren } from 'react';

export type ThemeProviderProps = PropsWithChildren<{
  theme?: Partial<{
    colors: ThemeColors;
    spacing: string;
    borderRadius: string;
    font: ThemeFont;
  }>;
}>;

export type ThemeColors = Partial<{
  borderInput: string;
  primaryBackground: string;
  primaryForeground: string;
  accentBackground: string;
  accentForeground: string;
  danger: string;
  warningBackground: string;
  warningBorder: string;
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
