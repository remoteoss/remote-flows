import { ButtonHTMLAttributes, PropsWithChildren } from 'react';

const Button = ({
  children,
  variant,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: string;
}) => {
  console.log('Button props:', props);
  console.log('Button variant:', variant);
  console.log('Button children:', children);
  return <button {...props}>{children}</button>;
};

export const components = {
  button: Button,
};
