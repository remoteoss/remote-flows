---
name: verify
description: Drive the example app (API-first, browser when needed) to check a flow/state actually works, without walking the user through it by hand. Use when asked to verify, check, or reproduce something in the running app - onboarding steps, a specific employment/country state, a UI change, etc.
---

# Verify

Two complementary techniques. Prefer the API-first one whenever you just need
the app to _be in_ a certain data state (an employment sitting at a given
step, for a given country); reach for the browser when you need to actually
look at or interact with rendered UI.

## 0. Make sure the app is actually running

```bash
npm run dev              # repo root: tsup --watch, builds src/ into dist/
cd example && npm run dev  # nodemon dev_server.js, Vite + Express on $PORT (see example/.env)
```

Auth is transparent here - `example/src/RemoteFlows.tsx` fetches a token from
`/api/fetch-refresh-token` using the credentials in `example/.env` (gitignored,
already populated with a real sandbox company in this checkout). There is no
login UI to drive. If `example/.env` has no real credentials, ask the user
rather than guessing values.

Get the port with `grep PORT example/.env` (each worktree gets its own via
`scripts/create-worktree.ts`). Base URL is `http://localhost:$PORT`.

## 1. API-first: seed or check a schema-driven state

The Onboarding/ContractorOnboarding/CreateCompany/Termination/ContractAmendment
flows render forms from a JSON Schema fetched at runtime (`GET
/v1/countries/{country}/{form}`, see `src/flows/<Flow>/api.ts`) - field sets
vary by country and schema version, so **don't hardcode field names or guess
values by scraping the DOM**. Instead, reuse the same computation the real
form uses:

```js
import { createHeadlessForm } from '@remoteoss/remote-json-schema-form-kit'; // already a dependency, resolvable from example/node_modules
import { faker } from '@faker-js/faker'; // devDependency in example/

const schema = await fetch(`${BASE_URL}/v1/countries/${COUNTRY}/${form}?...`)
  .then((r) => r.json())
  .then((j) => j.data);

// Loop: fill whatever's currently required+visible, recompute (may reveal
// newly-required conditional fields), repeat until stable.
let values = {};
for (let round = 0; round < 8; round++) {
  const { fields } = createHeadlessForm(schema, { initialValues: values });
  const missing = fields.filter(
    (f) => f.required && f.isVisible && values[f.name] === undefined,
  );
  if (!missing.length) break;
  for (const f of missing) values[f.name] = fakeValueFor(f); // by f.inputType: text/email/tel/date/number/money/radio/select/countries/textarea/checkbox
}
```

`createHeadlessForm` gives you `required`/`isVisible`/`inputType`/`options`
per field, already resolved against whatever conditional `allOf`/`if-then`
logic the schema has (e.g. Germany's `has_seniority_date` gating
`seniority_date`) - the exact same computation the real form does, just
without a DOM. For yes/no radios, prefer the `no` option: `yes` commonly
reveals extra required sub-fields (file uploads, free-text detail boxes) that
have no plausible generic value.

Then POST straight to the same endpoints the flow's hooks call (find them by
grepping the flow's `hooks.tsx` for the mutation, e.g.
`createEmploymentMutationAsync`/`updateEngagementAgreementMutationAsync`, then
find the underlying SDK call in `api.ts` - the URL template is one grep away
in `src/client/sdk.gen.ts`). No browser involved, no flakiness, and you get a
structured 4xx body back immediately if something's actually wrong.

**`example/scripts/seed-onboarding.mjs` is a complete worked example** for the
Onboarding flow (creates an employment up through `engagement_agreement_details`,
landing it at `contract_details`, for any country):

```bash
cd example && node scripts/seed-onboarding.mjs --country=DEU
```

Extend it (or write a sibling script) rather than reinventing this loop for
other flows/steps. Keep such scripts under `example/scripts/`, never under
`example/e2e/` - that's Playwright's `testDir`, picked up by `npm run
test:e2e` / CI, and these make real API calls with fake data.

## 2. Browser: when you need to actually see or interact with rendered UI

Use `@playwright/test`'s `chromium` directly in a throwaway script (`node
some-script.mjs`), not a spec file under `example/e2e/` - same reasoning as
above. `npx playwright install chromium` once if it's not present.

```js
import { chromium } from '@playwright/test';
const browser = await chromium.launch({ headless: true }); // headed if the user wants to watch
const page = await browser.newPage();
page.on('console', (msg) => {
  if (msg.type() === 'error') console.log(msg.text());
});
page.on('response', async (res) => {
  if (res.status() >= 400)
    console.log(res.status(), res.url(), await res.text().catch(() => ''));
});
```

Reuse `example/e2e/helpers/general.ts`'s field-locator conventions
(`[data-field="<name>"]`, native `select`, `button[role="radio"|"checkbox"]`,
`[role="combobox"]`, `[data-testid^="date-picker-button"]`) if you do need to
drive a form through the DOM - e.g. to seed via the API (§1) and then just
open the resulting employment: `?demo=onboarding-basic`, fill `companyId` /
`type` / `employmentId` on the intro form, submit.

**Known gotcha:** the submit button disables while its mutation is in
flight. A single `getByText('Loading...').waitFor({ state: 'hidden' })` can
resolve on an earlier transient blip and leave you reading stale state.
Wait for `.submit-button:not([disabled])` (or the step title to actually
change) before deciding a step advanced or is stuck - the false "stuck"
read costs a lot of time to debug otherwise.

Screenshot to `/tmp/*.png` and Read it back to look at the page yourself
rather than guessing from text content alone.

## 3. Clean up

Delete throwaway scripts and screenshots when done unless they're worth
keeping as a real tool (like `seed-onboarding.mjs`). Never leave one-off
`_probe.mjs`/`_explore*.spec.ts`-style files lying around in `example/`.
