import { ReactNode, useState, useCallback, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import omit from 'lodash.omit';
import { TextField } from '@/src/components/form/fields/TextField';
import { useConvertCurrency } from '@/src/flows/Onboarding/api';
import { JSFField } from '@/src/types/remoteFlows';
import { HelpCenterDataProps } from '@/src/types/fields';
import { useFormFields } from '@/src/context';
import { useDebounce } from '@/src/common/hooks';
import { FormDescription } from '@/src/components/ui/form';
import { HelpCenter } from '@/src/components/shared/zendesk-drawer/HelpCenter';
import {
  convertFromCents,
  convertToCents,
  round,
} from '@/src/components/form/utils';

type DescriptionWithConversionProps = {
  description: ReactNode;
  helpCenter: ReactNode;
  toggle: ReactNode;
  className: string;
};

const DescriptionWithConversion = ({
  description,
  helpCenter,
  toggle,
  className,
}: DescriptionWithConversionProps) => (
  <span className={className}>
    <FormDescription as='span' helpCenter={helpCenter}>
      {description}
    </FormDescription>{' '}
    {toggle}
  </span>
);

type ConversionToggleProps = {
  showConversion: boolean;
  targetCurrency: string;
  className: string;
  onClick: (evt: React.MouseEvent<HTMLButtonElement>) => void;
};

const ConversionToggle = ({
  showConversion,
  targetCurrency,
  className,
  onClick,
}: ConversionToggleProps) => {
  const { components } = useFormFields();
  const label = showConversion
    ? `Hide ${targetCurrency} conversion`
    : `Show ${targetCurrency} conversion`;

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error(`Button component not found`);
  }

  return (
    <CustomButton className={className} data-type='inline' onClick={onClick}>
      {label}
    </CustomButton>
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
  meta?: {
    helpCenter?: HelpCenterDataProps;
  };
  /**
   * Enabled by the 'split_salary_description' feature flag. When on, the description, the help
   * center link and the conversion toggle are handed to the text component as three separate
   * slots instead of being packed into the description node.
   */
  splitDescription?: boolean;
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
  meta,
  splitDescription = false,
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

  const conversionToggle = canShowConversion ? (
    <ConversionToggle
      targetCurrency={targetCurrency}
      showConversion={showConversion}
      className={`${classNamePrefix}-button`}
      onClick={toggleConversion}
    />
  ) : null;

  // With the split_salary_description feature, the toggle is handed over as a separate slot so the
  // text component stays free to render the description, the help center link and the toggle
  // however it wants. Without it, we keep packing them into the description node: it's the only
  // slot every text component is known to render, so the toggle can't get lost. The help center
  // link is then rendered by us and stripped from the meta we forward, to avoid rendering it twice
  // (FormDescription appends it after its children, which would put it after the toggle).
  const descriptionProps = splitDescription
    ? { meta, description, descriptionSuffix: conversionToggle }
    : {
        meta: conversionToggle ? omit(meta, 'helpCenter') : meta,
        description: conversionToggle ? (
          <DescriptionWithConversion
            description={description}
            helpCenter={<HelpCenter helpCenter={meta?.helpCenter} />}
            toggle={conversionToggle}
            className={`${classNamePrefix}-description`}
          />
        ) : (
          description
        ),
      };

  return (
    <>
      <TextField
        {...props}
        {...descriptionProps}
        name={mainFieldName || props.name}
        additionalProps={{ currency: sourceCurrency }}
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
