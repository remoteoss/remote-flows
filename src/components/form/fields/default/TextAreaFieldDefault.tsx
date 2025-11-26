import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';
import { Textarea } from '@/src/components/ui/textarea';
import { cn } from '@/src/lib/utils';
import { FieldComponentProps } from '@/src/types/remoteFlows';

export function TextAreaFieldDefault({
  field,
  fieldState,
  fieldData,
}: FieldComponentProps) {
  const { name, label, description, maxLength } = fieldData;
  const valueLength = field.value?.length ?? 0;

  return (
    <FormItem
      data-field={name}
      className={`RemoteFlows__TextArea__Item__${name}`}
    >
      <FormLabel className='RemoteFlows__TextArea__Label'>{label}</FormLabel>
      <FormControl>
        <Textarea
          {...field}
          value={field.value ?? ''}
          onChange={field.onChange}
          className={cn(
            fieldState.error && 'border-red-500 focus-visible:ring-red-500',
            'RemoteFlows__TextArea__Input',
          )}
          placeholder={label}
        />
      </FormControl>
      {(description || maxLength) && (
        <div className='flex items-center justify-between'>
          {description && (
            <FormDescription className='RemoteFlows__TextArea__Description'>
              {description}
            </FormDescription>
          )}
          {maxLength && (
            <span className='text-sm ml-auto RemoteFlows__TextArea__MaxLength'>
              {valueLength}/{maxLength}
            </span>
          )}
        </div>
      )}
      {fieldState.error && (
        <FormMessage className='RemoteFlows__TextArea__Error' />
      )}
    </FormItem>
  );
}
