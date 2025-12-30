import * as React from 'react';

import { cn } from '@/src/lib/utils';

interface CardProps extends React.ComponentProps<'div'> {
  direction?: 'row' | 'col';
}

function Card({ className, direction = 'col', ...props }: CardProps) {
  return (
    <div
      data-slot='card'
      className={cn(
        'RemoteFlows__Card bg-white text-card-foreground rounded-[10px] gap-4 border border-gray-200 px-10 py-14',
        direction === 'row' ? 'flex flex-row' : 'flex flex-col',
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'header'>) {
  return (
    <header
      data-slot='card-header'
      className={cn('flex flex-col gap-1.5 px-6', className)}
      {...props}
    />
  );
}

function CardTitle<T extends React.ElementType = 'h2'>({
  className,
  as,
  ...props
}: React.ComponentProps<'h2'> & {
  as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, 'children' | 'className'>) {
  const Component = as || 'h2';

  return (
    <Component
      data-slot='card-title'
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot='card-description'
      className={cn('text-sm', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-content'
      className={cn('px-6', className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <footer
      data-slot='card-footer'
      className={cn('flex items-center px-6', className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
