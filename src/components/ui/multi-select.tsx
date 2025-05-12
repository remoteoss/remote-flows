import React, { Fragment, useState } from 'react';
import { Check, ChevronDownIcon, X } from 'lucide-react';

import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/src/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/src/components/ui/popover';
import { cn } from '@/src/lib/utils';

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
  ...props
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const handleUnselect = (option: Option) => {
    onChange(selected.filter((item) => item.value !== option.value));
  };

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
    <Popover open={open} onOpenChange={setOpen} {...props}>
      <PopoverTrigger>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          type="button"
        >
          <div className="flex gap-1 flex-wrap overflow-x-auto max-h-[2.5rem] items-center">
            {selected.length > 0 ? (
              selected.map((option) => {
                return (
                  <Badge
                    key={option.label}
                    variant="secondary"
                    className="mr-1 mb-1"
                  >
                    {option.label}
                    <div
                      role="button"
                      tabIndex={0}
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUnselect(option);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={() => handleUnselect(option)}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </div>
                  </Badge>
                );
              })
            ) : (
              <span className="text-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronDownIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-full p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No item found.</CommandEmpty>
            {Object.entries(groupedOptions).map(
              ([category, categoryOptions], index) => (
                <Fragment key={category}>
                  {index > 0 && <CommandSeparator />}
                  <CommandGroup heading={category}>
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
