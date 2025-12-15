import { ReactNode, useState, useCallback, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { TextField } from '@/src/components/form/fields/TextField';
import { useConvertCurrency } from '@/src/flows/Onboarding/api';
import { JSFField } from '@/src/types/remoteFlows';
import { useFormFields } from '@/src/context';
import { useDebounce } from '@/src/common/hooks';
import { FormDescription } from '@/src/components/ui/form';
import { ButtonDefault } from '@/src/components/form/fields/default/ButtonDefault';
import {
  convertFromCents,
  convertToCents,
  round,
} from '@/src/components/form/utils';

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

  const CustomButton = components?.button || ButtonDefault;
  return (
    <span className={className}>
      <FormDescription as='span'>{description}</FormDescription>{' '}
      <CustomButton
        className={`${className.replace('-description', '-button')}`}
        data-type='inline'
        onClick={onClick}
      >
        {label}
      </CustomButton>
    </span>
  );
};

export type CurrencyConversionFieldProps = JSFField & {
  sourceCurrency: string;
  targetCurrency: string;
  mainFieldName?: string;
  conversionFieldName: string;
  conversionProperties?: {
    label?: string;
    description?: ReactNode;
  };
  useProxy?: boolean;
  classNamePrefix: string;
  conversionType?: 'spread' | 'no_spread';
};

export const CurrencyConversionField = ({
  sourceCurrency,
  targetCurrency,
  mainFieldName,
  conversionFieldName,
  conversionProperties,
  classNamePrefix,
  description,
  conversionType = 'spread',
  ...props
}: CurrencyConversionFieldProps) => {
  const [showConversion, setShowConversion] = useState(false);
  const { setValue, watch } = useFormContext();
  const fieldValue = watch(mainFieldName || props.name);
  const isFirstRender = useRef(true);

  const canShowConversion =
    sourceCurrency && targetCurrency && sourceCurrency !== targetCurrency;

  const { mutateAsync: convertCurrency } = useConvertCurrency({
    type: conversionType,
  });

  // we keep track of the last input the user used, so we can make sure
  // we keep consistent currency rates
  const lastInputFieldName = `${props.name}_converted`;
  useEffect(() => {
    setValue(lastInputFieldName, mainFieldName || props.name);
  }, [setValue, mainFieldName, props.name, lastInputFieldName]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // when source currency changes, reset the conversion field
    setValue(conversionFieldName, '');
  }, [sourceCurrency, conversionFieldName, setValue]);

  const convertCurrencyCallback = useCallback(
    async (amount: number | null, fromCurrency: string, toCurrency: string) => {
      if (!amount || isNaN(amount) || amount <= 0) return;

      return convertCurrency({
        source_currency: fromCurrency,
        target_currency: toCurrency,
        amount,
      });
    },
    [convertCurrency],
  );

  const debouncedConvertCurrency = useDebounce(async (value: string) => {
    // The SDK sets the employer billing currency in the salary field, but internally we don't do it like this, is set based on the employee billing currency
    // That's why we need to do 1 / exchange rate to get the correct amount, if currencies were different, it would be done in the debouncedConvertCurrencyReverse
    // THE BE always transforms from the target currency to the source currency
    const amountInCents = convertToCents(value);
    const conversion = await convertCurrencyCallback(
      amountInCents,
      targetCurrency,
      sourceCurrency,
    );

    const exchangeRate =
      1 / (conversion?.data?.data.conversion_data?.exchange_rate ?? 1);

    const amount = round(Number(amountInCents) * exchangeRate);

    setValue(conversionFieldName, convertFromCents(amount));
  }, 500);

  const debouncedConvertCurrencyReverse = useDebounce(async (value: string) => {
    const amount = convertToCents(value);
    const conversion = await convertCurrencyCallback(
      amount,
      targetCurrency,
      sourceCurrency,
    );

    const conversionAmount =
      conversion?.data?.data.conversion_data.target_amount;

    setValue(mainFieldName || props.name, convertFromCents(conversionAmount));
  }, 500);

  const handleMainFieldChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setValue(lastInputFieldName, mainFieldName || props.name);
    if (showConversion) {
      debouncedConvertCurrency(evt.target.value);
    }
  };

  const handleConversionFieldChange = (
    evt: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setValue(lastInputFieldName, conversionFieldName);
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
        name={mainFieldName || props.name}
        additionalProps={{ currency: sourceCurrency }}
        description={extraDescription}
        type='text'
        inputMode='decimal'
        pattern='^[0-9.]*$'
        maxLength={15}
        onChange={handleMainFieldChange}
      />
      {showConversion && (
        <TextField
          additionalProps={{ currency: targetCurrency }}
          name={conversionFieldName}
          label={conversionProperties?.label || 'Conversion'}
          description={conversionProperties?.description}
          type='text'
          inputMode='decimal'
          pattern='^[0-9.]*$'
          maxLength={15}
          onChange={handleConversionFieldChange}
        />
      )}
      <input
        type='hidden'
        name={lastInputFieldName}
        value={watch(lastInputFieldName) || mainFieldName || props.name}
      />
    </>
  );
};
