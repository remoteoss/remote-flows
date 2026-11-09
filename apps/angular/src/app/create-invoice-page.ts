import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { injectCreateInvoice } from './remote-flows/create-invoice';
import { FieldOutlet } from './remote-flows/field-outlet';

@Component({
  selector: 'app-create-invoice-page',
  imports: [FieldOutlet, MatButtonModule, MatProgressSpinnerModule],
  template: `
    @if (flow.isLoading()) {
      <mat-spinner diameter="32" />
    } @else {
      @if (flow.isContractorOfRecord()) {
        <p class="rf-statement" data-severity="info">
          Contractor of Record invoices are limited to one-off schedules.
        </p>
      }
      <form class="rf-form" novalidate (submit)="submit($event)">
        @for (view of flow.fields(); track view.key) {
          <rf-field [view]="view" />
        }
        <div class="rf-actions">
          <button
            mat-flat-button
            type="submit"
            [disabled]="flow.isSubmitting()"
          >
            Create invoice schedule
          </button>
        </div>
      </form>
      @if (flow.createdScheduleId(); as id) {
        <p class="rf-statement" data-severity="success">
          Invoice schedule created: {{ id }}
        </p>
      }
    }
  `,
})
export class CreateInvoicePage {
  readonly employmentId = input('');

  protected readonly flow = injectCreateInvoice({
    employmentId: this.employmentId,
  });

  protected submit(event: Event) {
    event.preventDefault();
    void this.flow.onSubmit();
  }
}
