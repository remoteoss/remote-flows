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
  isContractorOfRecord as isContractorOfRecordEmployment,
  selectContractorCurrencyCodes,
  selectCreatedInvoiceSchedule,
  selectEmployment,
} from '@remoteoss/remote-flows-core';
import { REMOTE_CLIENT } from '../../provide-remote-flows';
import { createFormStore } from '../../forms/form-store';

export type CreatedInvoiceSchedules = NonNullable<
  Parameters<typeof selectCreatedInvoiceSchedule>[0]
>;

type InvoiceScheduleOptions = {
  employmentId: Signal<string>;
  defaultValues?: Record<string, unknown>;
  onSuccess?: (response: CreatedInvoiceSchedules) => void;
  onError?: (error: Error) => void;
};

function rejectOnError<T extends { error?: unknown; response?: Response }>(
  queryFn: () => Promise<T>,
) {
  return async () => {
    const result = await queryFn();
    if (result.error) {
      throw new Error(
        `Request failed with status ${result.response?.status ?? 'unknown'}`,
      );
    }
    return result;
  };
}

const CREATE_FAILED_MESSAGE = 'Failed to create invoice schedule';

function toSubmitError(thrown: unknown) {
  if (thrown instanceof Error) {
    return thrown;
  }
  const body = thrown as {
    message?: unknown;
    error?: { message?: unknown };
  } | null;
  const message = body?.error?.message ?? body?.message;
  return new Error(
    typeof message === 'string' ? message : CREATE_FAILED_MESSAGE,
  );
}

export function injectInvoiceSchedule({
  employmentId,
  defaultValues,
  onSuccess,
  onError,
}: InvoiceScheduleOptions) {
  const client = inject(REMOTE_CLIENT);

  const employment = injectQuery(() => {
    const options = employmentOptions(client, employmentId());
    return {
      ...options,
      queryFn: rejectOnError(options.queryFn),
      enabled: Boolean(employmentId()),
      select: selectEmployment,
    };
  });

  const currencies = injectQuery(() => {
    const options = contractorCurrenciesOptions(client, employmentId());
    return {
      ...options,
      queryFn: rejectOnError(options.queryFn),
      retry: false as const,
      enabled: Boolean(employmentId()),
      select: selectContractorCurrencyCodes,
    };
  });

  const createSchedule = injectMutation(() =>
    createInvoiceScheduleMutation(client),
  );

  const isContractorOfRecord = computed(() =>
    isContractorOfRecordEmployment(employment.data()),
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
  const submitError = signal<Error | null>(null);
  const isValidating = signal(false);

  const error = computed(
    () => employment.error() ?? currencies.error() ?? null,
  );

  const isLoading = computed(
    () =>
      !employmentId() ||
      employment.isPending() ||
      (currencies.isPending() && !schema()),
  );

  function fail(thrown: unknown) {
    const failure = toSubmitError(thrown);
    submitError.set(failure);
    onError?.(failure);
  }

  async function onSubmit() {
    if (error() || !schema() || isValidating() || createSchedule.isPending()) {
      return;
    }
    createdScheduleId.set(null);
    submitError.set(null);
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
      if (response.error) {
        fail(response.error);
        return;
      }
      const { id, hasFailures } = selectCreatedInvoiceSchedule(response.data);
      if (hasFailures) {
        fail(new Error(CREATE_FAILED_MESSAGE));
        return;
      }
      if (id) {
        createdScheduleId.set(id);
      }
      if (response.data) {
        onSuccess?.(response.data);
      }
    } catch (thrown) {
      fail(thrown);
    } finally {
      isValidating.set(false);
    }
  }

  return {
    fields: store.fields,
    isContractorOfRecord,
    isLoading,
    error,
    isSubmitting: computed(() => isValidating() || createSchedule.isPending()),
    createdScheduleId,
    submitError: submitError.asReadonly(),
    onSubmit,
  };
}
