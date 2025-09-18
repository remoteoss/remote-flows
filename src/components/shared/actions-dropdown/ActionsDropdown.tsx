import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { MoreHorizontal } from 'lucide-react';
import { useState, type ReactNode } from 'react';

export interface DropdownAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  separator?: boolean;
  disabled?: boolean;
}

interface ActionsDropdownProps {
  actions?: DropdownAction[];
  label?: string;
  className?: string;
  'data-testid'?: string;
}

export function ActionsDropdown({
  actions = [],
  className,
  label,
  'data-testid': dataSelector,
}: ActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn('relative', className)}>
      <Button
        data-testid={dataSelector}
        variant='ghost'
        aria-label={label}
        className='h-8 w-8 p-0'
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreHorizontal className='h-4 w-4' />
      </Button>

      {isOpen && (
        <>
          <div
            className='fixed inset-0 z-40'
            onClick={() => setIsOpen(false)}
          />
          <div className='absolute right-0 top-1/2 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[120px]'>
            {actions.map((action, index) => (
              <button
                key={index}
                data-testid={`${dataSelector}-${action.label.toLowerCase().replace(' ', '-')}`}
                className={cn(
                  'w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100',
                  action.disabled && 'opacity-50 cursor-not-allowed',
                )}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                disabled={action.disabled}
              >
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
