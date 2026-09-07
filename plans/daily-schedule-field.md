# Daily Schedule Field Plan

## Goal

Give partners building custom onboarding UIs on top of `@remoteoss/remote-flows` a first-class `daily-schedule` field: the same schema-driven defaults/validation-bounds logic Dragon's `WorkScheduleFieldForJSONSchema` computes today, exposed as a swappable field type (`components={{ 'daily-schedule': ... }}`) with a shipped reference UI.

This is **not** a Dragon migration. Dragon does not consume `@remoteoss/remote-flows` at all — its own Formik-based implementation stays untouched. This is purely a remote-flows capability build.

This is also **unrelated** to the existing `work-schedule` field type, which stays untouched — different functionality, different (and currently unused/incompatible) data shape. See "What does NOT change" below.

---

## Current State

### Dragon's implementation (reference behavior, screenshot 1)

- `apps/employ/src/domains/shared/employment/employer/contractDetails/workSchedule/jsfOptionsConfig.tsx` — overrides `daily_schedule`'s `presentation.Component` with `WorkScheduleFieldForJSONSchema`, only when the field is present in the schema.
- `apps/employ/src/components/Ui/Form/WorkScheduleField/WorkScheduleFieldForJSONSchema.jsx` — the field itself. Reads schema metadata via `getDefaultsFromSchema(jsonSchema)` (country name, default start/end/break, default schedule, available work days, per-work-schedule-type hour bounds) and `getSchemaAllowedHoursRange(...)` (min/max hours for the current `full_time`/`part_time` selection), then renders a summary line + "Edit" action opening a modal (`WorkScheduleField.jsx` + `useWorkScheduleFieldState.jsx` + `workScheduleFieldReducer.js`) to pick work days and set per-day start/end/break.
- Data shape written back to the form: `{ selected_days: [...], schedule: { monday: { start_time, end_time, break_duration_minutes }, ... } }`.
- Schema metadata block driving all of this lives at `daily_schedule['x-jsf-presentation'].metadata` — `country_name`, `default_break_duration_minutes`, `default_start_time`/`default_end_time`, `default_schedule`, `work_days`, `subtract_breaks_in_work_hours`, `work_hours_per_week.{baseline,full_time,part_time}`.
- Formik-specific plumbing (`setValue`, camelcase/snakecase key juggling, `useFormikContext().setErrors` for a synthetic `daily_schedule` error) does not carry over — remote-flows is React Hook Form based.

### remote-flows current state

- `src/germanyJsonSchemaDailySchedule.ts` — a static fixture of the **real** production Germany contract-details schema. Same nested `daily_schedule` shape and same `x-jsf-presentation.metadata` block as Dragon's. **Not yet wired** into `example/src/flows/JsonSchemaPlayground/schemas/index.ts` (`SCHEMAS` currently only has `italy-apl`, `france-wage-portage`, `simple-user-profile`). Because `daily_schedule` there declares `inputType: 'fieldset'`, it currently renders as the generic nested-fieldset UI — this is what screenshot 2 shows.
- `work-schedule` field type (`src/components/form/fields/WorkScheduleField.tsx` + `.../default/WorkScheduleFieldDefault.tsx` + `workScheduleUtils.ts`) — already RHF-based and dialog-based, but built for a flat `DailySchedule[]` shape (`{day, start_time, end_time, hours, break_duration_minutes, checked}`) with **no** schema-metadata awareness (no min/max hours, no country defaults). Nothing in the repo sets `inputType: 'work-schedule'` — it's unused in production. **Confirmed out of scope** — do not touch, do not retrofit.
- `jsfModify` → `presentation.Component` override — proven mechanism, already used in the exact flow/step `daily_schedule` would live in:
  - `src/flows/Onboarding/hooks.tsx:606-663` — `annual_gross_salary` gets `presentation.Component: AnnualGrossSalary` injected into the `contract_details` step's `jsfModify`, merged with any consumer-supplied `jsfModify` for that step.
  - `src/flows/ContractorOnboarding/jsfModify.tsx` (`buildContractPreviewJsfModify`) — same idea for `contract_preview_header`/`contract_preview_statement`/`signature`, with a hand-rolled fallback (`userFields?.X?.Component || InternalDefault`).
  - **Limitation**: in both cases the `Component` is hardcoded/one-off. `src/components/form/JSONSchemaForm.tsx:87-107` shows that when `field.Component` is set, rendering **never consults the `components` prop** — no `Components['annual_gross_salary']` slot exists, no `*Default` split, nothing in `lazy-default-components.ts`. This is why `annual_gross_salary` can't be swapped by a consumer via the standard `components` prop today.

