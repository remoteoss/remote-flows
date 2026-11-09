import { JsonPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import {
  contractorCurrenciesOptions,
  selectContractorCurrencies,
} from '@remoteoss/remote-flows-core';
import { REMOTE_CLIENT } from './providers';

@Component({
  selector: 'app-root',
  imports: [JsonPipe],
  template: `
    <h1>Angular app</h1>
    <p>Change detection: {{ mode }}</p>
    @if (!employmentId) {
      <p>Add ?employmentId=&lt;id&gt; to the URL.</p>
    } @else if (currencies.isPending()) {
      <p>Loading...</p>
    } @else if (currencies.isError()) {
      <pre>{{ currencies.error().message }}</pre>
    } @else {
      <pre>{{ result() | json }}</pre>
    }
  `,
})
export class App {
  private readonly client = inject(REMOTE_CLIENT);

  readonly employmentId = new URLSearchParams(window.location.search).get(
    'employmentId',
  );
  readonly mode = 'Zone' in globalThis ? 'zone.js' : 'zoneless';

  readonly currencies = injectQuery(() => ({
    ...contractorCurrenciesOptions(this.client, this.employmentId ?? ''),
    enabled: !!this.employmentId,
  }));

  readonly result = computed(() => {
    const response = this.currencies.data();
    if (!response) {
      return undefined;
    }
    return response.error ?? selectContractorCurrencies(response);
  });
}
