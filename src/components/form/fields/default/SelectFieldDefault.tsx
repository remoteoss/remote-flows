import { XIcon } from 'lucide-react';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';
import { HelpCenter } from '@/src/components/shared/zendesk-drawer/HelpCenter';
import { FieldComponentProps } from '@/src/types/fields';
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/src/components/ui/select';

export function SelectFieldDefault({
  field,
  fieldState,
  fieldData,
}: FieldComponentProps) {
  const { name, label, description, options, required } = fieldData;
  const isClearable = !required && Boolean(field.value);

  const clearValue = (event: React.MouseEvent<HTMLButtonElement>) => {
    field.onChange('');
    event.currentTarget.parentElement
      ?.querySelector<HTMLElement>('[data-slot="select-trigger"]')
      ?.focus();
  };

  return (
    <FormItem
      data-field={name}
      className={`RemoteFlows__SelectField__Item__${name}`}
    >
      <FormLabel className='RemoteFlows__SelectField__Label'>{label}</FormLabel>
      <FormControl>
        <div className='relative'>
          <Select
            disabled={fieldData.readOnly}
            value={field.value || ''}
            onValueChange={(value: string) => {
              field.onChange(value);
            }}
          >
            <SelectTrigger
              className='RemoteFlows__SelectField__Trigger'
              aria-invalid={Boolean(fieldState.error)}
              aria-label={label}
            >
              <span className='absolute'>
                <SelectValue placeholder={label} />
              </span>
            </SelectTrigger>
            <SelectContent className='RemoteFlows__SelectField__Content'>
              <SelectGroup className='RemoteFlows__SelectField__Group'>
                {options?.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className='RemoteFlows__SelectField__SelectItem'
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {isClearable && (
            <button
              type='button'
              aria-label={`Clear ${label}`}
              className='RemoteFlows__SelectField__Clear absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground'
              onClick={clearValue}
            >
              <XIcon className='size-4' />
            </button>
          )}
        </div>
      </FormControl>
      {(description || fieldData.meta?.helpCenter) && (
        <FormDescription
          helpCenter={<HelpCenter helpCenter={fieldData.meta?.helpCenter} />}
        >
          {description}
        </FormDescription>
      )}
      {fieldState.error && <FormMessage />}
    </FormItem>
  );
}
