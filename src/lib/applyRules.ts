import { ThemeProviderProps } from '../types';

export function applyCssRules(rules: ThemeProviderProps['rules']) {
  if (!rules) return;

  const style = document.createElement('style');

  Object.keys(rules).forEach((key) => {
    style.innerHTML = `${style.innerHTML} ${key} { ${Object.entries(
      // @ts-expect-error
      rules[key],
    )
      .map(([k, v]) => `${k}: ${v};`)
      .join(' ')} }`;
  });

  document.head.appendChild(style);
}
