import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useMemo,
} from 'react';
import { IThemeRGB } from './types';
import applyTheme from '@/src/utils/applyTheme';

type Props = PropsWithChildren<{
  themeRGB: IThemeRGB;
}>;

type ThemeContextType = {
  themeRGB: IThemeRGB;
};

const ThemeContext = createContext<ThemeContextType>({
  themeRGB: {} as IThemeRGB,
});

export default function ThemeProvider(props: Props) {
  useEffect(() => {
    applyTheme(props.themeRGB);
  }, []);

  const value = useMemo(() => {
    return { themeRGB: props.themeRGB };
  }, [props.themeRGB]);

  return (
    <ThemeContext.Provider value={value}>
      {props.children}
    </ThemeContext.Provider>
  );
}
