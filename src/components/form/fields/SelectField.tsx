/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { useFormFields } from '@/src/context';
import { Components, JSFField } from '@/src/types/remoteFlows';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';

type SelectFieldProps = JSFField & {
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  className?: string;
  onChange?: (value: any) => void;
  component?: Components['select'];
};

export function SelectField({
  label,
  name,
  options,
  defaultValue,
  description,
  onChange,
  component,
  ...rest
}: SelectFieldProps) {
  const { control } = useFormContext();
  const { components } = useFormFields();

  return (
    <FormField
      defaultValue={defaultValue}
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const CustomSelectField = component || components?.select;
        if (CustomSelectField) {
          const customSelectFieldProps = {
            label,
            name,
            options,
            defaultValue,
            description,
            onChange,
            ...rest,
          };
          return (
            <CustomSelectField
              field={{
                ...field,
                onChange: (value: any) => {
                  const maybeCastValue =
                    typeof value !== 'number' ? +value : value;
                  field.onChange(maybeCastValue);
                  onChange?.(maybeCastValue);
                },
              }}
              fieldState={fieldState}
              fieldData={customSelectFieldProps}
            />
          );
        }

        return (
          <FormItem
            data-field={name}
            className={`RemoteFlows__SelectField__Item__${name}`}
          >
            <FormLabel className="RemoteFlows__SelectField__Label">
              {label}
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Select
                  value={field.value || ''}
                  onValueChange={(value: string) => {
                    // const maybeCastValue =
                    //   typeof value !== 'number' ? +value : value;
                    // field.onChange(maybeCastValue);
                    // onChange?.(maybeCastValue);
                    field.onChange(value);
                    onChange?.(value);
                  }}
                >
                  <SelectTrigger
                    className="RemoteFlows__SelectField__Trigger"
                    aria-invalid={Boolean(fieldState.error)}
                    aria-label={label}
                  >
                    <span className="absolute">
                      <SelectValue placeholder={label} />
                    </span>
                  </SelectTrigger>
                  <SelectContent className="RemoteFlows__SelectField__Content">
                    <SelectGroup className="RemoteFlows__SelectField__Group">
                      {options.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="RemoteFlows__SelectField__SelectItem"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            {fieldState.error && <FormMessage />}
          </FormItem>
        );
      }}
    />
  );
}
