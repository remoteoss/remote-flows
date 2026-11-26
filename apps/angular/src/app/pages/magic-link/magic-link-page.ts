import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  injectIdentity,
  injectMagicLink,
} from '@remoteoss/remote-flows-angular';

@Component({
  selector: 'app-magic-link-page',
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h1>Magic link</h1>
    <mat-form-field class="rf-full">
      <mat-label>Custom path</mat-label>
      <input matInput [(ngModel)]="path" placeholder="/dashboard/..." />
    </mat-form-field>
    <div class="rf-actions">
      <button mat-flat-button [disabled]="disabled()" (click)="generate()">
        @if (magicLink.isPending()) {
          <mat-spinner diameter="18" />
        }
        Generate
      </button>
    </div>
    @if (magicLink.isSuccess()) {
      <p class="rf-statement" data-severity="success">
        Magic link generated and opened in a new tab.
      </p>
    }
    @if (error(); as message) {
      <p class="rf-statement" data-severity="error" role="alert">
        {{ message }}
      </p>
    }
  `,
})
export class MagicLinkPage {
  protected readonly identity = injectIdentity();
  protected readonly magicLink = injectMagicLink();
  protected readonly path = signal('/dashboard/company-settings/payments');
  protected readonly disabled = computed(
    () => this.magicLink.isPending() || this.identity.isPending(),
  );
  private readonly missingUser = signal(false);
  protected readonly error = computed(() =>
    this.missingUser()
      ? 'The token has no user, so there is nobody to log in as'
      : (this.identity.error()?.message ??
        this.magicLink.error()?.message ??
        null),
  );

  protected generate() {
    const data = this.identity.data();
    const userId = data && 'user' in data ? data.user.id : '';
    this.missingUser.set(!userId);
    if (!userId) {
      return;
    }
    const tab = window.open('', '_blank');
    if (tab) {
      tab.opener = null;
    }
    this.magicLink.mutate(
      { path: this.path(), user_id: userId },
      {
        onSuccess: (url) => {
          if (tab) {
            tab.location.href = url;
          } else {
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        },
        onError: () => tab?.close(),
      },
    );
  }
}
