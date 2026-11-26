import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

export type AlertSeverity = 'info' | 'success' | 'warning' | 'error';

@Component({
  selector: 'app-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-alert',
    '[attr.data-severity]': 'resolvedSeverity()',
    '[attr.role]': 'resolvedSeverity() === "error" ? "alert" : "status"',
  },
  template: `<ng-content />`,
  styles: `
    :host {
      display: grid;
      gap: 0.25rem;
      padding: 0.75rem 1rem;
      margin: 1rem 0;
      border-radius: var(--mat-sys-corner-small);
      border-inline-start: 4px solid var(--app-alert-accent);
      background: var(--app-alert-bg);
      color: var(--app-alert-fg);
      font: var(--mat-sys-body-medium);
      --app-alert-bg: var(--mat-sys-secondary-container);
      --app-alert-fg: var(--mat-sys-on-secondary-container);
      --app-alert-accent: var(--mat-sys-secondary);
    }

    :host([data-severity='success']) {
      --app-alert-bg: #d9f2e0;
      --app-alert-fg: #0d3b1e;
      --app-alert-accent: #1e7a3e;
    }

    :host([data-severity='warning']) {
      --app-alert-bg: #fff3cd;
      --app-alert-fg: #4d3b00;
      --app-alert-accent: #b58100;
    }

    :host([data-severity='error']) {
      --app-alert-bg: var(--mat-sys-error-container);
      --app-alert-fg: var(--mat-sys-on-error-container);
      --app-alert-accent: var(--mat-sys-error);
    }
  `,
})
export class Alert {
  readonly severity = input<AlertSeverity | string | null | undefined>('info');

  protected readonly resolvedSeverity = computed<AlertSeverity>(() => {
    const value = this.severity();
    return value === 'success' || value === 'warning' || value === 'error'
      ? value
      : 'info';
  });
}