### The one genuinely new piece

Every entry in `supportedTypes`/`fieldsMap`/`lazyDefaultComponents` today is reachable because Tiger's schema declares a matching `x-jsf-presentation.inputType` directly. Tiger declares `daily_schedule` as a plain `fieldset`. So `jsfModify` needs to rewrite `x-jsf-presentation.inputType` to `'daily-schedule'` client-side (same file/place as the `annual_gross_salary` injection) so the field then routes through the **standard** `fieldsMap` + `components` machinery — giving it a real `Components['daily-schedule']` swap slot and a shipped default, like `work-schedule` has, instead of a hardcoded one-off `Component`. Combining "client-injected type" with "public swappable registry entry" hasn't been done before in this repo; each piece individually is proven.

---

## Decisions confirmed so far

1. **Scope**: SDK-only. No Dragon migration in this plan — Dragon doesn't consume remote-flows.
2. **Naming**: new type, tentatively `daily-schedule` (kebab-case, consistent with `work-schedule`/`multi-select`). Not a retrofit of `work-schedule`.
3. **Shape of deliverable**: headless contract (`fieldData`) **and** a shipped reference default UI, following the same `*Field` (wrapper, computes `fieldData`) / `*FieldDefault` (swappable rendering) split every other type uses — not headless-only.
4. **Mechanism**: `jsfModify` rewrites `x-jsf-presentation.inputType` (not just injects a `Component`) for `daily_schedule` in `Onboarding/hooks.tsx`'s `contract_details` step, registering `'daily-schedule'` as a first-class entry in the public component registry.

---

## Phases

### Phase 0 — Inputs still needed before design is final

- Read through PAY-2868 (Linear) analysis once available — may already answer some of the open questions below.
- Confirm which countries besides Germany use this exact `daily_schedule` shape/metadata contract (a grep across Tiger/Dragon schemas, or ask backend) — determines whether the `fieldData` contract needs to handle variations (e.g. no breaks, different available days, no part-time bounds) from day one or can start Germany-only.
- Confirm final type name (`daily-schedule` proposed).

### Phase 1 — Wire the real schema into the isolated Playground sandbox (zero production risk)

- Add an entry (e.g. `germany-contract-details`) to `example/src/flows/JsonSchemaPlayground/schemas/index.ts` built from `germanyJsonSchemaDailySchedule.ts`'s `.data.schema`, matching the `SampleSchema` shape (`{ name, description, schema }`) like `franceWagePortage.ts`/`italyAplSchema.ts` do.
- This reproduces today's generic-fieldset rendering (screenshot 2) as the visible "before" baseline, in a safe sandbox to iterate in — no consumer flow touched.

### Phase 2 — Design the `fieldData` contract

Port dragon's `getDefaultsFromSchema` / `getSchemaAllowedHoursRange` / transform-to-and-from-schema-format logic (all in `apps/employ/.../WorkScheduleField/utils/schedule.js`) to an RHF-friendly shape, e.g.:

```
type DailyScheduleDataProps = FieldDataProps & {
  countryName: string;
  availableWorkDays: Weekday[];
  defaultSchedule: DailyScheduleDay[];
  workHoursBounds: { minimum: number; maximum: number }; // resolved for current work_schedule value
  subtractBreaksFromWorkHours: boolean;
  currentSchedule: { selected_days: string[]; schedule: Record<Weekday, DayHours> };
  setScheduleValues: (values) => void; // writes selected_days + schedule.<day> back into RHF in the real schema shape
};
```

