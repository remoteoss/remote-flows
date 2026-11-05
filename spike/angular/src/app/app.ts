import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CreateInvoiceDemo } from './create-invoice-demo';

@Component({
  selector: 'app-root',
  imports: [
    CreateInvoiceDemo,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <main class="rf-page">
      <h1>Create invoice schedule</h1>
      @if (employmentId(); as id) {
        <app-create-invoice [employmentId]="id" />
      } @else {
        <form class="rf-form" (submit)="start($event, input.value)">
          <mat-form-field appearance="outline">
            <mat-label>Contractor employment id</mat-label>
            <input matInput #input [value]="initial" />
          </mat-form-field>
          <div class="rf-actions">
            <button mat-flat-button type="submit">Continue</button>
          </div>
        </form>
      }
    </main>
  `,
})
export class App {
  protected readonly initial =
    new URLSearchParams(window.location.search).get('employmentId') ?? '';
  protected readonly employmentId = signal(this.initial);

  protected start(event: Event, value: string) {
    event.preventDefault();
    this.employmentId.set(value.trim());
  }
}
