import { TextField } from '@/src/components/form/fields/TextField';
import { useConvertCurrency } from '@/src/flows/Onboarding/api';
import { JSFField } from '@/src/types/remoteFlows';
import { ReactNode, useState, useCallback, useRef, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import debounce from 'lodash/debounce';
import { useFormFields } from '@/src/context';

function useDebounce(
  callback: (value: string) => Promise<void>,
  delay: number,
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedFn = useRef(
    debounce((value: string) => {
      callbackRef.current(value);
    }, delay),
  ).current;

  return useCallback(
    (value: string) => {
      debouncedFn(value);
    },
    [debouncedFn],
  );
}

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
};

// TODO: How does the component override prop work with this?
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
    async (value: string) => {
      if (!value) return;

      try {
        const response = await convertCurrency({
          source_currency: currency,
          target_currency: desiredCurrency,
          amount: Number(value),
        });
        if (response.data?.data?.conversion_data?.target_amount) {
          const amount = response.data.data.conversion_data.target_amount;
          setValue('annual_gross_salary_conversion', amount?.toString() || '');
        }
      } catch (error) {
        console.error('Error converting currency:', error);
      }
    },
    [currency, desiredCurrency, convertCurrency, setValue],
  );

  const convertCurrencyReverseCallback = useCallback(
    async (value: string) => {
      if (!value) return;

      try {
        const response = await convertCurrency({
          source_currency: desiredCurrency,
          target_currency: currency,
          amount: Number(value),
        });
        if (response.data?.data?.conversion_data?.target_amount) {
          const amount = response.data.data.conversion_data.target_amount;
          setValue(props.name, amount?.toString() || '');
        }
      } catch (error) {
        console.error('Error converting currency:', error);
      }
    },
    [currency, desiredCurrency, convertCurrency, setValue, props.name],
  );

  const debouncedConvertCurrency = useDebounce(convertCurrencyCallback, 500);
  const debouncedConvertCurrencyReverse = useDebounce(
    convertCurrencyReverseCallback,
    500,
  );

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
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
          onChange={handleConversionChange}
        />
      )}
    </>
  );
};
