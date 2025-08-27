import { CurrencyConversionField } from '@/src/components/form/fields/CurrencyConversionField';
import { ZendeskTriggerButton } from '@/src/components/shared/zendesk-drawer/ZendeskTriggerButton';
import { zendeskArticles } from '@/src/components/shared/zendesk-drawer/utils';
import { JSFField } from '@/src/types/remoteFlows';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

type SalaryFieldProps = JSFField & {
  currencies: {
    from: string;
    to: string;
  };
  salary_conversion_properties?: {
    label?: string;
    description?: string;
  };
  conversionType?: 'spread' | 'no_spread';
  shouldSwapOrder: boolean;
  defaultValue?: string;
};

export const SalaryField = ({
  currencies: { from, to },
  shouldSwapOrder,
  salary_conversion_properties,
  conversionType = 'no_spread',
  defaultValue,
  ...props
}: SalaryFieldProps) => {
  const { setValue, getValues } = useFormContext();

  const conversionProperties = {
    label: salary_conversion_properties?.label || 'Salary conversion',
    description: salary_conversion_properties?.description || (
      <>
        The conversion is based on the Remote FX rate.{' '}
        <ZendeskTriggerButton
          className='text-sm'
          zendeskId={zendeskArticles.remoteFxRate}
        >
          Learn more ↗
        </ZendeskTriggerButton>
      </>
    ),
  };

  const mainFieldName = shouldSwapOrder ? 'salary_conversion' : props.name;
  const conversionFieldName = shouldSwapOrder
    ? props.name
    : 'salary_conversion';

  useEffect(() => {
    if (shouldSwapOrder && defaultValue) {
      setValue('salary_conversion', defaultValue);
      setValue('salary_converted', 'salary_conversion');
    }
  }, [shouldSwapOrder, defaultValue, setValue, getValues]);

  return (
    <CurrencyConversionField
      {...props}
      sourceCurrency={from}
      targetCurrency={to}
      mainFieldName={mainFieldName}
      conversionFieldName={conversionFieldName}
      conversionProperties={conversionProperties}
      classNamePrefix='RemoteFlows-Salary'
      conversionType={conversionType}
    />
  );
};
