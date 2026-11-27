import { Component } from '@angular/core';
import { FieldOutlet } from '../../forms/field-outlet';
import { injectPayrollAdminOnboardingFlow } from './payroll-admin-onboarding-flow';

@Component({
  selector: 'rf-payroll-admin-onboarding-form',
  imports: [FieldOutlet],
  template: `
    <form
      class="rf-form"
      novalidate
      [id]="flow.formId"
      (submit)="submit($event)"
    >
      @for (view of flow.bag.fields(); track view.key) {
        <rf-field [view]="view" />
      }
    </form>
  `,
})
export class PayrollAdminOnboardingFormComponent {
  protected readonly flow = injectPayrollAdminOnboardingFlow();

  protected submit(event: Event) {
    event.preventDefault();
    void this.flow.bag.onSubmit();
  }
}
