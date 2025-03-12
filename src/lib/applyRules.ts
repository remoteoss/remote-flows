import { ThemeProviderProps } from '@/src/types/theme';

export function applyCssRules(rules: ThemeProviderProps['rules']) {
  if (!rules) return;

  const style = document.createElement('style');

  Object.keys(rules).forEach((key) => {
    style.innerHTML = `${style.innerHTML} ${key} { ${Object.entries(rules[key])
      .map(([k, v]) => `${k}: ${v};`)
      .join(' ')} }`;
  });

  document.head.appendChild(style);
}
