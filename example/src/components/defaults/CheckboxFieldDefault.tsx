import { Checkbox } from '../ui/checkbox';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { cn } from '@remoteoss/remote-flows/internals';
import { FieldComponentProps } from '@remoteoss/remote-flows';

export const CheckboxFieldDefault = ({
  field,
  fieldState,
  fieldData,
}: FieldComponentProps) => {
  const { name, label, description, options, multiple } = fieldData;

  return (
    <FormItem
      data-field={name}
      className={cn(`RemoteFlows__CheckBoxField__Item__${name}`)}
    >
      <FormControl>
        <>
          {options && multiple ? <FormLabel>{label}</FormLabel> : null}

          {options && multiple ? (
            options.map((option) => (
              <div key={option.value} className='flex space-x-2'>
                <Checkbox
                  id={option.value}
                  onCheckedChange={(checked: boolean | 'indeterminate') => {
                    field.onChange(checked === true, option.value);
                  }}
                  checked={field.value?.includes(option.value)}
                  className='RemoteFlows__CheckBox__Input'
                />
                <FormLabel
                  htmlFor={option.value}
                  className='mb-0 RemoteFlows__CheckBox__Label'
                >
                  {option.label}
                </FormLabel>
              </div>
            ))
          ) : (
            <div className='flex space-x-2'>
              <Checkbox
                id={name}
                onCheckedChange={(checked: boolean | 'indeterminate') => {
                  field.onChange(checked === true, null);
                }}
                checked={field.value}
                className='RemoteFlows__CheckBox__Input'
              />
              <FormLabel
                htmlFor={name}
                className='mb-0 RemoteFlows__CheckBox__Label'
              >
                {label}
              </FormLabel>
            </div>
          )}
        </>
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      {fieldState.error && <FormMessage />}
    </FormItem>
  );
};
