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

export type InvoiceSchedulePayload = Record<string, unknown>;

export type InvoiceScheduleSubmitOptions = {
  beforeSubmit?: (payload: InvoiceSchedulePayload) => Promise<void> | void;
};

export type InvoiceScheduleSubmitResult =
  | { status: 'skipped' }
  | { status: 'invalid' }
  | { status: 'created'; response: CreatedInvoiceSchedules }
  | { status: 'failed'; error: Error };

type InvoiceScheduleOptions = {
  employmentId: Signal<string>;
  defaultValues?: Record<string, unknown>;
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

  function fail(thrown: unknown): InvoiceScheduleSubmitResult {
    const error = toSubmitError(thrown);
    submitError.set(error);
    return { status: 'failed', error };
  }

  async function onSubmit({
    beforeSubmit,
  }: InvoiceScheduleSubmitOptions = {}): Promise<InvoiceScheduleSubmitResult> {
    if (error() || !schema() || isValidating() || createSchedule.isPending()) {
      return { status: 'skipped' };
    }
    createdScheduleId.set(null);
    submitError.set(null);
    isValidating.set(true);
    try {
      const { hasErrors } = await store.submit();
      if (hasErrors) {
        return { status: 'invalid' };
      }
      const values = await store.parse();
      await beforeSubmit?.(values);
      const response = await createSchedule.mutateAsync({
        employmentId: employmentId(),
        values,
      });
      if (response.error) {
        return fail(response.error);
      }
      const { id, hasFailures } = selectCreatedInvoiceSchedule(response.data);
      if (hasFailures || !response.data) {
        return fail(new Error(CREATE_FAILED_MESSAGE));
      }
      if (id) {
        createdScheduleId.set(id);
      }
      return { status: 'created', response: response.data };
    } catch (thrown) {
      return fail(thrown);
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
