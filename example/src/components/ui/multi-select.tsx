import { useState } from 'react';
import { ChevronDownIcon, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { cn } from '@remoteoss/remote-flows/internals';

export type Option = {
  label: string;
  value: string | string[];
  category?: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: Option[];
  onChange: (options: Option[]) => void;
  placeholder?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const handleUnselect = (option: Option) => {
    onChange(selected.filter((item) => item.value !== option.value));
  };

  const handleToggle = (option: Option) => {
    const isSelected = selected.some((item) => item.value === option.value);
    onChange(
      isSelected
        ? selected.filter((item) => item.value !== option.value)
        : [...selected, option],
    );
  };

  const hasCategories = options.some((option) => option.category);

  const groupedOptions = options.reduce(
    (groups, option) => {
      const category = option.category || 'Uncategorized';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(option);
      return groups;
    },
    {} as Record<string, Option[]>,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between font-normal'
          type='button'
        >
          <div className='flex gap-1 flex-wrap overflow-x-auto max-h-[2.5rem] items-center'>
            {selected.length > 0 ? (
              selected.map((option) => (
                <span
                  key={String(option.value)}
                  className='inline-flex items-center gap-1 bg-secondary text-secondary-foreground rounded px-1.5 py-0.5 text-xs mr-1'
                >
                  {option.label}
                  <span
                    role='button'
                    tabIndex={0}
                    aria-label={`remove ${option.label}`}
                    className='cursor-pointer'
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUnselect(option);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => handleUnselect(option)}
                  >
                    <X className='h-3 w-3' />
                  </span>
                </span>
              ))
            ) : (
              <span className='text-foreground'>{placeholder}</span>
            )}
          </div>
          <ChevronDownIcon className='size-4 shrink-0' />
        </Button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-72 p-0 max-h-64 overflow-y-auto'>
        {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
          <div key={category}>
            {hasCategories && (
              <div className='px-2 py-1.5 text-xs font-semibold text-muted-foreground'>
                {category}
              </div>
            )}
            {categoryOptions.map((option) => {
              const isSelected = selected.some(
                (item) => item.value === option.value,
              );
              return (
                <div
                  key={String(option.value)}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent text-sm',
                  )}
                  onClick={() => handleToggle(option)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(option)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {option.label}
                </div>
              );
            })}
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}
