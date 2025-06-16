import { TextField } from '@/src/components/form/fields/TextField';
import { JSFField } from '@/src/types/remoteFlows';
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

type AnnualGrossSalaryProps = Omit<JSFField, 'description'> & {
  currency: string;
  description: string;
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

  const toggleConversion = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    setShowConversion((prev) => !prev);
  };

  const extraDescription = canShowConversion ? (
    <DescriptionWithConversion
      currency={desiredCurrency}
      description={description}
      showConversion={showConversion}
      onClick={toggleConversion}
    />
  ) : (
    description
  );

  return (
    <>
      <TextField
        {...props}
        description={extraDescription}
        type="text"
        inputMode="decimal"
        pattern="^[0-9.]*$"
      />
      {showConversion && <p>hello</p>}
    </>
  );
};
