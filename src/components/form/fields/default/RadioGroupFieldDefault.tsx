import { Fragment } from 'react';
import { useWatch } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/src/components/ui/radio-group';
import { cn } from '@/src/lib/utils';
import { RadioGroupComponentProps } from '@/src/types/fields';
import { HelpCenter } from '@/src/components/shared/zendesk-drawer/HelpCenter';
import { Badge } from '@/src/components/ui/badge';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import {
  isFieldSkipped,
  resolveFieldDynamicProperties,
} from '@/src/components/form/utils';

export const RadioGroupFieldDefault = ({
  field,
  fieldData,
  fieldState,
}: RadioGroupComponentProps) => {
  const { name, label, description, options } = fieldData;
  const formValues = useWatch();
  return (
    <fieldset
      className={cn('space-y-3', `RemoteFlows__RadioGroupField__Item__${name}`)}
      data-field={name}
    >
      <FormItem>
        <legend>{label}</legend>
        {(description || fieldData.meta?.helpCenter) && (
          <FormDescription
            helpCenter={<HelpCenter helpCenter={fieldData.meta?.helpCenter} />}
          >
            {description}
          </FormDescription>
        )}
        <FormControl>
          <RadioGroup
            aria-label={label || name}
            onValueChange={(value: string) => {
              field.onChange(value);
            }}
            value={field.value}
            className='flex flex-col'
          >
            {options?.map((option) => (
              <Fragment key={option.value}>
                <FormItem
                  data-field={name}
                  className='flex items-start space-x-3 space-y-0 gap-0 min-h-[24px] RemoteFlows__RadioField__Item'
                >
                  <FormControl>
                    <RadioGroupItem
                      value={option.value}
                      className={cn(
                        'RemoteFlows__RadioField__Input',
                        option.recommended && 'mt-1',
                      )}
                      disabled={option.disabled}
                    />
                  </FormControl>
                  <div>
                    <FormLabel className='font-normal mb-0 RemoteFlows__RadioField__Label'>
                      <span
                        dangerouslySetInnerHTML={{ __html: option.label }}
                      />{' '}
                      {option.recommended && (
                        <Badge variant='secondary' className='ml-2'>
                          Recommended
                        </Badge>
                      )}
                    </FormLabel>
                    {option.description && (
                      <FormDescription className='mt-2'>
                        {option.description}
                      </FormDescription>
                    )}
                  </div>
                </FormItem>
                {option.nestedFields?.some(
                  (nested) =>
                    !isFieldSkipped(
                      resolveFieldDynamicProperties(nested, formValues),
                    ),
                ) && (
                  <fieldset
                    disabled={field.value !== option.value}
                    className='ml-7 RemoteFlows__RadioField__NestedFields'
                  >
                    <JSONSchemaFormFields
                      fields={option.nestedFields}
                      fieldValues={formValues}
                    />
                  </fieldset>
                )}
              </Fragment>
            ))}
          </RadioGroup>
        </FormControl>
        {fieldState.error && <FormMessage />}
      </FormItem>
    </fieldset>
  );
};
