import { TextField } from '@/src/components/form/fields/TextField';
import { useConvertCurrency } from '@/src/flows/Onboarding/api';
import { JSFField } from '@/src/types/remoteFlows';
import { ReactNode, useState } from 'react';
import { useFormContext } from 'react-hook-form';

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
  const [annualGrossSalary, setAnnualGrossSalary] = useState('');
  const [showConversion, setShowConversion] = useState(false);
  const { setValue } = useFormContext();

  const canShowConversion =
    currency && desiredCurrency && currency !== desiredCurrency;

  const { mutateAsync: convertCurrency } = useConvertCurrency();

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setAnnualGrossSalary(evt.target.value);
  };

  const toggleConversion = async (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    setShowConversion((prev) => !prev);

    if (!showConversion) {
      try {
        const response = await convertCurrency({
          source_currency: currency,
          target_currency: desiredCurrency,
          amount: Number(annualGrossSalary),
        });

        console.log('response', { response });

        if (response.data?.data?.conversion_data?.target_amount) {
          const amount = response.data.data.conversion_data.target_amount;
          setValue('annual_gross_salary_conversion', amount?.toString() || '');
        }
      } catch (error) {
        console.error('Error converting currency:', error);
      }
    }
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
        onChange={handleChange}
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
