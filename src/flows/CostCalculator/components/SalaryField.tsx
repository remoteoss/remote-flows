import { CurrencyConversionField } from '@/src/components/form/fields/CurrencyConversionField';
import { ZendeskTriggerButton } from '@/src/components/shared/zendesk-drawer/ZendeskTriggerButton';
import { zendeskArticles } from '@/src/components/shared/zendesk-drawer/utils';
import { JSFField } from '@/src/types/remoteFlows';

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
};

export const SalaryField = ({
  currencies: { from, to },
  salary_conversion_properties,
  conversionType = 'no_spread',
  ...props
}: SalaryFieldProps) => {
  const conversionProperties = {
    label: salary_conversion_properties?.label || 'Salary conversion',
    description: salary_conversion_properties?.description || (
      <>
        The conversion is based on the Remote FX rate.{' '}
        <ZendeskTriggerButton
          className="text-sm"
          zendeskId={zendeskArticles.remoteFxRate}
        >
          Learn more ↗
        </ZendeskTriggerButton>
      </>
    ),
  };

  return (
    <CurrencyConversionField
      {...props}
      sourceCurrency={from}
      targetCurrency={to}
      conversionFieldName="salary_conversion"
      conversionProperties={conversionProperties}
      classNamePrefix="RemoteFlows-Salary"
      conversionType={conversionType}
    />
  );
};
