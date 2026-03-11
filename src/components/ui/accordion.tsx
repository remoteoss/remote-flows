import * as React from 'react';
import { ChevronDownIcon } from 'lucide-react';

import { cn } from '@/src/lib/utils';

type AccordionContextValue = {
  openItem: string | undefined;
  toggleItem: (value: string) => void;
  collapsible: boolean;
};

const AccordionContext = React.createContext<AccordionContextValue | null>(
  null,
);

const useAccordion = () => {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within Accordion');
  }
  return context;
};

type AccordionProps = {
  type?: 'single';
  collapsible?: boolean;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
};

function Accordion({
  collapsible = false,
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  children,
  ...props
}: AccordionProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<
    string | undefined
  >(defaultValue);

  const isControlled = controlledValue !== undefined;
  const openItem = isControlled ? controlledValue : uncontrolledValue;

  const toggleItem = React.useCallback(
    (value: string) => {
      let newValue: string | undefined;

      if (openItem === value) {
        // Clicking the open item
        newValue = collapsible ? '' : value;
      } else {
        // Clicking a different item
        newValue = value;
      }

      if (!isControlled) {
        setUncontrolledValue(newValue);
      }

      if (onValueChange) {
        onValueChange(newValue);
      }
    },
    [openItem, collapsible, isControlled, onValueChange],
  );

  const contextValue = React.useMemo(
    () => ({ openItem, toggleItem, collapsible }),
    [openItem, toggleItem, collapsible],
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <div data-slot='accordion' className={className} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

type AccordionItemContextValue = {
  value: string;
  isOpen: boolean;
  contentId: string;
};

const AccordionItemContext =
  React.createContext<AccordionItemContextValue | null>(null);

const useAccordionItem = () => {
  const context = React.useContext(AccordionItemContext);
  if (!context) {
    throw new Error(
      'AccordionItem components must be used within AccordionItem',
    );
  }
  return context;
};

type AccordionItemProps = {
  value: string;
  className?: string;
  children: React.ReactNode;
};

function AccordionItem({
  value,
  className,
  children,
  ...props
}: AccordionItemProps) {
  const { openItem } = useAccordion();
  const isOpen = openItem === value;
  const contentId = React.useId();

  const contextValue = React.useMemo(
    () => ({ value, isOpen, contentId }),
    [value, isOpen, contentId],
  );

  return (
    <AccordionItemContext.Provider value={contextValue}>
      <div
        data-slot='accordion-item'
        className={cn('border-b last:border-b-0', className)}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

type AccordionTriggerProps = {
  className?: string;
  iconClassName?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

function AccordionTrigger({
  className,
  iconClassName,
  children,
  onClick,
  ...props
}: AccordionTriggerProps) {
  const { toggleItem } = useAccordion();
  const { value, isOpen, contentId } = useAccordionItem();
  const triggerId = React.useId();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    toggleItem(value);
    onClick?.(event);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleItem(value);
    }
  };

  return (
    <div className='flex items-center'>
      <button
        id={triggerId}
        type='button'
        data-slot='accordion-trigger'
        data-state={isOpen ? 'open' : 'closed'}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className={cn(
          'focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180',
          className,
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
        <ChevronDownIcon
          className={cn(
            'text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200 mt-1',
            iconClassName,
          )}
        />
      </button>
    </div>
  );
}

type AccordionContentProps = {
  className?: string;
  children: React.ReactNode;
};

function AccordionContent({
  className,
  children,
  ...props
}: AccordionContentProps): React.ReactElement | null {
  const { isOpen, contentId } = useAccordionItem();
  const [shouldRender, setShouldRender] = React.useState(isOpen);

  React.useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      return;
    }

    const timer = setTimeout(() => setShouldRender(false), 200);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      id={contentId}
      role='region'
      data-slot='accordion-content'
      data-state={isOpen ? 'open' : 'closed'}
      className={cn(
        'overflow-hidden text-sm transition-all duration-200 ease-out',
        isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0',
      )}
      {...props}
    >
      <div className={cn('pt-0 pb-4', className)}>{children}</div>
    </div>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
