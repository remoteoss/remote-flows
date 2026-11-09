import { Component } from '@angular/core';
import { CreateInvoicePage } from './create-invoice-page';

@Component({
  selector: 'app-root',
  imports: [CreateInvoicePage],
  template: `
    <main class="rf-page">
      <h1>Create invoice schedule</h1>
      <p class="rf-mode">Change detection: {{ mode }}</p>
      @if (employmentId) {
        <app-create-invoice-page [employmentId]="employmentId" />
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
