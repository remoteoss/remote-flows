import React from 'react';
import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement> & {
  href: string;
};

export const SvgUse = ({ href, ...props }: Props) => (
  <svg {...props}>
    <use href={href} />
  </svg>
);
