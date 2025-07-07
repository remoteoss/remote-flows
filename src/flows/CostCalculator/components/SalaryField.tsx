import { CurrencyFieldWithConversion } from '@/src/components/form/fields/CurrencyFieldWithConversion';
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
    <CurrencyFieldWithConversion
      {...props}
      sourceCurrency={from}
      targetCurrency={to}
      conversionFieldName="salary_conversion"
      conversionProperties={salary_conversion_properties}
      useProxy={true}
      classNamePrefix="RemoteFlows-Salary"
    />
  );
};
