import { ReactNode } from 'react';

export function transformDescriptionHtml(
  description: string,
  transformer?: (html: string) => ReactNode,
): ReactNode {
  if (transformer) {
    return transformer(description);
  }

  return description;
}
