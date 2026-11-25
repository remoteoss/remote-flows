import { Component, inject, Pipe, PipeTransform } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { InvoiceScheduleFlow } from '@remoteoss/remote-flows-angular';

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
            <p class="rf-statement" data-severity="error" role="alert">
              Could not preview the invoice: {{ previewError.message }}
            </p>
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
            <p class="rf-statement" data-severity="error" role="alert">
              Could not create the invoice schedule: {{ submitError.message }}
            </p>
          }
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
  `,
})
export class CreateInvoicePage {
  protected readonly employmentId =
    new URLSearchParams(window.location.search).get('employmentId') ?? '';
}
