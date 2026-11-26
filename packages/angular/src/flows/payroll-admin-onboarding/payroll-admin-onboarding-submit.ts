import { Directive } from '@angular/core';
import { injectPayrollAdminOnboardingFlow } from './payroll-admin-onboarding-flow';

@Directive({
  selector: 'button[rfPayrollAdminOnboardingSubmit]',
  host: {
    type: 'submit',
    '[attr.form]': 'flow.formId',
    '[disabled]': 'flow.bag.isSubmitting()',
  },
})
export class PayrollAdminOnboardingSubmitDirective {
  protected readonly flow = injectPayrollAdminOnboardingFlow();
}
