import { CurrencyConversionField } from '@/src/components/form/fields/CurrencyConversionField';
import { JSFField } from '@/src/types/remoteFlows';

type AnnualGrossSalaryProps = JSFField & {
  currency: string;
  desiredCurrency: string;
  annual_gross_salary_conversion_properties?: {
    label?: string;
    description?: string;
  };
};

export const AnnualGrossSalary = ({
  currency,
  desiredCurrency,
  annual_gross_salary_conversion_properties,
  ...props
}: AnnualGrossSalaryProps) => {
  return (
    <CurrencyConversionField
      {...props}
      sourceCurrency={currency}
      targetCurrency={desiredCurrency}
      conversionFieldName="annual_gross_salary_conversion"
      conversionProperties={{
        ...annual_gross_salary_conversion_properties,
        description:
          annual_gross_salary_conversion_properties?.description ||
          'Estimated amount. This is an estimation. We calculate conversions based on spot rates that are subject to fluctuation over time.',
      }}
      classNamePrefix="RemoteFlows-AnnualGrossSalary"
      conversionType="no_spread"
    />
  );
};
