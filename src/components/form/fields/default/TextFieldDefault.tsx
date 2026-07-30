import { FormDescription, FormMessage } from '@/src/components/ui/form';
import { FormControl, FormItem, FormLabel } from '@/src/components/ui/form';
import { Input } from '@/src/components/ui/input';
import { HelpCenter } from '@/src/components/shared/zendesk-drawer/HelpCenter';
import { TextFieldComponentProps } from '@/src/types/fields';

export function TextFieldDefault({
  field,
  fieldState,
  fieldData,
}: TextFieldComponentProps) {
  const {
    name,
    label,
    description,
    descriptionSuffix,
    maxLength,
    includeErrorMessage,
  } = fieldData;
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
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            field.onChange(event);
          }}
          className='RemoteFlows__TextField__Input'
          placeholder={label}
          maxLength={maxLength}
        />
      </FormControl>
      {(description || fieldData.meta?.helpCenter) && (
        <FormDescription
          className='RemoteFlows__TextField__Description'
          helpCenter={<HelpCenter helpCenter={fieldData.meta?.helpCenter} />}
        >
          {description}
        </FormDescription>
      )}
      {descriptionSuffix && (
        <span className='RemoteFlows__TextField__DescriptionSuffix'>
          {descriptionSuffix}
        </span>
      )}
      {includeErrorMessage && fieldState.error && (
        <FormMessage className='RemoteFlows__TextField__Error' />
      )}
    </FormItem>
  );
}
