import React, { createContext, useEffect, useMemo } from 'react';
import applyTheme from '@/src/utils/applyTheme';
import { ThemeProviderProps } from './types';

const ThemeContext = createContext<Omit<ThemeProviderProps, 'children'>>({
  theme: undefined,
});

export function ThemeProvider(props: ThemeProviderProps) {
  useEffect(() => {
    if (props.theme) {
      applyTheme(props.theme);
    }
  }, []);

  const value = useMemo(() => {
    return { theme: props.theme };
  }, [props.theme]);

  return (
    <ThemeContext.Provider value={value}>
      {props.children}
    </ThemeContext.Provider>
  );
}
