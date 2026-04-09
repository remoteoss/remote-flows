import { FormDescription, FormMessage } from '@/src/components/ui/form';
import { FormItem, FormLabel } from '@/src/components/ui/form';
import { TelFieldComponentProps } from '@/src/types/fields';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { Input } from '@/src/components/ui/input';

export function TelFieldDefault({
  field,
  fieldState,
  fieldData,
}: TelFieldComponentProps) {
  const {
    name,
    label,
    description,
    options,
    onChangeCountryCode,
    onChangePhoneNumber,
    currentCountry,
    nationalPhoneNumber,
  } = fieldData;

  return (
    <FormItem
      data-field={name}
      className={`RemoteFlows__TelField__Item__${name}`}
    >
      {label && (
        <FormLabel className='RemoteFlows__TelField__Label'>{label}</FormLabel>
      )}

      <div className='flex gap-2'>
        {/* Country Code Select */}
        <div className='w-[180px]'>
          <Select
            value={currentCountry?.dialCode || ''}
            onValueChange={(dialCode) => {
              const country = options?.find(
                (opt) => opt.meta?.countryCode === dialCode,
              );
              if (country && onChangeCountryCode) {
                onChangeCountryCode({
                  name: country.label,
                  dialCode: country.meta?.countryCode || '',
                  pattern: country.pattern || '',
                });
              }
            }}
          >
            <SelectTrigger
              className='RemoteFlows__TelField__CountrySelect'
              aria-invalid={Boolean(fieldState.error)}
              aria-label='Country code'
            >
              <span className='absolute'>
                <SelectValue placeholder='Country code *'>
                  {currentCountry &&
                    `${currentCountry.name} +${currentCountry.dialCode}`}
                </SelectValue>
              </span>
            </SelectTrigger>
            <SelectContent className='RemoteFlows__TelField__CountryContent'>
              <SelectGroup className='RemoteFlows__TelField__CountryGroup'>
                {options?.map((option) => (
                  <SelectItem
                    key={option.meta?.countryCode}
                    value={option.meta?.countryCode || ''}
                    className='RemoteFlows__TelField__CountryItem'
                  >
                    {option.label} +{option.meta?.countryCode}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Phone Number Input */}
        <div className='flex-1'>
          <Input
            type='tel'
            name={field.name}
            value={nationalPhoneNumber || ''}
            onChange={onChangePhoneNumber}
            className='RemoteFlows__TelField__Input'
            placeholder="Employee's phone number *"
            aria-invalid={Boolean(fieldState.error)}
            aria-label='Phone number'
          />
        </div>
      </div>

      {description && (
        <FormDescription className='RemoteFlows__TelField__Description'>
          {description}
        </FormDescription>
      )}
      {fieldState.error && <FormMessage />}
    </FormItem>
  );
}
