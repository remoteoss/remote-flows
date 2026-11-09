import { Component } from '@angular/core';
import { CreateInvoicePage } from './pages/create-invoice/create-invoice-page';

@Component({
  selector: 'app-root',
  imports: [CreateInvoicePage],
  template: `
    <main class="rf-page">
      <p class="rf-mode">Change detection: {{ mode }}</p>
      <app-create-invoice-page />
    </main>
  `,
})
export class App {
  protected readonly mode = 'Zone' in globalThis ? 'zone.js' : 'zoneless';
}
