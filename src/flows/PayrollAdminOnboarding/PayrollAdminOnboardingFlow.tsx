import { useId } from 'react';
import { usePayrollAdminOnboarding } from '@/src/flows/PayrollAdminOnboarding/hooks';
import { PayrollAdminOnboardingContext } from '@/src/flows/PayrollAdminOnboarding/context';
import type { PayrollAdminOnboardingFlowProps } from '@/src/flows/PayrollAdminOnboarding/types';

// Stable module-level references — prevents consumer subtrees from unmounting on parent re-renders.
// Each will be replaced with a real implementation in PBYR-4044.
const SelectCountryStep = () => null;
const ContractDetailsStep = () => null;
const AdministrativeDetailsStep = () => null;
const InvitationStep = () => null;
const SubmitButton = () => null;
const BackButton = () => null;

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
