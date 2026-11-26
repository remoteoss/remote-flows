import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import type { InvoiceSchedulePreview } from '@remoteoss/remote-flows-angular';

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
  selector: 'app-invoice-preview-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogModule, PdfUrlPipe],
  template: `
    <h2 mat-dialog-title>Invoice preview</h2>
    <mat-dialog-content>
      @if (data.content | pdfUrl; as url) {
        <iframe title="Invoice preview" [src]="url"></iframe>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: `
    mat-dialog-content {
      max-height: none;
      padding: 0 1.5rem;
    }
    iframe {
      display: block;
      width: 100%;
      height: 70vh;
      border: 0;
    }
  `,
})
export class InvoicePreviewDialog {
  protected readonly data = inject<InvoiceSchedulePreview>(MAT_DIALOG_DATA);
}
