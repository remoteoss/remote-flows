# Contract details schema canary

The canary checks that every country's contract details form still works against the real sandbox gateway. It runs each country on two versions of the contract details schema:

- **pinned**: the version set in [example/src/flows/Onboarding/jsonSchemaVersions.ts](../example/src/flows/Onboarding/jsonSchemaVersions.ts), which is the version partners use today.
- **latest**: the newest version the gateway serves. Tiger can publish a new one at any time, so this is where future problems show up first.

Each country gets its own sandbox employment per version. The canary archives every employment when it finishes.

## The checks

Each country and version goes through these checks in order. A check only runs if the one before it passed.

| Check     | What it does                                                                                                                                                          |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `build`   | Fetches the schema and builds the form the same way the Onboarding flow does, then validates empty values.                                                            |
| `submit`  | Fills the form with fake values, sends them in the same `PATCH /v1/employments/{id}` the flow sends, then reads the employment back and checks every value was saved. |
| `browser` | Opens that employment in the example app, presses Continue on contract details, and checks the browser sends the same values and moves to the next step.              |

## When it runs, and what fails

| Where                                 | Versions          | Fails the check on | Latest failures go to                               |
| ------------------------------------- | ----------------- | ------------------ | --------------------------------------------------- |
| PRs that touch the form or the canary | pinned and latest | pinned problems    | Warnings on the PR, and the job summary             |
| Nightly, and every push to `main`     | pinned and latest | pinned problems    | The `schema-canary-latest` issue, and the report PR |

A pinned failure means partners are affected now, so it fails the run and opens the `schema-canary` issue. A latest failure means something will break when a country moves to that version. It never fails the run, because a change on Tiger's side shouldn't block unrelated work.

## What to do with a failure

Find the check and the error in the job summary or the issue, then:

| Failure                                                                                        | What it usually means                                                                                                         | What to do                                                                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `seed-error`                                                                                   | The canary couldn't create the sandbox employment. No checks ran.                                                             | Usually sandbox or auth trouble. Re-run the job. If it keeps failing for one country, check that country's basic information in sandbox.                                                                             |
| `build` fails                                                                                  | The SDK can't build or validate the schema, for example a new field type or a broken condition.                               | Fix it in the SDK. Reproduce it as a situation in [jsfEngineSituations.ts](../src/common/tests/jsfEngineSituations.ts) first (see CLAUDE.md).                                                                        |
| `submit`: `PATCH ... -> ...`                                                                   | Tiger rejected the values the SDK sent, for example a new validation rule.                                                    | If the values are valid for a real employee, it's a Tiger bug: report it to the Tiger team. If the fake value is unrealistic, set a better one in [contract-details-seeds.ts](../scripts/contract-details-seeds.ts). |
| `submit`: `saved contract_details differ from what was sent: <field>: sent X, saved undefined` | Tiger accepted the field but didn't save it.                                                                                  | Report it to the Tiger team. While it's open, add the field to [known-unsaved-fields.ts](../scripts/schema-canary/known-unsaved-fields.ts) with a short description of the bug.                                      |
| `submit`: `known unsaved field(s) are saved now`                                               | Tiger fixed a bug listed in `known-unsaved-fields.ts`.                                                                        | Remove the entry.                                                                                                                                                                                                    |
| `browser`: stuck before contract details, or no PATCH sent                                     | The example app couldn't reach or submit the step, for example a required field the form hides or a step that won't continue. | Reproduce it locally (below) and look at the field errors in the failure message.                                                                                                                                    |
| `browser`: `the browser sent different contract_details than the canary saved`                 | The UI changes the values on the way out, for example money conversion or a forced value.                                     | Treat it as a form behaviour bug in the SDK.                                                                                                                                                                         |
| `browser`: `the browser test did not run`                                                      | Playwright crashed or the browser stage couldn't start.                                                                       | Check the run log and the Playwright report artifact.                                                                                                                                                                |

Sandbox blocks a runner for a minute or two after too many requests, and answers every request with 403 until the block lifts. Every browser test running in that window fails, often on Select Country or Basic Information with no field errors. So when any browser test fails, the canary waits 2 minutes and reruns only the failed tests, and the report keeps the rerun's result. A browser failure in the report failed both times. The Playwright report artifact has both runs, in `playwright-report` and `playwright-report-rerun`.

If a failure can't be fixed soon, add the country to the skip list in [skip-list.ts](../scripts/schema-canary/skip-list.ts) with a reason. Set `version: 'latest'` to skip it on latest only.

## Reproducing a failure locally

Both commands use the sandbox credentials in `.env.sandbox` at the repo root.

```bash
npm run schema-canary -- --country=PHL --versions=latest
```

To reproduce a `browser` failure, keep the employment, then open it in the example app:

```bash
npm run schema-canary -- --country=PHL --versions=latest --keep-submitted=/tmp/kept.json
cd example && PORT=3001 npm run dev:env -- --env=sandbox
```

Open `http://localhost:3001/?demo=onboarding-basic&employmentId=<id>&countryCode=PHL&contractDetailsVersion=latest`, using the employment ID from `/tmp/kept.json`. `countryCode` skips Select Country, the same way the canary does. Leave out `contractDetailsVersion` for a pinned employment. When you're done, archive the employments with `npm run schema-canary:archive -- --from=/tmp/kept.json`.

## Moving a country to a newer pinned version

1. Check the `schema-canary-latest` issue, or run `npm run schema-canary -- --country=<code> --versions=latest`. The country must pass `build`, `submit` and `browser` on latest.
2. Update its `contract_details` version in [jsonSchemaVersions.ts](../example/src/flows/Onboarding/jsonSchemaVersions.ts).
3. Open a PR. The PR canary now runs that version as pinned, so it must pass.
