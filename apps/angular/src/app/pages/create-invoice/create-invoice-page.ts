import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InvoiceScheduleFlow } from '@remoteoss/remote-flows-angular';
import { Alert } from '../../ui/alert';

@Component({
  selector: 'app-create-invoice-page',
  imports: [
    Alert,
    InvoiceScheduleFlow,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h1>Create invoice schedule</h1>
    @if (employmentId) {
      <rf-invoice-schedule-flow
        #flow="rfInvoiceScheduleFlow"
        [employmentId]="employmentId"
      >
        @if (flow.bag.isLoading()) {
          <mat-spinner diameter="32" />
        } @else if (flow.bag.error(); as error) {
          <app-alert severity="error">
            Could not load the invoice schedule form: {{ error.message }}
          </app-alert>
        } @else {
          @if (flow.bag.isContractorOfRecord()) {
            <app-alert severity="info">
              Contractor of Record invoices are limited to one-off schedules.
            </app-alert>
          }
          <rf-invoice-schedule-form />
          <div class="rf-actions">
            <button mat-flat-button rfInvoiceScheduleSubmit>
              Create invoice schedule
            </button>
          </div>
          @if (flow.bag.submitError(); as submitError) {
            <app-alert severity="error">
              Could not create the invoice schedule: {{ submitError.message }}
            </app-alert>
          }
          @if (flow.bag.createdScheduleId(); as id) {
            <app-alert severity="success">
              Invoice schedule created: {{ id }}
            </app-alert>
          }
        }
      </rf-invoice-schedule-flow>
    } @else {
      <p>Add ?employmentId=&lt;id&gt; to the URL.</p>
    }
  `,
})
export class CreateInvoicePage {
  protected readonly employmentId =
    new URLSearchParams(window.location.search).get('employmentId') ?? '';
}
