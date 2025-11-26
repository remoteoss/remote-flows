import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';
import { Input } from '@/src/components/ui/input';
import { $TSFixMe, FieldComponentProps } from '@/src/types/remoteFlows';

export function TextFieldDefault({
  field,
  fieldState,
  fieldData,
}: FieldComponentProps) {
  const {
    name,
    label,
    description,
    maxLength,
    includeErrorMessage = true,
  } = fieldData as $TSFixMe;

  return (
    <FormItem
      data-field={name}
      className={`RemoteFlows__TextField__Item__${name}`}
    >
      {label && (
        <FormLabel className='RemoteFlows__TextField__Label'>{label}</FormLabel>
      )}
      <FormControl>
        <Input
          {...field}
          value={field.value ?? ''}
          onChange={field.onChange}
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
      {includeErrorMessage && fieldState.error && (
        <FormMessage className='RemoteFlows__TextField__Error' />
      )}
    </FormItem>
  );
}
