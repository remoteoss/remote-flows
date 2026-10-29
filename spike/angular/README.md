# Angular spike

Renders a JSON schema from the SDK's own form logic in Angular 22, with field components injected through a dependency injection token. Not part of the published package.

The app imports the SDK's source directly, so install the repo root first:

```bash
pnpm install
cd spike/angular
pnpm install
pnpm start
```

Then open http://localhost:4200.

- `src/app/form-store.ts`: signal-based form state on top of the SDK's headless form functions.
- `src/app/field-contract.ts`: framework-neutral field contract and the injection token.
- `src/app/default-fields.ts`: default field components.
- `src/app/partner-chip-select.ts`: example of a partner-supplied component replacing the default select.
