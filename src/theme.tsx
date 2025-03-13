import { applyCssRules } from '@/src/lib/applyRules';
import { applyTheme } from '@/src/lib/applyTheme';
import React, { createContext, useEffect, useMemo } from 'react';
import { ThemeProviderProps } from './types/theme';

const ThemeContext = createContext<Omit<ThemeProviderProps, 'children'>>({
  theme: {},
  rules: {},
});

export function ThemeProvider(props: ThemeProviderProps) {
  useEffect(() => {
    if (props.theme && Object.keys(props.theme).length > 0) {
      applyTheme(props.theme);
    }
    if (props.rules && Object.keys(props.rules).length > 0) {
      applyCssRules(props.rules);
    }
  }, [props.theme, props.rules]);

  const value = useMemo(() => {
    return { theme: props.theme, rules: props.rules };
  }, [props.theme, props.rules]);

  return (
    <ThemeContext.Provider value={value}>
      {props.children}
    </ThemeContext.Provider>
  );
}
