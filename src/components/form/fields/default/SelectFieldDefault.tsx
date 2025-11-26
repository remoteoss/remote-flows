import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';
import { FieldComponentProps } from '@/src/types/remoteFlows';

export function SelectFieldDefault({
  field,
  fieldState,
  fieldData,
}: FieldComponentProps) {
  const { name, label, description, options } = fieldData;

  return (
    <FormItem
      data-field={name}
      className={`RemoteFlows__SelectField__Item__${name}`}
    >
      <FormLabel className='RemoteFlows__SelectField__Label'>{label}</FormLabel>
      <FormControl>
        <div className='relative'>
          <Select value={field.value || ''} onValueChange={field.onChange}>
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
        </div>
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      {fieldState.error && <FormMessage />}
    </FormItem>
  );
}
