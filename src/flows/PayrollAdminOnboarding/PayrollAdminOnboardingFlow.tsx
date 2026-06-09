import { useId } from 'react';
import { usePayrollAdminOnboarding } from '@/src/flows/PayrollAdminOnboarding/hooks';
import { PayrollAdminOnboardingContext } from '@/src/flows/PayrollAdminOnboarding/context';
import type { PayrollAdminOnboardingFlowProps } from '@/src/flows/PayrollAdminOnboarding/types';
import { SelectCountryStep } from '@/src/flows/PayrollAdminOnboarding/components/SelectCountryStep';
import { ContractDetailsStep } from '@/src/flows/PayrollAdminOnboarding/components/ContractDetailsStep';
import { AdministrativeDetailsStep } from '@/src/flows/PayrollAdminOnboarding/components/AdministrativeDetailsStep';
import { InvitationStep } from '@/src/flows/PayrollAdminOnboarding/components/InvitationStep';
import { SubmitButton } from '@/src/flows/PayrollAdminOnboarding/components/SubmitButton';
import { BackButton } from '@/src/flows/PayrollAdminOnboarding/components/BackButton';

export const PayrollAdminOnboardingFlow = ({
  companyId,
  legalEntityId,
  countryCode,
  employmentId,
  initialValues,
  options,
  render,
}: PayrollAdminOnboardingFlowProps) => {
  const formId = useId();
  const adminBag = usePayrollAdminOnboarding({
    companyId,
    legalEntityId,
    countryCode,
    employmentId,
    initialValues,
    options,
  });

  return (
    <PayrollAdminOnboardingContext.Provider value={{ formId, adminBag }}>
      {render({
        adminBag,
        components: {
          SelectCountryStep,
          ContractDetailsStep,
          AdministrativeDetailsStep,
          InvitationStep,
          SubmitButton,
          BackButton,
        },
      })}
    </PayrollAdminOnboardingContext.Provider>
  );
};
