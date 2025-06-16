import { TextField } from '@/src/components/form/fields/TextField';
import { JSFField } from '@/src/types/remoteFlows';
import { $TSFixMe } from '@remoteoss/json-schema-form';

const DescriptionWithConversion = ({
  description,
}: {
  description?: string;
}) => {
  return (
    <span>
      {description}{' '}
      <span className="text-sm text-gray-500">(Converted to USD)</span>
    </span>
  );
};

type AnnualGrossSalaryProps = JSFField & {
  currency: string;
};

// TODO: How does the component override prop work with this?
export const AnnualGrossSalary = ({
  currency,
  description,
  ...props
}: AnnualGrossSalaryProps) => {
  console.log('AnnualGrossSalary component loaded', props);
  const desiredCurrency = 'USD';
  const canShowConversion =
    currency && desiredCurrency && currency !== desiredCurrency;

  const extraDescription = canShowConversion ? (
    <DescriptionWithConversion description={description} />
  ) : (
    description
  );
  console.log('extraDescription', extraDescription);
  console.log('canShowConversion', canShowConversion);
  return (
    <TextField
      {...props}
      description={extraDescription as $TSFixMe}
      type="text"
      inputMode="decimal"
      pattern="^[0-9.]*$"
    />
  );
};
