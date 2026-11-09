import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  InvoiceScheduleFlow,
  InvoiceScheduleForm,
  InvoiceScheduleSubmit,
} from '@remoteoss/remote-flows-angular';

@Component({
  selector: 'app-root',
  imports: [
    InvoiceScheduleFlow,
    InvoiceScheduleForm,
    InvoiceScheduleSubmit,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <main class="rf-page">
      <h1>Create invoice schedule</h1>
      <p class="rf-mode">Change detection: {{ mode }}</p>
      @if (employmentId) {
        <rf-invoice-schedule-flow
          #flow="rfInvoiceScheduleFlow"
          [employmentId]="employmentId"
        >
          @if (flow.bag.isLoading()) {
            <mat-spinner diameter="32" />
          } @else {
            @if (flow.bag.isContractorOfRecord()) {
              <p class="rf-statement" data-severity="info">
                Contractor of Record invoices are limited to one-off schedules.
              </p>
            }
            <rf-invoice-schedule-form />
            <div class="rf-actions">
              <button mat-flat-button rfInvoiceScheduleSubmit>
                Create invoice schedule
              </button>
            </div>
            @if (flow.bag.createdScheduleId(); as id) {
              <p class="rf-statement" data-severity="success">
                Invoice schedule created: {{ id }}
              </p>
            }
          }
        </rf-invoice-schedule-flow>
      } @else {
        <p>Add ?employmentId=&lt;id&gt; to the URL.</p>
      }
    </main>
  `,
})
export class App {
  readonly employmentId =
    new URLSearchParams(window.location.search).get('employmentId') ?? '';
  readonly mode = 'Zone' in globalThis ? 'zone.js' : 'zoneless';
}
