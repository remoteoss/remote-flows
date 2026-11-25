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
  createMagicLinkMutation,
  type ContractorInvoicePreview,
  type JSFModify,
  employmentOptions,
  identityOptions,
  INVOICE_NUMBER_SEQUENCE_PATH,
  isContractorOfRecord as isContractorOfRecordEmployment,
  previewContractorInvoiceMutation,
  selectContractorCurrencyCodes,
  selectContractorInvoicePreview,
  selectCreatedInvoiceSchedule,
  selectEmployment,
  selectInvoiceNumberSequenceText,
  selectMagicLinkUrl,
  selectUserId,
} from '@remoteoss/remote-flows-core';
import { REMOTE_CLIENT } from '../../provide-remote-flows';
import { createFormStore } from '../../forms/form-store';

type InvoiceScheduleOptions = {
  employmentId: Signal<string>;
  defaultValues?: Signal<Record<string, unknown> | undefined>;
  jsfModify?: Signal<JSFModify | undefined>;
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
  jsfModify,
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

  const identity = injectQuery(() => ({
    ...identityOptions(client),
    select: selectUserId,
  }));

  const createMagicLink = injectMutation(() => createMagicLinkMutation(client));

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
      jsfModify: buildInvoiceNumberSequenceModify(
        invoiceNumberSequence(),
        jsfModify?.(),
      ),
    })),
  });

  const createdScheduleId = signal<string | null>(null);
  const submitError = signal<Error | null>(null);
  const isValidating = signal(false);
  const preview = signal<ContractorInvoicePreview | null>(null);
  const previewError = signal<Error | null>(null);
  const isPreviewValidating = signal(false);

  const isSubmitting = computed(
    () => isValidating() || createSchedule.isPending(),
  );
  const isPreviewing = computed(
    () => isPreviewValidating() || previewSchedule.isPending(),
  );

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
        submitError.set(toSubmitError(response.error));
        return;
      }
      const { id, hasFailures } = selectCreatedInvoiceSchedule(response.data);
      if (hasFailures) {
        submitError.set(new Error(CREATE_FAILED_MESSAGE));
        return;
      }
      if (id) {
        createdScheduleId.set(id);
      }
    } catch (thrown) {
      submitError.set(toSubmitError(thrown));
    } finally {
      isValidating.set(false);
    }
  }

  const canManageInvoiceNumberSequence = computed(() =>
    Boolean(identity.data()),
  );

  async function openInvoiceNumberSequence() {
    const userId = identity.data();
    if (!userId || createMagicLink.isPending()) {
      return;
    }
    const tab = window.open('', '_blank');
    if (tab) {
      tab.opener = null;
    }
    try {
      const response = await createMagicLink.mutateAsync({
        user_id: userId,
        path: INVOICE_NUMBER_SEQUENCE_PATH,
      });
      const url = response.error
        ? undefined
        : selectMagicLinkUrl(response.data);
      if (!url) {
        tab?.close();
        return;
      }
      if (tab) {
        tab.location.href = url;
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (thrown) {
      tab?.close();
      console.error(thrown);
    }
  }

  async function previewInvoice() {
    if (error() || !schema() || isPreviewing() || isSubmitting()) {
      return;
    }
    preview.set(null);
    previewError.set(null);
    isPreviewValidating.set(true);
    try {
      const { hasErrors } = await store.submit();
      if (hasErrors) {
        return;
      }
      const values = await store.parse();
      const response = await previewSchedule.mutateAsync({
        employmentId: employmentId(),
        values,
      });
      if (response.error) {
        previewError.set(toSubmitError(response.error, PREVIEW_FAILED_MESSAGE));
        return;
      }
      const document = selectContractorInvoicePreview(response.data);
      if (document) {
        preview.set(document);
      } else {
        previewError.set(new Error(PREVIEW_FAILED_MESSAGE));
      }
    } catch (thrown) {
      previewError.set(toSubmitError(thrown, PREVIEW_FAILED_MESSAGE));
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
    createdScheduleId,
    submitError: submitError.asReadonly(),
    onSubmit,
    invoiceNumberSequence,
    canManageInvoiceNumberSequence,
    isOpeningInvoiceNumberSequence: createMagicLink.isPending,
    openInvoiceNumberSequence,
    isPreviewing,
    preview: preview.asReadonly(),
    previewError: previewError.asReadonly(),
    previewInvoice,
  };
}
