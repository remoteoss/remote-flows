import {
  CssThemeColors,
  SpacingThemeVariables,
  ThemeColors,
  ThemeProviderProps,
} from '../types';

export default function applyTheme(theme?: ThemeProviderProps['theme']) {
  const root = document.documentElement;
  if (theme?.colors) {
    const themeColors = mapThemeColors(theme.colors);
    Object.keys(themeColors).forEach((v) => {
      const propertyVal = themeColors[v as keyof CssThemeColors];
      if (propertyVal) {
        root.style.setProperty(v, propertyVal);
      }
    });
  }

  if (theme?.spacing) {
    const themeSpacing = mapThemeSpacing(theme.spacing);
    Object.keys(themeSpacing).forEach((v) => {
      const propertyVal = themeSpacing[v as keyof SpacingThemeVariables];
      if (propertyVal) {
        root.style.setProperty(v, propertyVal);
      }
    });
  }
}

function mapThemeColors(colors: ThemeColors): Partial<CssThemeColors> {
  const result: Partial<CssThemeColors> = {};
  if (colors?.['input']) {
    result['--input'] = colors['input'];
  }
  if (colors?.['primary']) {
    result['--primary'] = colors['primary'];
  }
  if (colors?.['accent']) {
    result['--accent'] = colors['accent'];
  }
  return result;
}

function mapThemeSpacing(spacing: string): Partial<SpacingThemeVariables> {
  const result: Partial<SpacingThemeVariables> = {};
  if (spacing) {
    result['--spacing'] = spacing;
  }
  return result;
}
