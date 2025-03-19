import { CSSProperties, PropsWithChildren } from 'react';

export type ThemeProviderProps = PropsWithChildren<{
  theme?: Partial<{
    colors: ThemeColors;
    spacing: string;
    borderRadius: string;
    font: ThemeFont;
  }>;
  rules?: Record<string, CSSProperties>;
}>;

export type ThemeColors = Partial<{
  focus: string;
  borderInput: string;
  primaryBackground: string;
  primaryForeground: string;
  accentBackground: string;
  accentForeground: string;
  danger: string;
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
