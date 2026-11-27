import { Component } from '@angular/core';
import { CreateInvoicePage } from './pages/create-invoice/create-invoice-page';
import { GpAdminOnboardingPage } from './pages/gp-admin-onboarding/gp-admin-onboarding-page';

@Component({
  selector: 'app-root',
  imports: [CreateInvoicePage, GpAdminOnboardingPage],
  template: `
    <main class="rf-page">
      <p class="rf-mode">Change detection: {{ mode }}</p>
      @if (flow === 'gp-admin') {
        <app-gp-admin-onboarding-page />
      } @else {
        <app-create-invoice-page />
      }
    </main>
  `,
})
export class App {
  protected readonly mode = 'Zone' in globalThis ? 'zone.js' : 'zoneless';
  protected readonly flow = new URLSearchParams(window.location.search).get(
    'flow',
  );
}
