import { CurrencyConversionField } from '@/src/components/form/fields/CurrencyConversionField';
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
};

export const SalaryField = ({
  currencies: { from, to },
  salary_conversion_properties,
  ...props
}: SalaryFieldProps) => {
  return (
    <CurrencyConversionField
      {...props}
      sourceCurrency={from}
      targetCurrency={to}
      conversionFieldName="salary_conversion"
      conversionProperties={salary_conversion_properties}
      classNamePrefix="RemoteFlows-Salary"
    />
  );
};
