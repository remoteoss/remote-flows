import { PayrollAdminOnboardingFlowComponent } from './payroll-admin-onboarding-flow';
import { PayrollAdminOnboardingFormComponent } from './payroll-admin-onboarding-form';
import { PayrollAdminOnboardingSubmitDirective } from './payroll-admin-onboarding-submit';

export const PayrollAdminOnboardingFlow = [
  PayrollAdminOnboardingFlowComponent,
  PayrollAdminOnboardingFormComponent,
  PayrollAdminOnboardingSubmitDirective,
] as const;

export {
  PayrollAdminOnboardingFlowComponent,
  PayrollAdminOnboardingFormComponent,
  PayrollAdminOnboardingSubmitDirective,
};
export type { PayrollAdminStep } from './inject-payroll-admin-onboarding';
