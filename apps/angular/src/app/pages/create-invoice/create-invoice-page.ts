import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InvoiceScheduleFlow } from '@remoteoss/remote-flows-angular';

@Component({
  selector: 'app-create-invoice-page',
  imports: [
    FormsModule,
    InvoiceScheduleFlow,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h1>Create invoice schedule</h1>
    @if (employmentId(); as employmentId) {
      <rf-invoice-schedule-flow
        #flow="rfInvoiceScheduleFlow"
        [employmentId]="employmentId"
      >
        @if (flow.bag.isLoading()) {
          <mat-spinner diameter="32" />
        } @else if (flow.bag.error(); as error) {
          <p class="rf-statement" data-severity="error" role="alert">
            Could not load the invoice schedule form: {{ error.message }}
          </p>
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
      <form class="rf-form" (ngSubmit)="submit()">
        <mat-form-field class="rf-full">
          <mat-label>Employment ID</mat-label>
          <input
            matInput
            name="employmentId"
            [(ngModel)]="draft"
            placeholder="Enter employment ID"
          />
        </mat-form-field>
        <div class="rf-actions">
          <button mat-flat-button type="submit" [disabled]="!draft().trim()">
            Create invoice schedule
          </button>
        </div>
      </form>
    }
  `,
})
export class CreateInvoicePage {
  protected readonly employmentId = signal(
    new URLSearchParams(window.location.search).get('employmentId') ?? '',
  );
  protected readonly draft = signal('');

  protected submit() {
    const id = this.draft().trim();
    if (!id) {
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set('employmentId', id);
    window.history.replaceState(null, '', url);
    this.employmentId.set(id);
  }
}
