import { FormDescription, FormMessage } from '@/src/components/ui/form';
import { FormControl, FormItem, FormLabel } from '@/src/components/ui/form';
import { Input } from '@/src/components/ui/input';
import { TimeFieldComponentProps } from '@/src/types/fields';

export function TimeFieldDefault({
  field,
  fieldState,
  fieldData,
}: TimeFieldComponentProps) {
  const { name, label, description } = fieldData;
  return (
    <FormItem
      data-field={name}
      className={`RemoteFlows__TimeField__Item__${name}`}
    >
      {label && (
        <FormLabel className='RemoteFlows__TimeField__Label'>{label}</FormLabel>
      )}
      <FormControl>
        <Input
          {...field}
          type='time'
          value={field.value ?? ''}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            field.onChange(event);
          }}
          className='RemoteFlows__TimeField__Input'
          placeholder={label}
        />
      </FormControl>
      {description && (
        <FormDescription className='RemoteFlows__TimeField__Description'>
          {description}
        </FormDescription>
      )}
      {fieldState.error && (
        <FormMessage className='RemoteFlows__TimeField__Error' />
      )}
    </FormItem>
  );
}
