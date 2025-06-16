import { TextField } from '@/src/components/form/fields/TextField';
import { JSFField } from '@/src/types/remoteFlows';
import { ReactNode, useState } from 'react';

type DescriptionWithConversionProps = {
  description: ReactNode;
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
  desiredCurrency: string;
};

// TODO: How does the component override prop work with this?
export const AnnualGrossSalary = ({
  currency,
  desiredCurrency,
  description,
  ...props
}: AnnualGrossSalaryProps) => {
  const [showConversion, setShowConversion] = useState(false);
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
      {showConversion && (
        <TextField
          name="annual_gross_salary_conversion"
          label="Conversion"
          description={
            'Estimated amount. This is an estimation. We calculate conversions based on spot rates that are subject to fluctuation over time.'
          }
          type="text"
          inputMode="decimal"
          pattern="^[0-9.]*$"
        />
      )}
    </>
  );
};
