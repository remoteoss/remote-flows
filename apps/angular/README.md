# Angular app

Private Angular 20 app that shows the create invoice schedule form for a contractor, using `@remoteoss/remote-flows-core` through the workspace link. It is not published.

## Layout

`src/lib` is the code that would become `@remoteoss/remote-flows-angular`. The app imports it through that name (a path alias in `tsconfig.json`), so moving it into a package later means moving the folder and dropping the alias. `src/app` is what a partner writes.

| Folder                           | What it holds                                                                                                                                                                                             |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/core`                   | Framework-free logic: the form engine wrapper, the field tree, path helpers. Candidates for `packages/core`                                                                                               |
| `src/lib/forms`                  | The Reactive Forms layer: the field contract, the outlet that picks a component per field type, the store that syncs controls with the engine                                                             |
| `src/lib/flows/invoice-schedule` | The flow: `injectInvoiceSchedule` (the headless bag, not exported yet), and the components behind the single `InvoiceScheduleFlow` import: the flow, the form and the `rfInvoiceScheduleSubmit` directive |
| `src/app`                        | The partner's code: `app.ts` is the shell, `pages/create-invoice` is the page (layout, loading state, notices, success message), and `fields` holds the Material field components the page brings         |

The pieces mirror the React flow. `InvoiceScheduleFlow` is one import that brings in three pieces. The flow component provides the state to everything inside it, like React's `InvoiceScheduleFlow` does with a context, and the form component renders the fields. `rfInvoiceScheduleSubmit` goes on the partner's own button and wires `type`, `form` and `disabled`. The partner reads the bag from a template reference (`#flow="rfInvoiceScheduleFlow"`) where React uses the `render` prop.

Each field component gets a real `FormControl` (a `FormGroup` for a fieldset, a `FormArray` for the items list) and the field's metadata. Core's form engine stays the source of truth: values flow from the controls into the engine, its errors flow back with `setErrors`, and Material shows them through `mat-error`.

Only creating a schedule is covered. Preview, update and skip are not, and API errors are not shown yet.

## Run it locally

From the repo root, once: `pnpm install`.

Seed a contractor on the environment you will use, then start the API proxy and the app in two terminals:

```bash
pnpm run seed:onboarding --type=contractor --country=PRT --env=review

cd apps/angular
pnpm run start:api --env=review   # reads .env.review at the repo root, serves the proxy on :3002
pnpm run start                    # zoneless, http://localhost:4200
```

Open `http://localhost:4200/?employmentId=<id>`. `API_PORT` changes the proxy port. Creating a schedule is real on that environment, so use a seeded contractor.

## Zoneless and zone.js

The app has two build configurations that differ only in the change detection provider and the `zone.js` polyfill.

| Configuration        | Serve                 | Build                 |
| -------------------- | --------------------- | --------------------- |
| `zoneless` (default) | `pnpm run start`      | `pnpm run build`      |
| `zone`               | `pnpm run start:zone` | `pnpm run build:zone` |

The page prints which one is running.

## Deploy

The Vercel project is named `remote-flows-angular`. To recreate it, import the repo in Vercel as its own project, with `apps/angular` as the root directory and "Include source files outside of the Root Directory" turned on. Vercel then deploys every branch. `ignoreCommand` in `vercel.json` skips pushes that touch nothing under `apps/angular`, `packages/core` or the lockfile and workspace files.

An empty commit is skipped by `ignoreCommand`. To rebuild without changing the app, use "Redeploy" in the Vercel dashboard. Environment variable changes only apply to new deployments.

Set the same variables as the `.env.<name>` file of the environment you target (`VITE_CLIENT_ID`, `REMOTE_CLIENT_SECRET`, `VITE_REMOTE_GATEWAY`, `REMOTE_REFRESH_TOKEN`).

The proxy in `api/` calls the gateway with a user token, so keep the deployment behind Vercel's password protection.
