import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PayrollAdminOnboardingFlow } from '@remoteoss/remote-flows-angular';

const STEP_TITLES: Record<string, string> = {
  basic_information: '1. Basic information',
  contract_details: '2. Contract details',
  administrative_details: '3. Administrative details',
  invite: '4. Invite the employee',
  done: 'Done',
};

@Component({
  selector: 'app-gp-admin-onboarding-page',
  imports: [
    PayrollAdminOnboardingFlow,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h1>Global Payroll onboarding ({{ countryCode }})</h1>
    @if (companyId) {
      <rf-payroll-admin-onboarding-flow
        #flow="rfPayrollAdminOnboardingFlow"
        [companyId]="companyId"
        [countryCode]="countryCode"
      >
        <h2>{{ stepTitles[flow.bag.step()] }}</h2>
        @if (flow.bag.employmentId(); as id) {
          <p class="rf-mode">Employment: {{ id }}</p>
        }
        @if (flow.bag.loadError(); as error) {
          <p class="rf-statement" data-severity="error" role="alert">
            {{ error.message }}
          </p>
        } @else if (flow.bag.isLoading()) {
          <mat-spinner diameter="32" />
        } @else {
          @switch (flow.bag.step()) {
            @case ('invite') {
              <div class="rf-actions">
                <button
                  mat-flat-button
                  [disabled]="flow.bag.isSubmitting()"
                  (click)="flow.bag.sendInvite()"
                >
                  Send invitation
                </button>
              </div>
            }
            @case ('done') {
              <p class="rf-statement" data-severity="success">
                Invitation sent.
              </p>
            }
            @default {
              <rf-payroll-admin-onboarding-form />
              <div class="rf-actions">
                @if (flow.bag.step() === 'administrative_details') {
                  <button
                    mat-stroked-button
                    type="button"
                    (click)="flow.bag.skipToInvite()"
                  >
                    Skip
                  </button>
                }
                <button mat-flat-button rfPayrollAdminOnboardingSubmit>
                  Continue
                </button>
              </div>
            }
          }
          @if (flow.bag.submitError(); as error) {
            <p class="rf-statement" data-severity="error" role="alert">
              {{ error }}
            </p>
          }
        }
      </rf-payroll-admin-onboarding-flow>
    } @else {
      <p>Add ?flow=gp-admin&amp;companyId=&lt;id&gt; to the URL.</p>
    }
  `,
})
export class GpAdminOnboardingPage {
  private readonly params = new URLSearchParams(window.location.search);
  protected readonly companyId = this.params.get('companyId') ?? '';
  protected readonly countryCode = this.params.get('countryCode') ?? 'PRI';
  protected readonly stepTitles = STEP_TITLES;
}
