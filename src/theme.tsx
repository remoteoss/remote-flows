import { applyTheme } from '@/src/lib/applyTheme';
import { createContext, useEffect, useMemo } from 'react';
import { ThemeProviderProps } from './types/theme';

const ThemeContext = createContext<Omit<ThemeProviderProps, 'children'>>({
  theme: {},
});

export function ThemeProvider(props: ThemeProviderProps) {
  useEffect(() => {
    if (props.theme && Object.keys(props.theme).length > 0) {
      applyTheme(props.theme);
    }
  }, [props.theme]);

  const value = useMemo(() => {
    return { theme: props.theme };
  }, [props.theme]);

  return (
    <ThemeContext.Provider value={value}>
      {props.children}
    </ThemeContext.Provider>
  );
}
