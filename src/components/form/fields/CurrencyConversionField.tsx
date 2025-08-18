import { ReactNode, useState, useCallback, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { TextField } from '@/src/components/form/fields/TextField';
import { useConvertCurrency } from '@/src/flows/Onboarding/api';
import { JSFField } from '@/src/types/remoteFlows';
import { useFormFields } from '@/src/context';
import { useDebounce } from '@/src/common/hooks';

type DescriptionWithConversionProps = {
  description: ReactNode;
  showConversion: boolean;
  targetCurrency: string;
  className: string;
  onClick: (evt: React.MouseEvent<HTMLButtonElement>) => void;
};

const DescriptionWithConversion = ({
  description,
  showConversion,
  targetCurrency,
  className,
  onClick,
}: DescriptionWithConversionProps) => {
  const { components } = useFormFields();
  const label = showConversion
    ? `Hide ${targetCurrency} conversion`
    : `Show ${targetCurrency} conversion`;

  const CustomButton = components?.button;
  return (
    <span className={className}>
      {description}{' '}
      {CustomButton ? (
        <CustomButton
          className={`${className.replace('-description', '-button')}`}
          data-type="inline"
          onClick={onClick}
        >
          {label}
        </CustomButton>
      ) : (
        <button
          className={`${className.replace('-description', '-button')}`}
          onClick={onClick}
        >
          {label}
        </button>
      )}
    </span>
  );
};

export type CurrencyConversionFieldProps = JSFField & {
  sourceCurrency: string;
  targetCurrency: string;
  conversionFieldName: string;
  conversionProperties?: {
    label?: string;
    description?: ReactNode;
  };
  useProxy?: boolean;
  classNamePrefix: string;
};

export const CurrencyConversionField = ({
  sourceCurrency,
  targetCurrency,
  conversionFieldName,
  conversionProperties,
  classNamePrefix,
  description,
  ...props
}: CurrencyConversionFieldProps) => {
  const [showConversion, setShowConversion] = useState(false);
  const { setValue, watch } = useFormContext();
  const fieldValue = watch(props.name);
  const isFirstRender = useRef(true);

  const conversionCache = useRef<Map<string, { targetAmount: string }>>(
    new Map(),
  );

  const canShowConversion =
    sourceCurrency && targetCurrency && sourceCurrency !== targetCurrency;

  const { mutateAsync: convertCurrency } = useConvertCurrency();

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // when source currency changes, reset the conversion field
    setValue(conversionFieldName, '');
  }, [sourceCurrency, conversionFieldName, setValue]);

  const convertCurrencyCallback = useCallback(
    async (
      value: string,
      fromCurrency: string,
      toCurrency: string,
      targetField: string,
    ) => {
      if (!value) return;

      const cacheKey = `${fromCurrency}_${toCurrency}_${value}`;
      const cached = conversionCache.current.get(cacheKey);

      if (cached) {
        setValue(targetField, cached.targetAmount);
        return;
      }

      try {
        const response = await convertCurrency({
          source_currency: fromCurrency,
          target_currency: toCurrency,
          amount: Number(value),
        });
        if (response.data?.data?.conversion_data?.target_amount) {
          const amount = response.data.data.conversion_data.target_amount;
          if (amount) {
            setValue(targetField, amount?.toString());
            // Cache both directions
            conversionCache.current.set(cacheKey, {
              targetAmount: amount.toString(),
            });
            const reverseKey = `${toCurrency}_${fromCurrency}_${amount}`;
            conversionCache.current.set(reverseKey, {
              targetAmount: value.toString(),
            });
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
        sourceCurrency,
        targetCurrency,
        conversionFieldName,
      ),
    500,
  );
  const debouncedConvertCurrencyReverse = useDebounce(
    (value: string) =>
      convertCurrencyCallback(
        value,
        targetCurrency,
        sourceCurrency,
        props.name,
      ),
    500,
  );

  const handleMainFieldChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    if (showConversion) {
      debouncedConvertCurrency(evt.target.value);
    }
  };

  const handleConversionFieldChange = (
    evt: React.ChangeEvent<HTMLInputElement>,
  ) => {
    debouncedConvertCurrencyReverse(evt.target.value);
  };

  const toggleConversion = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    setShowConversion((prev) => !prev);

    if (!showConversion && fieldValue) {
      debouncedConvertCurrency(fieldValue);
    }
  };

  const extraDescription = canShowConversion ? (
    <DescriptionWithConversion
      targetCurrency={targetCurrency}
      description={description}
      showConversion={showConversion}
      className={`${classNamePrefix}-description`}
      onClick={toggleConversion}
    />
  ) : (
    description
  );

  return (
    <>
      <TextField
        {...props}
        additionalProps={{ currency: sourceCurrency }}
        description={extraDescription}
        type="text"
        inputMode="decimal"
        pattern="^[0-9.]*$"
        maxLength={15}
        onChange={handleMainFieldChange}
      />
      {showConversion && (
        <TextField
          additionalProps={{ currency: targetCurrency }}
          name={conversionFieldName}
          label={conversionProperties?.label || 'Conversion'}
          description={conversionProperties?.description}
          type="text"
          inputMode="decimal"
          pattern="^[0-9.]*$"
          maxLength={15}
          onChange={handleConversionFieldChange}
        />
      )}
    </>
  );
};
