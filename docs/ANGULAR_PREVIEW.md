# Angular preview

`@remoteoss/remote-flows-angular` brings Remote's embeddable flows to Angular. It is an early alpha prototype. We are sharing it now so you can try it and tell us what you need before the API settles.

## Status

- **Prototype.** The API will change between alpha releases without a deprecation period.
- **Narrow scope.** Only the create invoice schedule flow for contractors is covered. Previewing, updating and skipping schedules are not, and API errors are not surfaced yet.
- **Open for changes.** The shape of the package, the field components and the flow API are all still up for discussion. If something is awkward, missing or surprising, we want to hear it.
- **Not for production yet.** Install it with the `alpha` tag and expect to adapt when we release.

```bash
npm install @remoteoss/remote-flows-angular@alpha
```

Requirements: Angular 20, `@tanstack/angular-query-experimental` 5 and RxJS 7.8. Both zoneless and zone.js apps work.

## Try the demo

- Angular demo: https://remote-flows-angular.vercel.app/?employmentId=4279eb0a-1a85-4a0b-a162-4045d9f490e3
- React demo: https://remote-flows-eight.vercel.app

The demos run against Remote's sandbox. They sit behind a password, so ask your Remote contact for access. The Angular demo link above already includes a sandbox contractor. To use another, change the `employmentId` in the URL.

The source for the demo is in [`apps/angular`](../apps/angular). The part you would write yourself is `src/app`, which is a good starting point to copy from.

## How it works

The Angular package follows the same design as the React SDK. Every flow gives you the business logic (API calls, validation, state, error handling), and you bring the UI.

You set up three things:

1. **Providers.** `provideRemoteFlows` registers the API client and your field components once, at app level.
2. **Field components.** You supply one Angular component per field type, using your own design system (the demo uses Angular Material). The flow decides which fields to show and what they validate. Your components only render them.
3. **The flow in a template.** You place the flow component, the form and your own submit button, and read the flow state from a template reference.

```ts
// app.config.ts
provideRemoteFlows({
  fields: MY_FIELD_COMPONENTS,
  auth: () => fetch('/api/remote-token').then((r) => r.json()),
});
```

```html
<rf-invoice-schedule-flow
  #flow="rfInvoiceScheduleFlow"
  [employmentId]="employmentId"
>
  @if (flow.bag.isLoading()) {
  <my-spinner />
  } @else {
  <rf-invoice-schedule-form />
  <button rfInvoiceScheduleSubmit>Create invoice schedule</button>

  @if (flow.bag.createdScheduleId(); as id) {
  <p>Invoice schedule created: {{ id }}</p>
  } }
</rf-invoice-schedule-flow>
```

The `flow.bag` is the Angular counterpart of the render prop in React. It exposes signals such as `isLoading()`, `error()` and `createdScheduleId()`.

Each field component receives a real Angular `FormControl` (a `FormGroup` for a fieldset, a `FormArray` for a list of items) plus the field's metadata. Validation errors come back from the flow and show through your usual form error UI.

### Authentication

The browser never holds your client secret. Expose one endpoint on your backend that exchanges your credentials for a token and returns `{ accessToken, expiresIn }`, and pass it as `auth`. The SDK calls it when it needs a token and refreshes it before it expires.

```ts
provideRemoteFlows({
  fields: MY_FIELD_COMPONENTS,
  environment: 'partners',
  auth: () => fetch('/api/remote-token').then((r) => r.json()),
});
```

If you would rather route every request through your own backend, pass `proxy: { url }` instead. The demo includes a minimal proxy in [`apps/angular/api`](../apps/angular/api).

## Philosophy

- **Headless first.** You get the logic; the UI is yours. Use as much or as little of what we ship as you like.
- **Business logic stays with us.** You should not need to know about Remote's API shapes, country rules or validation to embed a flow. When rules change, the form changes, and your code does not.
- **Same flows across frameworks.** React and Angular share one core, so behavior and validation match between them. A fix in one reaches both.
- **Stability as the SDK matures.** React is the stable surface today. Angular will move toward the same promise once we have your feedback.

## Give feedback

This is the part we most want from you. Useful things to tell us:

- Where the field component contract gets in your way.
- Whether you need NgModules, standalone components only, or both.
- Anything that took longer than it should to set up.

## Related

- [README](../README.md) for the React SDK
- [`packages/angular`](../packages/angular) for the package source
- [`apps/angular`](../apps/angular) for the demo app
