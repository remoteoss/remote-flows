import { Component, signal } from '@angular/core';
import { CreateInvoicePage } from './pages/create-invoice/create-invoice-page';
import { GpAdminOnboardingPage } from './pages/gp-admin-onboarding/gp-admin-onboarding-page';
import { MagicLinkPage } from './pages/magic-link/magic-link-page';

const PAGES = [
  { id: 'create-invoice', label: 'Create invoice' },
  { id: 'magic-link', label: 'Magic link' },
  { id: 'gp-admin', label: 'GP admin onboarding' },
] as const;

type PageId = (typeof PAGES)[number]['id'];

function pageFromHash(): PageId {
  const id =
    window.location.hash.replace(/^#\/?/, '') ||
    new URLSearchParams(window.location.search).get('flow');
  return PAGES.find((page) => page.id === id)?.id ?? PAGES[0].id;
}

@Component({
  selector: 'app-root',
  imports: [CreateInvoicePage, GpAdminOnboardingPage, MagicLinkPage],
  host: { '(window:hashchange)': 'page.set(pageFromHash())' },
  template: `
    <div class="rf-layout">
      <nav class="rf-sidebar" aria-label="Flows">
        @for (item of pages; track item.id) {
          <a
            class="rf-sidebar__link"
            [href]="'#/' + item.id"
            [attr.aria-current]="page() === item.id ? 'page' : null"
          >
            {{ item.label }}
          </a>
        }
        <p class="rf-mode">Change detection: {{ mode }}</p>
      </nav>
      <main class="rf-page">
        @switch (page()) {
          @case ('magic-link') {
            <app-magic-link-page />
          }
          @case ('gp-admin') {
            <app-gp-admin-onboarding-page />
          }
          @default {
            <app-create-invoice-page />
          }
        }
      </main>
    </div>
  `,
})
export class App {
  protected readonly pages = PAGES;
  protected readonly page = signal(pageFromHash());
  protected readonly pageFromHash = pageFromHash;
  protected readonly mode = 'Zone' in globalThis ? 'zone.js' : 'zoneless';
}
