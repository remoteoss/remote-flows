import { ReactNode, useState, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { TextField } from '@/src/components/form/fields/TextField';
import { useConvertCurrency } from '@/src/flows/Onboarding/api';
import { JSFField } from '@/src/types/remoteFlows';
import { useFormFields } from '@/src/context';
import { useDebounce } from '@/src/common/hooks';

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
  const { components } = useFormFields();
  const label = showConversion
    ? `Hide ${currency} conversion`
    : `Show ${currency} conversion`;

  const CustomButton = components?.button;

  return (
    <span className="RemoteFlows-AnnualGrossSalary-description">
      {description}{' '}
      {CustomButton ? (
        <CustomButton
          className="RemoteFlows-AnnualGrossSalary-button"
          data-type="inline"
          onClick={onClick}
        >
          {label}
        </CustomButton>
      ) : (
        <button
          className="RemoteFlows-AnnualGrossSalary-button"
          onClick={onClick}
        >
          {label}
        </button>
      )}
    </span>
  );
};

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
  description,
  ...props
}: AnnualGrossSalaryProps) => {
  const [showConversion, setShowConversion] = useState(false);
  const { setValue, watch } = useFormContext();
  const annualGrossSalary = watch(props.name);

  const canShowConversion =
    currency && desiredCurrency && currency !== desiredCurrency;

  const { mutateAsync: convertCurrency } = useConvertCurrency();

  const convertCurrencyCallback = useCallback(
    async (
      value: string,
      sourceCurrency: string,
      targetCurrency: string,
      targetField: string,
    ) => {
      if (!value) return;

      try {
        const response = await convertCurrency({
          source_currency: sourceCurrency,
          target_currency: targetCurrency,
          amount: Number(value),
        });
        if (response.data?.data?.conversion_data?.target_amount) {
          const amount = response.data.data.conversion_data.target_amount;
          if (amount) {
            setValue(targetField, amount?.toString());
          }
        }
      } catch (error) {
        console.error('Error converting currency:', error);
      }
    },
    [convertCurrency, setValue],
  );

  const debouncedConvertCurrency = useDebounce(
    (value: string) =>
      convertCurrencyCallback(
        value,
        currency,
        desiredCurrency,
        'annual_gross_salary_conversion',
      ),
    500,
  );
  const debouncedConvertCurrencyReverse = useDebounce(
    (value: string) =>
      convertCurrencyCallback(value, desiredCurrency, currency, props.name),
    500,
  );

  const handleAnnualGrossSalaryChange = (
    evt: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (showConversion) {
      debouncedConvertCurrency(evt.target.value);
    }
  };

  const handleConversionChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    debouncedConvertCurrencyReverse(evt.target.value);
  };

  const toggleConversion = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    setShowConversion((prev) => !prev);

    if (!showConversion && annualGrossSalary) {
      debouncedConvertCurrency(annualGrossSalary);
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

  const { annual_gross_salary_conversion_properties: conversionField } = props;

  return (
    <>
      <TextField
        {...props}
        additionalProps={{ currency: currency }}
        description={extraDescription}
        type="text"
        inputMode="decimal"
        pattern="^[0-9.]*$"
        onChange={handleAnnualGrossSalaryChange}
      />
      {/** A problem on this field is that the label, description are fixed. */}
      {showConversion && (
        <TextField
          additionalProps={{ currency: desiredCurrency }}
          name="annual_gross_salary_conversion"
          label={conversionField?.label || 'Conversion'}
          description={
            conversionField?.description ||
            'Estimated amount. This is an estimation. We calculate conversions based on spot rates that are subject to fluctuation over time.'
          }
          type="text"
          inputMode="decimal"
          pattern="^[0-9.]*$"
          onChange={handleConversionChange}
        />
      )}
    </>
  );
};
