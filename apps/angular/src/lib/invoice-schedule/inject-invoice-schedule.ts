import { computed, inject, signal, Signal } from '@angular/core';
import {
  injectMutation,
  injectQuery,
} from '@tanstack/angular-query-experimental';
import {
  buildCreateInvoiceScheduleSchema,
  contractorCurrenciesOptions,
  createInvoiceScheduleMutation,
  employmentOptions,
  selectContractorCurrencyCodes,
  selectEmployment,
} from '@remoteoss/remote-flows-core';
import { REMOTE_CLIENT } from '../provide-remote-flows';
import { createFormStore } from '../forms/form-store';

type InvoiceScheduleOptions = {
  employmentId: Signal<string>;
  defaultValues?: Record<string, unknown>;
};

export function injectInvoiceSchedule({
  employmentId,
  defaultValues,
}: InvoiceScheduleOptions) {
  const client = inject(REMOTE_CLIENT);

  const employment = injectQuery(() => ({
    ...employmentOptions(client, employmentId()),
    enabled: Boolean(employmentId()),
    select: selectEmployment,
  }));

  const currencies = injectQuery(() => ({
    ...contractorCurrenciesOptions(client, employmentId()),
    enabled: Boolean(employmentId()),
    select: selectContractorCurrencyCodes,
  }));

  const createSchedule = injectMutation(() =>
    createInvoiceScheduleMutation(client),
  );

  const isContractorOfRecord = computed(
    () =>
      (employment.data() as { contractor_type?: string } | undefined)
        ?.contractor_type === 'cor',
  );

  const schema = computed(() => {
    const codes = currencies.data();
    if (!codes) {
      return undefined;
    }
    return buildCreateInvoiceScheduleSchema({
      currencies: codes,
      isContractorOfRecord: isContractorOfRecord(),
      includeFieldsets: false,
    });
  });

  const store = createFormStore({
    schema: schema as Signal<Record<string, unknown> | undefined>,
    defaultValues,
  });

  const createdScheduleId = signal<string | null>(null);
  const isValidating = signal(false);

  const isLoading = computed(
    () =>
      !employmentId() ||
      employment.isPending() ||
      (currencies.isPending() && !schema()),
  );

  async function onSubmit() {
    if (isValidating() || createSchedule.isPending()) {
      return;
    }
    createdScheduleId.set(null);
    isValidating.set(true);
    try {
      const { hasErrors } = await store.submit();
      if (hasErrors) {
        return;
      }
      const values = await store.parse();
      const response = await createSchedule.mutateAsync({
        employmentId: employmentId(),
        values,
      });
      const id = response.data?.data?.successes?.[0]?.id;
      if (id) {
        createdScheduleId.set(id);
      }
    } finally {
      isValidating.set(false);
    }
  }

  return {
    fields: store.fields,
    isContractorOfRecord,
    isLoading,
    isSubmitting: computed(() => isValidating() || createSchedule.isPending()),
    createdScheduleId,
    onSubmit,
  };
}
