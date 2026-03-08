import { Fragment, useState } from 'react';
import { Check, ChevronDownIcon, X } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from '@remoteoss/remote-flows/internals';
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
                  key={option.label}
                  className='inline-flex items-center gap-1 bg-secondary text-secondary-foreground rounded px-1.5 py-0.5 text-xs mr-1 mb-1'
                >
                  {option.label}
                  <span
                    role='button'
                    tabIndex={0}
                    aria-label={`remove ${option.label}`}
                    className='ml-1 rounded-full outline-none focus:ring-2 cursor-pointer'
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUnselect(option);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => handleUnselect(option)}
                  >
                    <X className='h-3 w-3 text-muted-foreground hover:text-foreground' />
                  </span>
                </span>
              ))
            ) : (
              <span className='text-foreground'>{placeholder}</span>
            )}
          </div>
          <ChevronDownIcon className='size-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-full p-0'>
        <Command>
          <CommandList>
            <CommandEmpty>No item found.</CommandEmpty>
            {Object.entries(groupedOptions).map(
              ([category, categoryOptions], index) => (
                <Fragment key={category}>
                  {index > 0 && <CommandSeparator />}
                  <CommandGroup heading={hasCategories ? category : undefined}>
                    {categoryOptions.map((option) => {
                      const isSelected = selected.some(
                        (item) => item.value === option.value,
                      );
                      return (
                        <CommandItem
                          key={option.label}
                          onSelect={() => {
                            onChange(
                              isSelected
                                ? selected.filter(
                                    (item) => item.value !== option.value,
                                  )
                                : [...selected, option],
                            );
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              isSelected ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </Fragment>
              ),
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
