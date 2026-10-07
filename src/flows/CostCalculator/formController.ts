import { useSyncExternalStore } from 'react';
import { UseFormReturn } from 'react-hook-form';
import type { CostCalculatorEstimateResponse } from '@/src/client';
import type { useCostCalculator } from '@/src/flows/CostCalculator/hooks';
import {
  CostCalculatorEstimationFormValues,
  CostCalculatorEstimationSubmitValues,
} from '@/src/flows/CostCalculator/types';
import {
  FieldError,
  NormalizedFieldError,
  normalizeFieldErrors,
} from '@/src/lib/mutations';
import { prettifyFormValues } from '@/src/lib/utils';
import { $TSFixMe } from '@/src/types/remoteFlows';

type FormValues = CostCalculatorEstimationFormValues;

export type CostCalculatorSubmitResult =
  | { status: 'success'; data: CostCalculatorEstimateResponse }
  | { status: 'invalid'; errors: Partial<Record<keyof FormValues, string>> }
  | {
      status: 'error';
      error: Error;
      fieldErrors: NormalizedFieldError[];
      rawError: Record<string, unknown>;
    };

export type CostCalculatorFormController = {
  /**
   * Returns a snapshot of the current form values. The reference only changes when a value changes.
   */
  getValues: () => FormValues;
  /**
   * Sets a field value the same way a user would: it runs the field's side effects
   * (e.g. changing `country` loads its regions and currency) and revalidates after a failed submit.
   */
  setValue: <K extends keyof FormValues>(name: K, value: FormValues[K]) => void;
  /**
   * Sets several fields at once, in the order given.
   */
  setValues: (values: Partial<FormValues>) => void;
  /**
   * Calls `listener` with the new values every time any value changes. Returns an unsubscribe function.
   */
  subscribe: (listener: (values: FormValues) => void) => () => void;
  /**
   * Validates the current values and requests an estimation, without needing `CostCalculatorForm` to be rendered.
   */
  submit: () => Promise<CostCalculatorSubmitResult>;
};

type CostCalculatorBag = ReturnType<typeof useCostCalculator>;

const cloneValues = (values: unknown) =>
  JSON.parse(JSON.stringify(values ?? {})) as FormValues;

export function createCostCalculatorFormController(
  form: UseFormReturn<$TSFixMe>,
  initialBag: CostCalculatorBag,
) {
  let bag = initialBag;
  let snapshot = cloneValues(form.getValues());
  let hasSubmitted = false;
  const listeners = new Set<(values: FormValues) => void>();

  const publish = (values: unknown) => {
    snapshot = cloneValues(values);
    listeners.forEach((listener) => listener(snapshot));
  };

  const connect = () => {
    const subscription = form.watch(publish);
    // Child fields write values in their own effects, which run before this one subscribes.
    publish(form.getValues());
    return () => subscription.unsubscribe();
  };

  const setValue: CostCalculatorFormController['setValue'] = (name, value) => {
    form.setValue(name as string, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: hasSubmitted || form.formState.isSubmitted,
    });
    const field = bag.fields.find((field) => field.name === name) as
      | { onChange?: (value: unknown) => void }
      | undefined;
    field?.onChange?.(value);
  };

  const submit = async (): Promise<CostCalculatorSubmitResult> => {
    hasSubmitted = true;
    const isValid = await form.trigger();
    if (!isValid) {
      const errors = Object.fromEntries(
        Object.entries(form.formState.errors).map(([name, error]) => [
          name,
          String(error?.message ?? ''),
        ]),
      );
      return { status: 'invalid', errors };
    }

    const parsedValues = (await bag.parseFormValues(
      form.getValues(),
    )) as CostCalculatorEstimationSubmitValues;

    if (bag.meta?.fields) {
      bag.meta.fields = prettifyFormValues(parsedValues, bag.fields);
      bag.meta.fields['employer_currency_slug'] = bag.meta.fields['currency'];
    }

    const result = (await bag
      .onSubmit(parsedValues)
      .catch((error: unknown) => error)) as $TSFixMe;
    if (result?.data && !result.error) {
      return { status: 'success', data: result.data };
    }

    return {
      status: 'error',
      error:
        result?.error instanceof Error
          ? result.error
          : new Error('Something went wrong. Please try again later.'),
      fieldErrors: normalizeFieldErrors(
        result?.fieldErrors as FieldError[],
        bag.meta?.fields,
      ),
      rawError: result?.rawError as Record<string, unknown>,
    };
  };

  const controller: CostCalculatorFormController = {
    getValues: () => snapshot,
    setValue,
    setValues: (values) => {
      (Object.keys(values) as (keyof FormValues)[]).forEach((name) =>
        setValue(name, values[name] as FormValues[typeof name]),
      );
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    submit,
  };

  const setBag = (nextBag: CostCalculatorBag) => {
    bag = nextBag;
  };

  return { controller, connect, setBag };
}

/**
 * Re-renders when the cost calculator's form values change.
 * Pass a field name to only re-render when that field changes.
 */
export function useCostCalculatorFormValues(
  form: CostCalculatorFormController,
): FormValues;
export function useCostCalculatorFormValues<K extends keyof FormValues>(
  form: CostCalculatorFormController,
  name: K,
): FormValues[K];
export function useCostCalculatorFormValues<K extends keyof FormValues>(
  form: CostCalculatorFormController,
  name?: K,
) {
  return useSyncExternalStore(form.subscribe, () =>
    name ? form.getValues()[name] : form.getValues(),
  );
}
