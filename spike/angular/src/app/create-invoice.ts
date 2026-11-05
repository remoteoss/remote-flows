import { computed, signal, Signal } from '@angular/core';
import { buildCreateInvoiceScheduleSchema } from '@/src/common/invoice-schedules/json-schema';
import { clearBase64Data } from '@/src/lib/utils';
import {
  injectContractorCurrencies,
  injectCreateInvoiceSchedule,
  injectEmployment,
  injectPreviewContractorInvoice,
} from './api';
import { createFormStore } from './form-store';

type CreateInvoiceOptions = {
  employmentId: Signal<string>;
  defaultValues?: Record<string, unknown>;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Headless Angular counterpart of `useInvoiceSchedule`: same schema builder, same payload
 * builders, TanStack Query for the API calls, signals for the form.
 */
export function injectCreateInvoice({
  employmentId,
  defaultValues,
}: CreateInvoiceOptions) {
  const employment = injectEmployment(employmentId);
  const currencies = injectContractorCurrencies(employmentId);
  const createSchedule = injectCreateInvoiceSchedule();
  const previewInvoice = injectPreviewContractorInvoice();

  const isContractorOfRecord = computed(
    () =>
      (employment.data() as { contractor_type?: string } | undefined)
        ?.contractor_type === 'cor',
  );

  const schema = computed(() => {
    const list = currencies.data();
    if (!list) {
      return undefined;
    }
    return buildCreateInvoiceScheduleSchema({
      currencies: (list as unknown as { code: string }[]).map(
        (currency) => currency.code,
      ),
      isContractorOfRecord: isContractorOfRecord(),
      includeFieldsets: false,
    });
  });

  const store = createFormStore({
    schema: schema as Signal<Record<string, unknown> | undefined>,
    defaultValues: signal(defaultValues ?? {}),
  });

  const createdScheduleId = signal<string | null>(null);
  const error = signal<string | null>(null);

  const isLoading = computed(
    () =>
      !employmentId() ||
      employment.isPending() ||
      (currencies.isPending() && !schema()),
  );

  const loadError = computed(() => {
    const failure = employment.error() ?? currencies.error();
    return failure ? errorMessage(failure) : null;
  });

  async function onSubmit() {
    error.set(null);
    createdScheduleId.set(null);
    const { hasErrors } = await store.submit();
    if (hasErrors) {
      return;
    }
    try {
      const values = await store.parse();
      const response = await createSchedule.mutateAsync({
        employmentId: employmentId(),
        values,
      });
      createdScheduleId.set(
        response.data?.data?.successes?.[0]?.id ?? 'unknown',
      );
    } catch (failure) {
      error.set(errorMessage(failure));
    }
  }

  async function onPreview() {
    error.set(null);
    const { hasErrors } = await store.submit();
    if (hasErrors) {
      return undefined;
    }
    try {
      const values = await store.parse();
      const response = await previewInvoice.mutateAsync({
        employmentId: employmentId(),
        values,
      });
      const content = (
        response.data?.data?.contractor_invoice_preview as unknown as
          | { content: string }
          | undefined
      )?.content;
      return content ? clearBase64Data(content) : undefined;
    } catch (failure) {
      error.set(errorMessage(failure));
      return undefined;
    }
  }

  return {
    fields: store.fields,
    values: store.values,
    formErrors: store.formErrors,
    employment: employment.data,
    isContractorOfRecord,
    isLoading,
    loadError,
    isSubmitting: createSchedule.isPending,
    isPreviewing: previewInvoice.isPending,
    createdScheduleId,
    error,
    onSubmit,
    onPreview,
  };
}
