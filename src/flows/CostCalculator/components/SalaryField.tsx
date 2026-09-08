import { CurrencyConversionField } from '@/src/components/form/fields/CurrencyConversionField';
import { ZendeskTriggerButton } from '@/src/components/shared/zendesk-drawer/ZendeskTriggerButton';
import { zendeskArticles } from '@/src/components/shared/zendesk-drawer/utils';
import { syncSalaryConversion } from '@/src/flows/CostCalculator/utils';
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
  splitDescription?: boolean;
};

export const SalaryField = ({
  currencies: { from, to },
  shouldSwapOrder,
  salary_conversion_properties,
  conversionType = 'no_spread',
  defaultValue,
  splitDescription,
  ...props
}: SalaryFieldProps) => {
  const { setValue, getValues } = useFormContext();

  // Applies whatever `syncSalaryConversion` decides needs to change, via `setValue` so RHF
  // re-renders the affected field(s).
  const applySalarySync = (patch: Record<string, string> | null) => {
    if (!patch) return;
    Object.entries(patch).forEach(([field, value]) => setValue(field, value));
  };

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
    applySalarySync(
      syncSalaryConversion(
        getValues(),
        shouldSwapOrder,
        props.name,
        defaultValue,
      ),
    );
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldSwapOrder, defaultValue, setValue, getValues, props.name]);
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
      splitDescription={splitDescription}
    />
  );
};
