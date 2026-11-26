import { computed, inject, signal, Signal } from '@angular/core';
import {
  injectMutation,
  injectQuery,
} from '@tanstack/angular-query-experimental';
import {
  buildCreateInvoiceScheduleSchema,
  buildInvoiceNumberSequenceModify,
  contractorCurrenciesOptions,
  contractorInvoiceSequenceOptions,
  createInvoiceScheduleMutation,
  type ContractorInvoicePreview,
  employmentOptions,
  isContractorOfRecord as isContractorOfRecordEmployment,
  previewContractorInvoiceMutation,
  selectContractorCurrencyCodes,
  selectContractorInvoicePreview,
  selectCreatedInvoiceSchedule,
  selectEmployment,
  selectInvoiceNumberSequenceText,
} from '@remoteoss/remote-flows-core';
import { REMOTE_CLIENT } from '../../provide-remote-flows';
import { createFormStore } from '../../forms/form-store';

export type CreatedInvoiceSchedules = NonNullable<
  Parameters<typeof selectCreatedInvoiceSchedule>[0]
>;

export type InvoiceSchedulePayload = Record<string, unknown>;

export type InvoiceSchedulePreview = ContractorInvoicePreview;

export type InvoiceSchedulePreviewResult =
  | { status: 'skipped' }
  | { status: 'invalid' }
  | { status: 'previewed'; preview: InvoiceSchedulePreview }
  | { status: 'failed'; error: Error };

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
const PREVIEW_FAILED_MESSAGE = 'Failed to preview invoice';

function toSubmitError(thrown: unknown, fallback = CREATE_FAILED_MESSAGE) {
  if (thrown instanceof Error) {
    return thrown;
  }
  const body = thrown as {
    message?: unknown;
    error?: { message?: unknown };
  } | null;
  const message = body?.error?.message ?? body?.message;
  return new Error(typeof message === 'string' ? message : fallback);
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

  const sequence = injectQuery(() => ({
    ...contractorInvoiceSequenceOptions(client),
    select: selectInvoiceNumberSequenceText,
  }));

  const createSchedule = injectMutation(() =>
    createInvoiceScheduleMutation(client),
  );

  const previewSchedule = injectMutation(() =>
    previewContractorInvoiceMutation(client),
  );

  const isContractorOfRecord = computed(() =>
    isContractorOfRecordEmployment(employment.data()),
  );

  const invoiceNumberSequence = computed(() => sequence.data() ?? undefined);

  const schema = computed(() => {
    const codes = currencies.data();
    if (!codes || sequence.isPending()) {
      return undefined;
    }
    return buildCreateInvoiceScheduleSchema({
      currencies: codes,
      isContractorOfRecord: isContractorOfRecord(),
      includeFieldsets: false,
      invoiceNumberSequence: invoiceNumberSequence(),
    });
  });

  const store = createFormStore({
    schema: schema as Signal<Record<string, unknown> | undefined>,
    defaultValues,
    options: computed(() => ({
      jsfModify: buildInvoiceNumberSequenceModify(invoiceNumberSequence()),
    })),
  });

  const result = signal<InvoiceScheduleSubmitResult | null>(null);
  const isValidating = signal(false);
  const previewResult = signal<InvoiceSchedulePreviewResult | null>(null);
  const isPreviewValidating = signal(false);

  const isSubmitting = computed(
    () => isValidating() || createSchedule.isPending(),
  );
  const isPreviewing = computed(
    () => isPreviewValidating() || previewSchedule.isPending(),
  );

  const createdScheduleId = computed(() => {
    const current = result();
    return current?.status === 'created'
      ? (selectCreatedInvoiceSchedule(current.response).id ?? null)
      : null;
  });

  const submitError = computed(() => {
    const current = result();
    return current?.status === 'failed' ? current.error : null;
  });

  const preview = computed(() => {
    const current = previewResult();
    return current?.status === 'previewed' ? current.preview : null;
  });

  const previewError = computed(() => {
    const current = previewResult();
    return current?.status === 'failed' ? current.error : null;
  });

  const error = computed(
    () => employment.error() ?? currencies.error() ?? null,
  );

  const isLoading = computed(
    () =>
      !employmentId() ||
      employment.isPending() ||
      sequence.isPending() ||
      (currencies.isPending() && !schema()),
  );

  function fail(thrown: unknown): InvoiceScheduleSubmitResult {
    return { status: 'failed', error: toSubmitError(thrown) };
  }

  async function submit({
    beforeSubmit,
  }: InvoiceScheduleSubmitOptions): Promise<InvoiceScheduleSubmitResult> {
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
      const { hasFailures } = selectCreatedInvoiceSchedule(response.data);
      if (hasFailures || !response.data) {
        return fail(new Error(CREATE_FAILED_MESSAGE));
      }
      return { status: 'created', response: response.data };
    } catch (thrown) {
      return fail(thrown);
    }
  }

  async function onSubmit(
    options: InvoiceScheduleSubmitOptions = {},
  ): Promise<InvoiceScheduleSubmitResult> {
    if (error() || !schema() || isValidating() || createSchedule.isPending()) {
      return { status: 'skipped' };
    }
    result.set(null);
    isValidating.set(true);
    try {
      const outcome = await submit(options);
      result.set(outcome);
      return outcome;
    } finally {
      isValidating.set(false);
    }
  }

  async function requestPreview(): Promise<InvoiceSchedulePreviewResult> {
    try {
      const { hasErrors } = await store.submit();
      if (hasErrors) {
        return { status: 'invalid' };
      }
      const values = await store.parse();
      const response = await previewSchedule.mutateAsync({
        employmentId: employmentId(),
        values,
      });
      if (response.error) {
        return {
          status: 'failed',
          error: toSubmitError(response.error, PREVIEW_FAILED_MESSAGE),
        };
      }
      const document = selectContractorInvoicePreview(response.data);
      if (!document) {
        return { status: 'failed', error: new Error(PREVIEW_FAILED_MESSAGE) };
      }
      return { status: 'previewed', preview: document };
    } catch (thrown) {
      return {
        status: 'failed',
        error: toSubmitError(thrown, PREVIEW_FAILED_MESSAGE),
      };
    }
  }

  async function previewInvoice(): Promise<InvoiceSchedulePreviewResult> {
    if (error() || !schema() || isPreviewing() || isSubmitting()) {
      return { status: 'skipped' };
    }
    previewResult.set(null);
    isPreviewValidating.set(true);
    try {
      const outcome = await requestPreview();
      previewResult.set(outcome);
      return outcome;
    } finally {
      isPreviewValidating.set(false);
    }
  }

  return {
    fields: store.fields,
    isContractorOfRecord,
    isLoading,
    error,
    isSubmitting,
    result: result.asReadonly(),
    createdScheduleId,
    submitError,
    onSubmit,
    isPreviewing,
    previewResult: previewResult.asReadonly(),
    preview,
    previewError,
    previewInvoice,
  };
}
