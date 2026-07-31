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

  const descriptionNode = (description || fieldData.meta?.helpCenter) && (
    <FormDescription
      as={descriptionSuffix ? 'span' : 'p'}
      className='RemoteFlows__TextField__Description'
      helpCenter={<HelpCenter helpCenter={fieldData.meta?.helpCenter} />}
    >
      {description}
    </FormDescription>
  );

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
      {descriptionSuffix ? (
        // FormItem lays its children out in a grid, so the suffix has to share the description's
        // cell to stay on the same line as it (and as the help center link), the way the salary
        // description reads when the split_salary_description feature is off.
        <span className='RemoteFlows__TextField__DescriptionGroup'>
          {descriptionNode}{' '}
          <span className='RemoteFlows__TextField__DescriptionSuffix'>
            {descriptionSuffix}
          </span>
        </span>
      ) : (
        descriptionNode
      )}
      {includeErrorMessage && fieldState.error && (
        <FormMessage className='RemoteFlows__TextField__Error' />
      )}
    </FormItem>
  );
}