Decide:
- Validation story — rely on json-schema-form-kit's own schema-driven validation (the real schema already encodes per-day required-ness via `allOf`/`if`/`then`/`else`), vs. also replicating Dragon's client-side pre-submit check (`DailyScheduleError`) for immediate modal feedback.
- Whether writes to RHF need Dragon's "only validate on the last field update" trick, or whether a single `setValue`/`reset` call with the whole `daily_schedule` object sidesteps that entirely (RHF supports this more naturally than Formik did).

### Phase 3 — Register `daily-schedule` as a first-class type

- `src/components/form/utils.ts` — add `DAILY_SCHEDULE: 'daily-schedule'` to `supportedTypes`.
- `src/components/form/fields/baseFields.tsx` — add `'daily-schedule': DailyScheduleField` to `fieldsMap`.
- `src/lazy-default-components.ts` + `src/default-components.ts` — add `'daily-schedule': DailyScheduleFieldDefault` (lazy-loaded, like every other default).
- `src/types/fields.ts` — add `DailyScheduleDataProps` / `DailyScheduleComponentProps`.
- `src/types/remoteFlows.ts` — add `'daily-schedule'` to the `Components` type.
- `docs/COMPONENT_CUSTOMIZATION.md` — add to the supported types list and the typescript defs list (mirroring how `work-schedule`/`WorkScheduleComponentProps` are documented today).

### Phase 4 — Build `DailyScheduleField.tsx` + `DailyScheduleFieldDefault.tsx` in the sandbox

- Wrapper computes `fieldData` per Phase 2's contract.
- Default UI matches Dragon's UX (screenshot 1: summary line + "Edit" opening a day-selection + per-day start/end/break modal), built with remote-flows' own primitives (`Dialog`, `TextField`, `CheckBoxField` — same primitives `work-schedule`'s default already uses, so no new UI dependency).
- Verify entirely inside the Playground against the schema wired in Phase 1 — still no `jsfModify`/Onboarding wiring yet.

### Phase 5 — Wire the `jsfModify` override into Onboarding's `contract_details` step

- In `Onboarding/hooks.tsx`, alongside the existing `annual_gross_salary`/`equity_compensation` entries in `contractDetailsCustomFields.fields`, add a `daily_schedule` entry that rewrites `x-jsf-presentation.inputType` to `'daily-schedule'`, preserving the schema's own `metadata` block untouched, merged with any consumer-supplied `jsfModify` for that field the same way the existing two are.
- Confirm no collision with the schema's own conditional logic for `work_schedule`/`schedule_type` (already handled by the schema's own `allOf`, untouched by this change).

### Phase 6 — Verification

- Manual pass in the Playground with the Germany schema run through the full flow (not just the isolated fieldset) to confirm submit payload shape is unchanged (must match what Tiger expects).
- Check/extend `useOnboardingJsfV1ContractDetails.test.tsx` and sibling contract-details tests for a `daily_schedule`-bearing fixture.
- Confirm the `jsfModify` field entry is a no-op for schemas/countries without a `daily_schedule` field (same tolerance `annual_gross_salary`'s injection presumably already has for schemas missing that field).

---

## What does NOT change

- Dragon's `WorkScheduleFieldForJSONSchema` and everything under `apps/employ/.../WorkScheduleField/` — untouched, no migration.
- The existing `work-schedule` field type (`WorkScheduleField.tsx`, `WorkScheduleFieldDefault.tsx`, `workScheduleUtils.ts`) — untouched, unrelated functionality, not retrofitted, not renamed.
- Tiger/backend schema — `daily_schedule` keeps declaring `inputType: 'fieldset'`; no backend change required. The retyping to `'daily-schedule'` happens client-side via `jsfModify`.

---

## Open questions

1. Final type name — `daily-schedule` proposed, needs confirming.
2. Which countries beyond Germany share this exact schema shape/metadata contract — affects whether Phase 2's `fieldData` contract must handle variation from the start.
3. Validation story for Phase 2 — schema-driven only, or also replicate Dragon's client-side pre-submit check.
4. Still waiting on PAY-2868 (Linear) content — may resolve #2/#3 or surface other constraints not yet captured here.
