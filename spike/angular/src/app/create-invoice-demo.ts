import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { injectCreateInvoice } from './create-invoice';
import { FieldOutlet } from './field-outlet';

@Component({
  selector: 'app-create-invoice',
  imports: [FieldOutlet, MatButtonModule, MatProgressSpinnerModule],
  template: `
    @if (flow.loadError(); as loadError) {
      <p class="rf-error">{{ loadError }}</p>
    } @else if (flow.isLoading()) {
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
            mat-stroked-button
            type="button"
            [disabled]="flow.isPreviewing()"
            (click)="preview()"
          >
            {{
              flow.isPreviewing() ? 'Generating preview…' : 'Preview invoice'
            }}
          </button>
          <button
            mat-flat-button
            type="submit"
            [disabled]="flow.isSubmitting()"
          >
            Create schedule
          </button>
        </div>
      </form>
      @if (flow.error(); as error) {
        <p class="rf-error">{{ error }}</p>
      }
      @if (flow.createdScheduleId(); as id) {
        <p class="rf-statement" data-severity="success">
          Invoice schedule created: {{ id }}
        </p>
      }
    }
  `,
})
export class CreateInvoiceDemo {
  readonly employmentId = input('');

  protected readonly flow = injectCreateInvoice({
    employmentId: this.employmentId,
  });

  protected submit(event: Event) {
    event.preventDefault();
    void this.flow.onSubmit();
  }

  protected async preview() {
    const dataUrl = await this.flow.onPreview();
    if (!dataUrl) {
      return;
    }
    const bytes = Uint8Array.from(atob(dataUrl.split(',')[1]), (char) =>
      char.charCodeAt(0),
    );
    const url = URL.createObjectURL(
      new Blob([bytes], { type: 'application/pdf' }),
    );
    window.open(url, '_blank');
  }
}
