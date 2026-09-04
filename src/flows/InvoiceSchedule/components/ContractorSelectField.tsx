import { useMemo, useState } from 'react';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/src/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/src/components/ui/popover';
import { useDebounce } from '@/src/common/hooks';
import { useContractors } from '@/src/flows/InvoiceSchedule/api';
import { cn } from '@/src/lib/utils';
import { JSFCustomComponentProps } from '@/src/types/remoteFlows';

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Searchable contractor picker for the standalone invoice-schedule screen.
 *
 * A plain select would need every contractor loaded up front, which does not scale for the
 * companies that need this screen most. This queries `GET /v1/employments?name=` as the user
 * types instead — matched per word, ignoring case and accents — so the list stays small.
 *
 * Filtering is left to the API (`shouldFilter={false}`): cmdk's own client-side filter would
 * otherwise re-filter the already-filtered results against the raw input and hide valid
 * matches, since the API matches each word independently while cmdk matches the whole string.
 */
export function ContractorSelectField({
  value,
  setValue,
  label,
  description,
  name,
}: JSFCustomComponentProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const onSearchChange = useDebounce(async (next: string) => {
    setDebouncedSearch(next);
  }, SEARCH_DEBOUNCE_MS);

  const { data, isFetching } = useContractors({ search: debouncedSearch });

  const contractors = useMemo(() => data?.contractors ?? [], [data]);

  // Keep the chosen contractor's name visible on the trigger even once the search that
  // surfaced them has been narrowed away.
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const selected = contractors.find((c) => c.id === value);
  const triggerLabel = selected?.fullName ?? selectedLabel ?? label;

  return (
    <FormItem
      data-field={name}
      className={`RemoteFlows__ContractorSelectField__Item__${name}`}
    >
      <FormLabel className='RemoteFlows__ContractorSelectField__Label'>
        {label}
      </FormLabel>
      <FormControl>
        <Popover open={open} onOpenChange={setOpen}>
          {/* PopoverTrigger ships unstyled, so it borrows SelectTrigger's classes verbatim
              to sit flush with the other inputs on the form. */}
          <PopoverTrigger
            type='button'
            role='combobox'
            aria-expanded={open}
            aria-label={label}
            data-testid={name}
            className={cn(
              "border-input aria-invalid:ring-destructive/20 aria-invalid:border-destructive relative flex w-full items-center justify-between rounded-xl border bg-transparent px-4 py-7 text-sm whitespace-nowrap transition-[color] outline-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
              'focus-visible:border-focused',
              'RemoteFlows__ContractorSelectField__Trigger',
            )}
          >
            <span
              className={cn(
                'line-clamp-1 text-left',
                // A chosen contractor reads as a value; the untouched field reads as a
                // placeholder, matching how the other selects distinguish the two.
                value
                  ? 'font-medium'
                  : 'text-muted-foreground RemoteFlows__ContractorSelectField__Placeholder',
              )}
            >
              {triggerLabel}
            </span>
            <ChevronDownIcon className='size-4 opacity-50' />
          </PopoverTrigger>
          <PopoverContent
            align='start'
            className='w-(--radix-popover-trigger-width) p-0 RemoteFlows__ContractorSelectField__Content'
          >
            <Command shouldFilter={false}>
              <CommandInput
                placeholder='Search contractors…'
                value={search}
                onValueChange={(next: string) => {
                  setSearch(next);
                  onSearchChange(next);
                }}
              />
              <CommandList>
                <CommandEmpty>
                  {isFetching ? 'Searching…' : 'No contractors found.'}
                </CommandEmpty>
                <CommandGroup>
                  {contractors.map((contractor) => (
                    <CommandItem
                      key={contractor.id}
                      value={contractor.id}
                      className='RemoteFlows__ContractorSelectField__Item'
                      onSelect={() => {
                        setValue(contractor.id);
                        setSelectedLabel(contractor.fullName);
                        setOpen(false);
                      }}
                    >
                      <span className='flex w-full items-center justify-between gap-2'>
                        {contractor.fullName}
                        {contractor.id === value && (
                          <CheckIcon className='size-4 shrink-0' />
                        )}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </FormControl>
      {description && (
        <FormDescription>
          {description}
          {data?.isTruncated
            ? ` Showing ${contractors.length} of ${data.totalCount}; type to narrow the list.`
            : ''}
        </FormDescription>
      )}
      <FormMessage />
    </FormItem>
  );
}
