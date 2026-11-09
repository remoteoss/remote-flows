# Angular spike

Angular 22 port of the invoice-schedule flow (`useInvoiceSchedule`), built on the SDK's own framework-neutral code. Not part of the published package.

What is reused as-is from `src/`: the schema builder (`buildCreateInvoiceScheduleSchema`), the payload builders, `buildHeadlessForm` / `parseValuesForValidation`, the generated API client and `createClient`.

What is Angular-specific:

- `src/app/form-store.ts`: signal-based form state (values, validation, touched, group-array rows, fieldsets).
- `src/app/api.ts`: TanStack Query (`@tanstack/angular-query-experimental`) queries and mutations over the generated client. Query keys match the React ones.
- `src/app/create-invoice.ts`: `injectCreateInvoice`, the headless flow.
- `src/app/field-contract.ts`, `field-outlet.ts`, `provide-remote-flows.ts`: the injected-components contract.
- `src/app/material-fields.ts`: the components passed in, built with Angular Material.
- `src/app/create-invoice-demo.ts`: demo UI.

## Run

It talks to the API through the example app's token proxy.

```bash
pnpm install                                  # repo root
pnpm run build
pnpm run seed:onboarding --type=contractor --country=PRT --env=sandbox
cd example && PORT=3001 npm run dev:env -- --env=sandbox
cd ../spike/angular && pnpm install && EXAMPLE_PORT=3001 pnpm start
```

Open http://localhost:4200/?employmentId=<seeded employment id>.
