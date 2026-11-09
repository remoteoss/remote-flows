# Angular app

Private Angular 20 app that consumes `@remoteoss/remote-flows-core` through the workspace link. It loads the contractor currencies of an employment, using core's query options and client factory. It is not published.

## Run it locally

From the repo root, once: `pnpm install`.

Seed an employment on the environment you will use, then start the API proxy and the app in two terminals:

```bash
pnpm run seed:onboarding --type=contractor --country=PRT --env=sandbox

cd apps/angular
pnpm run start:api --env=sandbox   # reads .env.sandbox at the repo root, serves the proxy on :3002
pnpm run start                     # zoneless, http://localhost:4200
```

Open `http://localhost:4200/?employmentId=<id>`. `API_PORT` changes the proxy port.

## Zoneless and zone.js

The app has two build configurations that differ only in the change detection provider and the `zone.js` polyfill.

| Configuration        | Serve                 | Build                 |
| -------------------- | --------------------- | --------------------- |
| `zoneless` (default) | `pnpm run start`      | `pnpm run build`      |
| `zone`               | `pnpm run start:zone` | `pnpm run build:zone` |

The page prints which one is running.

## Deploy

The Vercel project is named `remote-flows-angular`. To recreate it, import the repo in Vercel as its own project, with `apps/angular` as the root directory and "Include source files outside of the Root Directory" turned on. Vercel then deploys every branch. `ignoreCommand` in `vercel.json` skips pushes that touch nothing under `apps/angular`, `packages/core` or the lockfile and workspace files.

Set the same variables as the `.env.<name>` file of the environment you target (`VITE_CLIENT_ID`, `REMOTE_CLIENT_SECRET`, `VITE_REMOTE_GATEWAY`, `REMOTE_REFRESH_TOKEN`).

The proxy in `api/` calls the gateway with a user token, so keep the deployment behind Vercel's password protection.
