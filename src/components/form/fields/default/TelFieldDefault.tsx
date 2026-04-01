import { FormDescription, FormMessage } from '@/src/components/ui/form';
import { FormControl, FormItem, FormLabel } from '@/src/components/ui/form';
import { Input } from '@/src/components/ui/input';
import { TelFieldComponentProps } from '@/src/types/fields';

export function TelFieldDefault({
  field,
  fieldState,
  fieldData,
}: TelFieldComponentProps) {
  const { name, label, description, maxLength } = fieldData;

  return (
    <FormItem
      data-field={name}
      className={`RemoteFlows__TelField__Item__${name}`}
    >
      {label && (
        <FormLabel className='RemoteFlows__TelField__Label'>{label}</FormLabel>
      )}
      <FormControl>
        <Input
          {...field}
          value={field.value ?? ''}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            field.onChange(event);
          }}
          className='RemoteFlows__TextField__Input'
          placeholder={label}
          maxLength={maxLength}
        />
      </FormControl>
      {description && (
        <FormDescription className='RemoteFlows__TextField__Description'>
          {description}
        </FormDescription>
      )}
      {fieldState.error && <FormMessage />}
    </FormItem>
  );
}
