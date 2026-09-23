# Contract Details Schema Canary Plan

## Goal

Get an early signal when a live contract-details JSON schema served by tiger can no longer be turned into a form by remote-flows — for every country, not only the ones with e2e coverage (today: DEU, ESP).

## Why

### The France incident

- tiger shipped a new France `contract_details` schema **without versioning it** (it replaced what `latest` returns).
- France is not pinned in `example/src/flows/Onboarding/constants.ts` → `jsonSchemaVersionByCountry`, so the SDK requests `latest` and picked up the change immediately.
- The new schema relied on behaviour only available in a newer `@remoteoss/remote-json-schema-form-kit` / json-schema-form. A customer on an older released SDK blew up **as soon as contract details loaded** (form creation, not a specific interaction).
- Fix was bumping the kit in the SDK. Nothing in our test suite could have caught it:
  - `OnboardingFlowFrance.test.tsx` runs against a frozen MSW fixture, never the live schema.
  - e2e only covers Germany and Spain.
  - dragon's smoke tests use latest schemas but run against dragon's own bundled engine, not remote-flows' released versions.

### Principle

We can't rely on tiger always versioning schema changes. We need our own feedback loop that exercises **live schemas** against **the engine our customers actually run**.

## Scope

In:

- `contract_details` for every country returned by `/v1/countries` on sandbox.
- Detecting failures at form-creation time (parse / build fields / initial validation).
- Two SDK engines: current `main` and the latest published npm release.

Out (for now):

- Behavioural checks (conditionals, submit, step flow) — that remains the job of per-country e2e specs.
- Older published SDK versions (a matrix over past releases) — possible phase 3.
- `employment_basic_information` and other forms — easy to add later with the same harness.
- Preventing breakage for customers on old SDKs — only tiger versioning can do that; this gives us detection and evidence.

## Design

### What gets checked, per country

| Check  | Schema version fetched                                 | Meaning if it fails                                                        |
| ------ | ------------------------------------------------------ | -------------------------------------------------------------------------- |
| Pinned | Version from `constants.ts`, or `latest` if not pinned | Broken **now** for the demo and for partners with the same config. Urgent. |
| Latest | `latest` (even when a version is pinned)               | Will break when we bump the pin. Early warning.                            |

### Against which engine

| Engine                                     | Source                                     | Meaning if it fails while the other passes                                        |
| ------------------------------------------ | ------------------------------------------ | --------------------------------------------------------------------------------- |
| `main`                                     | Repo's current `src/` + pinned kit version | We are not safe yet — fix on `main`.                                              |
| Latest published `@remoteoss/remote-flows` | Installed from npm in a throwaway dir      | Already fixed on `main` but not released, or customers need to upgrade. (France.) |

### How a schema is "checked"

Reuse the exact code path the Onboarding flow uses, not a reimplementation:

1. Fetch `GET /v1/countries/{code}/contract_details?skip_benefits=true[&json_schema_version=N]` from the sandbox gateway (same query as `useJSONSchemaForm` in `src/flows/Onboarding/api.ts`).
2. Select the engine the flow would use for that country (`usesJsfV1ContractDetails` in `src/flows/Onboarding/utils.ts` — FRA, ITA, DEU, ESP are on jsf v1).
3. Build the form via the SDK's `createHeadlessForm` (`src/common/createHeadlessForm.tsx`) with the example's `jsfModify.contract_details` applied, then run `handleValidation({})` once.
4. Anything that throws = failure. Record country, version, engine, error message + first stack frame.

Open question: whether the published package exposes enough (`./internals`?) to run step 3 against the npm build. If not, phase 2 needs a tiny exported entry point or we vendor the built `dist/` from the npm tarball.

### Where it lives

- Script: `scripts/schema-canary.mjs` (or `.ts` via `tsx`), runnable locally: `npm run schema-canary -- [--country=FRA] [--engine=main|published]`.
- Auth: sandbox gateway credentials, same approach as `npm run seed:onboarding -- --env=sandbox` (`.env.sandbox` locally, repo secrets in CI).
- CI: new job in `.github/workflows/e2e-nightly.yml` (or a sibling `schema-canary.yml`) — daily cron + `workflow_dispatch`. No browser, no Vercel deploy needed; should run in well under a minute.

### Output

- Job fails if any **pinned** check fails on either engine.
- **Latest**-only failures are reported but don't fail the job (warning), to avoid a permanently red job for versions nobody uses yet. Revisit once we see the noise level.
- Markdown table written to `$GITHUB_STEP_SUMMARY`:

  | Country | Version | Engine | Result | Error |
  | ------- | ------- | ------ | ------ | ----- |

- Alerting beyond a red scheduled run (Slack webhook / auto-opened issue) is a follow-up decision.

## Phases

### Phase 1 — `main` engine, pinned + latest

- Script against repo source, all countries, both versions.
- Run locally, triage the first report (expect some noise: countries without contract details, 404s for versions that don't exist) and add an explicit allowlist/skip list with reasons.
- Wire into nightly CI.

### Phase 2 — published npm engine

- Install latest `@remoteoss/remote-flows` in a temp dir and run the same checks through it.
- Resolve the "what does the package expose" question above.

### Phase 3 (optional) — older releases

- Matrix over the last N published versions to answer "how far back does this schema change break customers?" — useful evidence to push back on unversioned tiger changes.

## Open decisions

- [ ] All countries vs a supported subset (default: all, with a skip list).
- [ ] Should latest-only failures fail the job?
- [ ] Alert channel: red GitHub run only, Slack, or auto-issue.
- [ ] Sandbox vs production gateway for fetching schemas (default: sandbox — same as e2e).
