import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

// NOTE: Styles are NOT imported here
// They're compiled via src/styles/index.scss -> dist/styles.css

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'rf-button',
          `rf-button--${variant}`,
          `rf-button--${size}`,
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
