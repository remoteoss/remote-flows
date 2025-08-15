import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { Button } from '@/src/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';

export interface DropdownAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  separator?: boolean;
}

interface ActionsDropdownProps {
  actions?: DropdownAction[];
  trigger?: ReactNode;
  label?: string;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export function ActionsDropdown({
  actions = [],
  trigger,
  label = 'Actions',
  align = 'end',
  className,
}: ActionsDropdownProps) {
  const defaultTrigger = (
    <Button variant="ghost" className="h-8 w-8 p-0">
      <span className="sr-only">Open menu</span>
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        {trigger || defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        {actions.map((action, index) => (
          <div key={index}>
            {action.separator && index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={action.onClick}>
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
