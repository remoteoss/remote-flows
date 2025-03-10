import {
  CssThemeBorder,
  CssThemeColors,
  CssThemeFont,
  CssThemeSpacing,
  ThemeColors,
  ThemeFont,
  ThemeProviderProps,
} from '@/src/types/theme';

function setCssProperties(variables: Record<string, string>) {
  const root = document.documentElement;
  Object.keys(variables).forEach((v) => {
    const propertyVal = variables[v];
    if (propertyVal) {
      root.style.setProperty(v, propertyVal);
    }
  });
}

function mapThemeColors(colors: ThemeColors): CssThemeColors {
  const result: CssThemeColors = {};
  Object.keys(colors).forEach((key) => {
    result[`--${key}` as keyof CssThemeColors] =
      colors[key as keyof ThemeColors];
  });
  return result;
}

function mapThemeSpacing(spacing: string): CssThemeSpacing {
  return {
    '--spacing': spacing,
  };
}

function mapThemeBorderRadius(borderRadius: string): CssThemeBorder {
  return {
    '--radius': borderRadius,
  };
}

function mapThemeFont(font: ThemeFont): CssThemeFont {
  return {
    '--fontSizeBase': font.fontSizeBase,
  };
}

export function applyTheme(theme: ThemeProviderProps['theme']) {
  if (theme?.colors) {
    setCssProperties(mapThemeColors(theme.colors));
  }

  if (theme?.spacing) {
    setCssProperties(mapThemeSpacing(theme.spacing));
  }

  if (theme?.borderRadius) {
    setCssProperties(mapThemeBorderRadius(theme.borderRadius));
  }

  if (theme?.font) {
    setCssProperties(mapThemeFont(theme.font));
  }
}
