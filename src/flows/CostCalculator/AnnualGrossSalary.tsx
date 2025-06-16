import { TextField } from '@/src/components/form/fields/TextField';
import { JSFField } from '@/src/types/remoteFlows';
import { $TSFixMe } from '@remoteoss/json-schema-form';
import { useState } from 'react';

type DescriptionWithConversionProps = {
  description: string;
  showConversion: boolean;
  currency: string;
  onClick: (evt: React.MouseEvent<HTMLButtonElement>) => void;
};

const DescriptionWithConversion = ({
  description,
  showConversion,
  currency,
  onClick,
}: DescriptionWithConversionProps) => {
  const label = showConversion
    ? `Hide ${currency} conversion`
    : `Show ${currency} conversion`;
  return (
    <span>
      {description} <button onClick={onClick}>{label}</button>
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
  const [showConversion, setShowConversion] = useState(false);
  const desiredCurrency = 'USD';
  const canShowConversion =
    currency && desiredCurrency && currency !== desiredCurrency;

  const extraDescription = canShowConversion ? (
    <DescriptionWithConversion
      currency={desiredCurrency}
      description={description}
      showConversion={showConversion}
      onClick={(evt) => {
        evt.preventDefault();
        setShowConversion(!showConversion);
      }}
    />
  ) : (
    description
  );
  console.log('extraDescription', extraDescription);
  console.log('canShowConversion', canShowConversion);
  console.log({ showConversion });
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
