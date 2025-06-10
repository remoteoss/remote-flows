import { ButtonHTMLAttributes, PropsWithChildren } from 'react';

// you can define HTML button attributes or event props that exist in your Button like variant, size, etc.
const Button = ({
  children,
  /* variant */
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) => {
  //console.log('Button component rendered with props:', props.variant); // THIS WILL WORK
  return <button {...props}>{children}</button>;
};

export const components = {
  button: Button,
};
