import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  CreatedInvoiceSchedules,
  InvoiceScheduleFlow,
  InvoiceSchedulePayload,
  InvoiceSchedulePreview,
} from '@remoteoss/remote-flows-angular';
import { Alert } from '../../ui/alert';
import { InvoicePreviewDialog } from './invoice-preview-dialog';

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
          <rf-invoice-schedule-form
            [beforeSubmit]="onSubmit"
            (created)="onSuccess($event)"
            (submitFailed)="onError($event)"
          />
          <div class="rf-actions">
            <button
              mat-stroked-button
              rfInvoiceSchedulePreview
              (previewed)="openPreview($event)"
              (previewFailed)="onPreviewError($event)"
            >
              {{
                flow.bag.isPreviewing()
                  ? 'Generating preview…'
                  : 'Preview invoice'
              }}
            </button>
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
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected openPreview(preview: InvoiceSchedulePreview) {
    this.dialog.open(InvoicePreviewDialog, {
      data: preview,
      width: '900px',
      maxWidth: '95vw',
    });
  }

  protected onPreviewError(error: Error) {
    this.snackBar.open(
      `Could not preview the invoice: ${error.message}`,
      'Dismiss',
    );
  }

  protected readonly onSubmit = (payload: InvoiceSchedulePayload) => {
    console.log('onSubmit', payload);
  };

  protected onSuccess(response: CreatedInvoiceSchedules) {
    console.log('onSuccess', response);
  }

  protected onError(error: Error) {
    console.log('onError', error);
  }

  protected readonly employmentId =
    new URLSearchParams(window.location.search).get('employmentId') ?? '';
}
