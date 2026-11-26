import { computed, inject, signal, Signal } from '@angular/core';
import {
  injectMutation,
  injectQuery,
} from '@tanstack/angular-query-experimental';
import {
  createGPEmploymentMutation,
  type GPAdminForm,
  gpFormSchemaOptions,
  gpLegalEntitiesOptions,
  inviteGPEmployeeMutation,
  selectGPFormSchema,
  selectGPLegalEntities,
  updateGPAdministrativeDetailsMutation,
  updateGPContractDetailsMutation,
} from '@remoteoss/remote-flows-core';
import { REMOTE_CLIENT } from '../../provide-remote-flows';
import { createFormStore } from '../../forms/form-store';

export type PayrollAdminStep =
  | 'basic_information'
  | 'contract_details'
  | 'administrative_details'
  | 'invite'
  | 'done';

const FORM_BY_STEP: Partial<Record<PayrollAdminStep, GPAdminForm>> = {
  basic_information: 'global_payroll_basic_information',
  contract_details: 'global_payroll_contract_details',
  administrative_details: 'global_payroll_administrative_details',
};

const NEXT_STEP: Record<PayrollAdminStep, PayrollAdminStep> = {
  basic_information: 'contract_details',
  contract_details: 'administrative_details',
  administrative_details: 'invite',
  invite: 'done',
  done: 'done',
};

type PayrollAdminOnboardingOptions = {
  companyId: Signal<string>;
  countryCode: Signal<string>;
  legalEntityId: Signal<string | undefined>;
};

export function injectPayrollAdminOnboarding({
  companyId,
  countryCode,
  legalEntityId,
}: PayrollAdminOnboardingOptions) {
  const client = inject(REMOTE_CLIENT);

  const step = signal<PayrollAdminStep>('basic_information');
  const employmentId = signal<string | null>(null);
  const submitError = signal<string | null>(null);
  const isValidating = signal(false);

  const legalEntities = injectQuery(() => ({
    ...gpLegalEntitiesOptions(client, companyId()),
    enabled: Boolean(companyId()) && !legalEntityId(),
    select: selectGPLegalEntities,
  }));

  const resolvedLegalEntityId = computed(
    () =>
      legalEntityId() ??
      legalEntities
        .data()
        ?.find((legalEntity) => legalEntity.country_code === countryCode())?.id,
  );

  const currentForm = computed(() => FORM_BY_STEP[step()]);

  const schemaQuery = injectQuery(() => {
    const form = currentForm() ?? 'global_payroll_basic_information';
    const needsEmployment = form !== 'global_payroll_basic_information';
    const id = employmentId() ?? undefined;
    return {
      ...gpFormSchemaOptions(client, countryCode(), form, id),
      enabled:
        Boolean(currentForm()) &&
        Boolean(countryCode()) &&
        (!needsEmployment || Boolean(id)),
      select: selectGPFormSchema,
    };
  });

  const schema = computed(() =>
    currentForm() ? schemaQuery.data() : undefined,
  );

  const store = createFormStore({ schema });

  const createEmployment = injectMutation(() =>
    createGPEmploymentMutation(client),
  );
  const updateContractDetails = injectMutation(() =>
    updateGPContractDetailsMutation(client),
  );
  const updateAdministrativeDetails = injectMutation(() =>
    updateGPAdministrativeDetailsMutation(client),
  );
  const invite = injectMutation(() => inviteGPEmployeeMutation(client));

  const isSubmitting = computed(
    () =>
      isValidating() ||
      createEmployment.isPending() ||
      updateContractDetails.isPending() ||
      updateAdministrativeDetails.isPending() ||
      invite.isPending(),
  );

  const loadError = computed(() => {
    if (!legalEntityId() && legalEntities.isSuccess()) {
      if (!resolvedLegalEntityId()) {
        return new Error(
          `The company has no legal entity in ${countryCode()} with global payroll enabled.`,
        );
      }
    }
    return legalEntities.error() ?? schemaQuery.error() ?? null;
  });

  const isLoading = computed(
    () =>
      !companyId() ||
      (!legalEntityId() && legalEntities.isPending()) ||
      (Boolean(currentForm()) && !schema() && !schemaQuery.error()),
  );

  async function saveStep(values: Record<string, unknown>) {
    const id = employmentId();
    switch (step()) {
      case 'basic_information': {
        const legalEntity = resolvedLegalEntityId();
        if (!legalEntity) {
          throw new Error('No legal entity with global payroll enabled.');
        }
        const newId = await createEmployment.mutateAsync({
          countryCode: countryCode(),
          legalEntityId: legalEntity,
          basicInformation: values,
        });
        employmentId.set(newId);
        return;
      }
      case 'contract_details':
        await updateContractDetails.mutateAsync({
          employmentId: id as string,
          contractDetails: values,
        });
        return;
      case 'administrative_details':
        await updateAdministrativeDetails.mutateAsync({
          employmentId: id as string,
          administrativeDetails: values,
        });
        return;
      default:
        return;
    }
  }

  async function onSubmit() {
    if (!schema() || isSubmitting()) {
      return;
    }
    submitError.set(null);
    isValidating.set(true);
    try {
      const { hasErrors } = await store.submit();
      if (hasErrors) {
        return;
      }
      await saveStep(await store.parse());
      step.update((current) => NEXT_STEP[current]);
    } catch (error) {
      submitError.set(error instanceof Error ? error.message : String(error));
    } finally {
      isValidating.set(false);
    }
  }

  async function sendInvite() {
    const id = employmentId();
    if (!id || isSubmitting()) {
      return;
    }
    submitError.set(null);
    try {
      await invite.mutateAsync({ employmentId: id });
      step.set('done');
    } catch (error) {
      submitError.set(error instanceof Error ? error.message : String(error));
    }
  }

  function skipToInvite() {
    if (step() === 'administrative_details') {
      step.set('invite');
    }
  }

  return {
    step: step.asReadonly(),
    employmentId: employmentId.asReadonly(),
    legalEntityId: resolvedLegalEntityId,
    fields: store.fields,
    isLoading,
    loadError,
    submitError: submitError.asReadonly(),
    isSubmitting,
    onSubmit,
    sendInvite,
    skipToInvite,
  };
}
