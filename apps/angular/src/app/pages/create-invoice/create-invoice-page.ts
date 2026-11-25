import { Component, inject, Pipe, PipeTransform } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  CreatedInvoiceSchedules,
  InvoiceScheduleFlow,
  InvoiceSchedulePayload,
} from '@remoteoss/remote-flows-angular';
import { Alert } from '../../ui/alert';

const PDF_DATA_URI_PREFIX = 'data:application/pdf;base64,';

@Pipe({ name: 'pdfUrl' })
class PdfUrlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(content: string): SafeResourceUrl | null {
    return content.startsWith(PDF_DATA_URI_PREFIX)
      ? this.sanitizer.bypassSecurityTrustResourceUrl(content)
      : null;
  }
}

@Component({
  selector: 'app-create-invoice-page',
  imports: [
    Alert,
    InvoiceScheduleFlow,
    MatButtonModule,
    MatProgressSpinnerModule,
    PdfUrlPipe,
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
            <button mat-stroked-button rfInvoiceSchedulePreview>
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
          @if (flow.bag.previewError(); as previewError) {
            <app-alert severity="error">
              Could not preview the invoice: {{ previewError.message }}
            </app-alert>
          }
          @if (flow.bag.preview(); as preview) {
            @if (preview.content | pdfUrl; as url) {
              <iframe
                title="Invoice preview"
                style="width: 100%; height: 40rem; border: 0"
                [src]="url"
              ></iframe>
            }
          }
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
