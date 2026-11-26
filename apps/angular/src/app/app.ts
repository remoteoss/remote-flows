import { Component, signal } from '@angular/core';
import { CreateInvoicePage } from './pages/create-invoice/create-invoice-page';
import { MagicLinkPage } from './pages/magic-link/magic-link-page';

const PAGES = [
  { id: 'create-invoice', label: 'Create invoice' },
  { id: 'magic-link', label: 'Magic link' },
] as const;

type PageId = (typeof PAGES)[number]['id'];

function pageFromHash(): PageId {
  const id = window.location.hash.replace(/^#\/?/, '');
  return PAGES.find((page) => page.id === id)?.id ?? PAGES[0].id;
}

@Component({
  selector: 'app-root',
  imports: [CreateInvoicePage, MagicLinkPage],
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
