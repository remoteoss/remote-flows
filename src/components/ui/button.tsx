import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/src/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 RemoteFlows_ButtonDefault',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 RemoteFlows_ButtonDestructive',
        outline:
          'border border-input bg-background shadow-xs RemoteFlows_ButtonOutline',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 RemoteFlows_ButtonSecondary',
        ghost:
          'hover:bg-accent hover:text-accent-foreground RemoteFlows_ButtonGhost',
        link: 'text-link-button-primary underline-offset-4 hover:underline button-link RemoteFlows_ButtonLink',
      },
      size: {
        default: 'h-9 px-4 py-7 has-[>svg]:px-3 RemoteFlows_ButtonDefault',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 RemoteFlows_ButtonSm',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4 RemoteFlows_ButtonLg',
        icon: 'size-9 RemoteFlows_ButtonIcon',
        link: 'px-0 RemoteFlows_ButtonLink',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot='button'
      className={cn(
        buttonVariants({ variant, size, className }),
        'RemoteFlows__Button',
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
