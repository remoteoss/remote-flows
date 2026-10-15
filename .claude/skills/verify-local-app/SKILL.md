---
name: verify-local-app
description: Verify onboarding behavior of the current checkout's code by running the example app locally against a pinned root env file (.env.local / .env.sandbox / .env.staging / .env.partners), seeding a fresh employment with the same file, and driving the flow with Playwright — instead of the user doing it by hand. Use when the user asks to "verify X locally", "check my change against staging/partners/sandbox", or similar. For the deployed demo app (.env.review) use verify-sandbox-deployed-app instead; not for unit/e2e tests.
allowed-tools: Bash(npm run build:*), Bash(npm run dev:env:*), Bash(npm run seed:onboarding:*), Bash(node:*), Bash(curl:*), Bash(cat:*), Bash(grep:*), Read, Write
---

# Verify local app

Runs `example/` on this machine against one of the root env files, so the run
is reproducible: the app, the seed script and the check all read the same
`.env.<name>`. The user's own `npm run dev` and `example/.env` are their
scratchpad — never read, edit or rely on them here.

| File            | Gateway it's meant for        |
| --------------- | ----------------------------- |
| `.env.local`    | Tiger on `localhost:4000`     |
| `.env.sandbox`  | sandbox                       |
| `.env.staging`  | staging                       |
| `.env.partners` | partners                      |
| `.env.review`   | not this skill — deployed app |

`VITE_REMOTE_GATEWAY` inside the file is what actually picks the gateway; the
file name only picks the credentials.

## Step 1: Pick the env and confirm it exists

Use the env the user named. If they didn't, ask which one rather than guessing
— different envs are different companies, and the result only means something
against the one they care about.

Reading `.env*` files directly is denied by permission settings, so check keys
with a `node -e` one-liner that loads `<repo root>/.env.<name>` with `dotenv`
and prints only `true`/`false` per key — never the values. It must set
`VITE_REMOTE_GATEWAY`, `VITE_CLIENT_ID`, `REMOTE_CLIENT_SECRET` and
`REMOTE_REFRESH_TOKEN`. If the file is missing or incomplete, ask the user to
create it (same shape as `example/.env`), then stop and wait.

Any feature flag the check depends on (e.g. `VITE_NEW_PREMIUM_BENEFITS`) must be
in that root file too: `dev:env` does not read `example/.env` at all, for the
browser or the server.

## Step 2: Build the library

`example/` depends on the repo root via `file:..`, so it serves whatever is in
`dist/`. Run `npm run build` at the repo root first, otherwise you're verifying
the last build, not the current code.

## Step 3: Start the app on its own port

From `example/`, start it in the background on a free port (not 3001 and not
the worktree's `PORT`, which the user's own dev server may be using):

```
PORT=<free port> npm run dev:env -- --env=<name>
```

Wait until `http://localhost:<port>` responds. The log line
`Loaded <repo root>/.env.<name>; example/.env is ignored.` confirms the right
file was picked up.

## Step 4: Get an employment ID at the right step

If the user gave you an existing employment ID for that env, use it. Otherwise
seed one with the **same** env name, so it belongs to the company the app's
server authenticates as (a mismatch returns 404 `Company not found`):

```
npm run seed:onboarding -- --country=<COUNTRY> --env=<name>
```

Default `COUNTRY=DEU` unless the ask implies another. Seeding stops at
`contract_details`; drive later steps yourself in Step 5.

## Step 5: Write a one-off Playwright script

Write a small Node script per task and run it with `node` from `example/`
(Playwright is already installed there). It should:

1. Launch headless Chromium (`playwright`'s `chromium.launch()`).
2. Open `http://localhost:<port>/?demo=onboarding-basic&employmentId=<id>`.
3. Click "Start Onboarding", then drive whatever steps reach the state to check
   (selectors follow `example/e2e/helpers/onboarding.ts`).
4. Perform the actual check: DOM text/attributes for a specific claim, or
   `page.screenshot({ path: ... })` for a visual one.
5. Close the browser.

## Step 6: Report back and clean up

State plainly what you checked, against which env, and pass/fail against the
user's actual claim — not just "the page loaded." Attach or describe any
screenshot. Then stop the dev server you started in Step 3; leave any server
you didn't start alone.
