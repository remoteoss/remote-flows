import { Component, inject, input } from '@angular/core';
import { injectPayrollAdminOnboarding } from './inject-payroll-admin-onboarding';

let flowCount = 0;

@Component({
  selector: 'rf-payroll-admin-onboarding-flow',
  exportAs: 'rfPayrollAdminOnboardingFlow',
  template: `<ng-content />`,
})
export class PayrollAdminOnboardingFlowComponent {
  readonly companyId = input.required<string>();
  readonly countryCode = input.required<string>();
  readonly legalEntityId = input<string | undefined>(undefined);

  readonly formId = `rf-payroll-admin-onboarding-form-${flowCount++}`;
  readonly bag = injectPayrollAdminOnboarding({
    companyId: this.companyId,
    countryCode: this.countryCode,
    legalEntityId: this.legalEntityId,
  });
}

export function injectPayrollAdminOnboardingFlow() {
  const flow = inject(PayrollAdminOnboardingFlowComponent, { optional: true });
  if (!flow) {
    throw new Error(
      'The payroll admin onboarding form and buttons must be used inside <rf-payroll-admin-onboarding-flow>',
    );
  }
  return flow;
}
