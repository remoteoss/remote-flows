# Daily Schedule Field Plan

## Goal

Give partners building custom onboarding UIs on top of `@remoteoss/remote-flows` the same schema-driven defaults/validation-bounds logic Dragon's `WorkScheduleFieldForJSONSchema` computes today for `daily_schedule`, wired as a headless container + a shipped reference UI, swappable per-field via `jsfModify` (**Method 3: Field-Specific Override**, `docs/COMPONENT_CUSTOMIZATION.md:237`) — the same documented mechanism `paid_time_off_info` already uses in Termination. This is **not** a globally-registered field type: no `components={{ 'daily-schedule': ... }}` entry point.

This is **not** a Dragon migration. Dragon does not consume `@remoteoss/remote-flows` at all — its own Formik-based implementation stays untouched. This is purely a remote-flows capability build.

This is also **unrelated** to the existing `work-schedule` field type, which stays untouched — different functionality, different (and currently unused/incompatible) data shape. See "What does NOT change" below.

### Behavioral requirements (PAY-2868)

Restated at a high level, independent of implementation mechanism — the acceptance bar the headless container + shipped default UI must clear, matching Dragon's reference MR above:

- The container exposes schema-derived data (defaults, hour bounds, country/day metadata — Phase 2's render-prop payload) via props/utilities so a consumer's own component can read it and build their own UI on top if they choose to override the default.
- Users open a modal to edit the schedule: select/exclude work days, set per-day start/end/break times.
- Validation errors surface to the user inside that same editing flow, not just as a generic post-submit form error.
- Saving commits the whole schedule in one action, not one write per field/day.
- Users can re-open the modal and edit an already-saved schedule (not create-only).
- Values written back must match the exact schema shape Tiger expects, and must not break the schema's own RHF/Yup validation (per-day required-ness via `allOf`/`if`/`then`/`else`).

---

## Current State

### Dragon's implementation (reference behavior, screenshot 1)

- Reference MR: [gitlab.com/remote-com/employ-starbase/dragon/-/merge_requests/49203](https://gitlab.com/remote-com/employ-starbase/dragon/-/merge_requests/49203) — ground truth for the exact UX/behavior this plan needs to match; see "Behavioral requirements" under Goal below.
- `apps/employ/src/domains/shared/employment/employer/contractDetails/workSchedule/jsfOptionsConfig.tsx` — overrides `daily_schedule`'s `presentation.Component` with `WorkScheduleFieldForJSONSchema`, only when the field is present in the schema.
- `apps/employ/src/components/Ui/Form/WorkScheduleField/WorkScheduleFieldForJSONSchema.jsx` — the field itself. Reads schema metadata via `getDefaultsFromSchema(jsonSchema)` (country name, default start/end/break, default schedule, available work days, per-work-schedule-type hour bounds) and `getSchemaAllowedHoursRange(...)` (min/max hours for the current `full_time`/`part_time` selection), then renders a summary line + "Edit" action opening a modal (`WorkScheduleField.jsx` + `useWorkScheduleFieldState.jsx` + `workScheduleFieldReducer.js`) to pick work days and set per-day start/end/break.
- Data shape written back to the form: `{ selected_days: [...], schedule: { monday: { start_time, end_time, break_duration_minutes }, ... } }`.
- Schema metadata block driving all of this lives at `daily_schedule['x-jsf-presentation'].metadata` — `country_name`, `default_break_duration_minutes`, `default_start_time`/`default_end_time`, `default_schedule`, `work_days`, `subtract_breaks_in_work_hours`, `work_hours_per_week.{baseline,full_time,part_time}`.
- Formik-specific plumbing (`setValue`, camelcase/snakecase key juggling, `useFormikContext().setErrors` for a synthetic `daily_schedule` error) does not carry over — remote-flows is React Hook Form based.

### remote-flows current state

- `src/germanyJsonSchemaDailySchedule.ts` — a static fixture of the **real** production Germany contract-details schema. Same nested `daily_schedule` shape and same `x-jsf-presentation.metadata` block as Dragon's. **Not yet wired** into `example/src/flows/JsonSchemaPlayground/schemas/index.ts` (`SCHEMAS` currently only has `italy-apl`, `france-wage-portage`, `simple-user-profile`). Because `daily_schedule` there declares `inputType: 'fieldset'`, it currently renders as the generic nested-fieldset UI — this is what screenshot 2 shows.
- `work-schedule` field type (`src/components/form/fields/WorkScheduleField.tsx` + `.../default/WorkScheduleFieldDefault.tsx` + `workScheduleUtils.ts`) — already RHF-based and dialog-based, but built for a flat `DailySchedule[]` shape (`{day, start_time, end_time, hours, break_duration_minutes, checked}`) with **no** schema-metadata awareness (no min/max hours, no country defaults). Nothing in the repo sets `inputType: 'work-schedule'` — it's unused in production. **Confirmed out of scope** — do not touch, do not retrofit.
- `jsfModify` → `presentation.Component` override — proven mechanism, already used in the exact flow/step `daily_schedule` would live in:
  - `src/flows/Onboarding/hooks.tsx:606-663` — `annual_gross_salary` gets `presentation.Component: AnnualGrossSalary` injected into the `contract_details` step's `jsfModify`, merged with any consumer-supplied `jsfModify` for that step. Unconditional — does not check for/preserve a consumer-supplied `Component` on that same field.
  - `src/flows/ContractorOnboarding/jsfModify.tsx` (`buildContractPreviewJsfModify`) — same idea for `contract_preview_header`/`contract_preview_statement`/`signature`, with a hand-rolled fallback (`userFields?.X?.Component || InternalDefault`).
  - **`src/flows/Termination/hooks.tsx:206-222` + `src/flows/Termination/components/PaidTimeOff/` — the actual precedent for this plan's chosen mechanism.** `PaidTimeOffContainer.tsx` is a pure headless container: it owns every `useQuery` call plus derived/formatted data, and calls `render(props)` with the computed payload. `PaidTimeOff.tsx` is the presentational default that consumes that payload. The `jsfModify` wiring for `paid_time_off_info` captures whatever `Component` a consumer already supplied via their own `jsfModify` for that field (`options?.jsfModify?.fields?.paid_time_off_info?.['x-jsf-presentation']?.Component`) _before_ overwriting it, and the container's `render` prop uses that consumer component when present, falling back to the shipped default (`PaidTimeOff`) otherwise. This is **Method 3** in `docs/COMPONENT_CUSTOMIZATION.md:237` ("Field-Specific Override with jsfModify") — a documented, first-class customization surface, not a one-off hack.
  - **Limitation of the plain `Component`-override pattern**: `src/components/form/JSONSchemaForm.tsx:87-107` shows that when `field.Component` is set, rendering **never consults the `components` prop** — no `Components['annual_gross_salary']` slot exists, no `*Default` split, nothing in `lazy-default-components.ts`. This is why `annual_gross_salary` can't be swapped by a consumer via the standard global `components` prop today. This plan **deliberately accepts** that same tradeoff for `daily_schedule` (see "Mechanism decision" below) rather than working around it.

### Mechanism decision: Container + jsfModify Component override (not a new field type)

An earlier version of this plan proposed having `jsfModify` rewrite `daily_schedule`'s `x-jsf-presentation.inputType` to a new `'daily-schedule'` value client-side, then registering that as a first-class entry in `supportedTypes`/`fieldsMap`/`lazyDefaultComponents`/the public `Components` type — giving it a real `Components['daily-schedule']` swap slot via the global `components` prop, like `work-schedule` has.

That was investigated and confirmed _technically feasible_: `jsfModify` runs before `@remoteoss/remote-json-schema-form-kit`'s own `inputType`→`type` dispatch, and the form-kit does not validate or reject unrecognized `inputType` values — it passes them through verbatim and degrades gracefully (falls back to a generic Yup validator) rather than erroring. It was rejected anyway, for three reasons:

1. **No precedent for the combination.** Each half (client-injected schema mutation via `jsfModify`; a first-class `fieldsMap`/`components` registry entry) is proven independently, but "client-injected type" + "public registry entry" together had zero precedent in this repo, versus a fully documented, already-shipped pattern (`paid_time_off_info`) that solves the same problem.
2. **Real TypeScript friction.** `ModifyConfig['fields']` (from `@remoteoss/json-schema-form`) types `x-jsf-presentation.inputType` as a closed `FieldType` union — assigning `'daily-schedule'` would need an explicit cast at the `jsfModify` call site to compile.
3. **Wrong scope.** `daily_schedule` only ever appears in Onboarding's `contract_details` step — no other flow uses it, just like `paid_time_off_info` only appears in Termination. Registering it as a _globally_ swappable field type (reachable from any flow via `components={{ 'daily-schedule': ... }}`) is broader than the actual usage.

**Chosen mechanism instead**: mirror `paid_time_off_info` exactly.

- A flow-local, headless `DailyScheduleContainer` owns all schema-metadata derivation (Dragon's `getDefaultsFromSchema` / `getSchemaAllowedHoursRange` logic, ported) and calls a `render` prop with the computed payload.
- `jsfModify` on `daily_schedule` injects `x-jsf-presentation.Component` directly (Method 3) — no `inputType` mutation, no registry entries anywhere.
- The wiring captures any consumer-supplied `Component` for `daily_schedule` first, and the container's `render` prop falls back to the shipped default UI only when the consumer didn't supply one — same fallback logic as `paid_time_off_info`.
- Consumers customize via `jsfModify.fields.daily_schedule['x-jsf-presentation'].Component`, not via the global `components` prop. This is a real, deliberate difference from `work-schedule`'s customization story, but it's the same documented API surface (`JSFCustomComponentProps`, Method 3) partners can already use for `payment_terms.payment_terms_type` today.

---

## Decisions confirmed so far

1. **Scope**: SDK-only. No Dragon migration in this plan — Dragon doesn't consume remote-flows.
2. **Naming**: flow-local implementation detail, not a public type string. Tentatively `DailyScheduleContainer` (headless, mirrors `PaidTimeOffContainer`) + `DailySchedule` (shipped presentational default, mirrors `PaidTimeOff`). Nothing named `'daily-schedule'` is registered anywhere public.
3. **Shape of deliverable**: headless container (computes the render-prop payload) **and** a shipped reference default UI, following the `*Container` (owns data/derivation, calls `render`) / presentational-default split `paid_time_off_info` uses — not the `*Field`/`*FieldDefault` registry split every `fieldsMap`-routed type uses, since this does not go through `fieldsMap`/`components`.
4. **Mechanism**: `jsfModify` injects `x-jsf-presentation.Component` directly onto `daily_schedule` in `Onboarding/hooks.tsx`'s `contract_details` step (Method 3), preserving any consumer-supplied `Component` for that field as an override, exactly like `paid_time_off_info` does in `Termination/hooks.tsx`. No `inputType` rewrite; no `supportedTypes`/`fieldsMap`/`lazyDefaultComponents`/`Components`-type additions.
5. **Location**: flow-local under `src/flows/Onboarding/components/DailySchedule/`, mirroring `src/flows/Termination/components/PaidTimeOff/` — not a shared/global component, since usage is Onboarding-only.
6. **Country scope**: none — enabled for every country at the same time. The `jsfModify` override applies to `daily_schedule` wherever it appears in a schema, full stop; no per-country allowlist, no investigation into per-country shape variation.
7. **Rollout**: gated behind a feature flag on `OnboardingFlow`, following the existing `OnboardingFeatures` pattern (`dynamic_steps`, `split_salary_description`, `ea_preview` — `src/flows/Onboarding/types.ts:169-178`, checked via `options?.features?.includes(...)` in `hooks.tsx`), since this changes production rendering for a field that currently renders as a generic fieldset for every existing consumer. Flag name: `daily_schedule`.

---

## Phases

### Phase 0 — Inputs still needed before design is final

- Country scope resolved (Decision #6): enabled for every country at once, no per-country research needed — the override applies wherever `daily_schedule` appears in a schema.
- Feature flag name resolved (Decision #7): `daily_schedule`.
- Confirm naming for `DailyScheduleContainer`/default component files (low-stakes — flow-local, not a public API surface).

### Phase 1 — Wire the real schema into the isolated Playground sandbox (zero production risk)

- Add an entry (e.g. `germany-contract-details`) to `example/src/flows/JsonSchemaPlayground/schemas/index.ts` built from `germanyJsonSchemaDailySchedule.ts`'s `.data.schema`, matching the `SampleSchema` shape (`{ name, description, schema }`) like `franceWagePortage.ts`/`italyAplSchema.ts` do.
- This reproduces today's generic-fieldset rendering (screenshot 2) as the visible "before" baseline, in a safe sandbox to iterate in — no consumer flow touched.

### Phase 2 — Design the render-prop contract

Port Dragon's `getDefaultsFromSchema` / `getSchemaAllowedHoursRange` / transform-to-and-from-schema-format logic (all in `apps/employ/.../WorkScheduleField/utils/schedule.js`) to an RHF-friendly shape, passed from `DailyScheduleContainer` to its `render` prop, e.g.:

```
type DailyScheduleRenderProps = {
  field: JSFCustomComponentProps['field']; // value/onChange/onBlur from the JSF Component-override contract
  countryName: string;
  availableWorkDays: Weekday[];
  defaultSchedule: DailyScheduleDay[];
  workHoursBounds: { minimum: number; maximum: number }; // resolved for current work_schedule value
  subtractBreaksFromWorkHours: boolean;
  currentSchedule: { selected_days: string[]; schedule: Record<Weekday, DayHours> };
};
```

Because this is a `Component`-override field (not a `fieldsMap`-routed one), the field already receives JSF's own `field.onChange`/`field.value` bindings (per `JSFCustomComponentProps`, `docs/COMPONENT_CUSTOMIZATION.md`) — writing the whole `daily_schedule` object back is a single `field.onChange({ selected_days, schedule })` call, no manual RHF `setValue`/`reset` plumbing needed.

Decide:

- Validation story — **deferred, not decided upfront**: build Phase 3 against json-schema-form-kit's own schema-driven validation only (the real schema already encodes per-day required-ness via `allOf`/`if`/`then`/`else`); once it's built and testable in the Playground, review it against Dragon's client-side pre-submit check (`DailyScheduleError`) to see what's actually missing before deciding whether to replicate it — see Phase 6.
- Whether Dragon's "only validate on the last field update" trick is needed at all, given a single `field.onChange` call with the whole object sidesteps the problem it was working around — check this once Phase 3 is built too.

### Phase 3 — Build `DailyScheduleContainer.tsx` + `DailySchedule.tsx` in the sandbox

- `src/flows/Onboarding/components/DailySchedule/DailyScheduleContainer.tsx` — headless container computing Phase 2's render-prop payload, mirroring `PaidTimeOffContainer.tsx`'s shape (props in, `render(props)` out).
- `src/flows/Onboarding/components/DailySchedule/DailySchedule.tsx` — default UI matching Dragon's UX (screenshot 1: summary line + "Edit" opening a day-selection + per-day start/end/break modal), built with remote-flows' own primitives (`Dialog`, `TextField`, `CheckBoxField` — same primitives `work-schedule`'s default already uses, so no new UI dependency), mirroring `PaidTimeOff.tsx`'s shape (pure render of the payload).
- Verify entirely inside the Playground against the schema wired in Phase 1 — still no `jsfModify`/Onboarding wiring yet.
- `field.metadata` confirmed empirically against `json-schema-form`'s field-builder: `x-jsf-presentation` keys other than `inputType` are merged directly onto the field object, so `daily_schedule`'s metadata block arrives as `field.metadata`, not nested under `scopedJsonSchema`/`meta` as originally guessed.

**Restructure (post-Phase-3, before Phase 4): validation extracted into a reusable headless hook.** The first Phase 3 pass put the edit-modal's react-hook-form + schema-validation setup directly inside `DailySchedule.tsx`. That's a real problem given the chosen mechanism (see below): if a consumer swaps in their own UI, they'd have to reimplement the library's validation rules (time format, required-when-checked, "at least one day") from scratch, and could silently diverge from what the library considers a valid schedule. Fixed by extracting `src/flows/Onboarding/components/DailySchedule/useDailyScheduleEditForm.ts`:

- Owns the `react-hook-form` instance, the schema-validation resolver, and the save-mapping (form rows → the exact `DailyScheduleValue` write-back shape) — the library's opinion on "what's valid," in one place.
- Returns `{ form, fields, watchedSchedule, handleSave, rootError }` — react-hook-form primitives a UI binds inputs to, not a finished component. Also exports the pure pieces (`dailyScheduleEditFormSchema`, `buildDailyScheduleEditFormDefaultValues`, `mapDailyScheduleEditFormDataToValue`) individually, for a consumer who wants just the validation/mapping without the full hook.
- `DailySchedule.tsx` (the shipped default) now only calls this hook and renders markup — no validation logic lives in the presentational component anymore.
- Validation is written in **zod**, not Yup — a deliberate exception (the requester's own choice) to this repo's stated `React Hook Form + Yup` convention (`CLAUDE.md`), scoped to this one local sub-form. It doesn't interact with json-schema-form-kit's own Yup-based resolver at all (this is a separate, self-contained RHF form scoped to the edit modal), so there's no compatibility concern — it does mean `zod` ships as a second schema-validation dependency alongside `yup` in the published bundle; worth a size-check glance in Phase 6.

### Phase 4 — Wire the `jsfModify` Component override into Onboarding's `contract_details` step

- In `Onboarding/hooks.tsx`, alongside the existing `annual_gross_salary`/`equity_compensation` entries in `contractDetailsCustomFields.fields`, add a `daily_schedule` entry that injects `x-jsf-presentation.Component`.
- **Deviates from the `paid_time_off_info` precedent on purpose.** `PaidTimeOffContainer`'s wiring captures a consumer-supplied `Component` and uses it as a full replacement (bypassing `PaidTimeOffContainer` entirely) when present. That's fine for PTO — the container's queries are largely independent of what's rendered. It's **not** fine for `daily_schedule`: `DailyScheduleContainer` computes all the schema-derived data (`getDefaultsFromSchema`, `getWorkHoursBounds`) a custom UI needs, and now `useDailyScheduleEditForm` owns the validation a custom UI should reuse — a full bypass would force a consumer's override to reimplement both from raw `JSFCustomComponentProps`. Instead: always set `Component` to a small wrapper that renders `<DailyScheduleContainer {...fieldProps} render={render} />`, where `render` is the shipped `DailySchedule` by default, or — when a consumer supplied their own `Component` for `daily_schedule` via their own `jsfModify` — that consumer function called _as the render prop_ (receiving the full `DailyScheduleRenderProps`, including `value`/`setValue`), not as the field's `Component`. A consumer building fully custom UI calls `useDailyScheduleEditForm` themselves inside that render function, the same way `DailySchedule.tsx` does.
- Gate the injection behind the `daily_schedule` feature flag (Decision #7) via `options?.features?.includes('daily_schedule')` — when the flag is off, `daily_schedule` renders exactly as it does today (generic fieldset), unchanged for existing consumers. Add `'daily_schedule'` to `OnboardingFeatures` in `src/flows/Onboarding/types.ts:169-178`.
- Preserve the schema's own `metadata` block untouched; `daily_schedule`'s `inputType` stays `'fieldset'` exactly as Tiger declares it — nothing rewrites it, for any country (Decision #6).
- Confirm no collision with the schema's own conditional logic for `work_schedule`/`schedule_type` (already handled by the schema's own `allOf`, untouched by this change).

### Phase 5 — Guard against silent drift from Dragon's source

Phase 2/3 **port** (copy, not link) `WorkScheduleFieldForJSONSchema.jsx`'s utilities into remote-flows. A future change to Dragon's original in `employ-starbase` won't propagate here automatically, and nothing in either repo will flag the divergence on its own. `employ-starbase`'s own AI-tooling conventions (`employ-starbase/CLAUDE.md`, `.cursor/BUGBOT.md`, `.agents/rules/*.mdc`) were checked to follow its established pattern rather than invent a new one:

- **`employ-starbase/.cursor/BUGBOT.md`** already structures its reviews as gated sections (A11y Review, UX Review, Rebrand Review — each a "Relevance gate" glob/condition followed by an instruction, all marked advisory-only under its own "Guardrails" section: advisory only, never auto-apply). Add a new section following that exact shape: a relevance gate on `apps/employ/src/components/Ui/Form/WorkScheduleField/**`, instructing Bugbot to comment that this logic is ported into `@remoteoss/remote-flows`'s `DailyScheduleContainer` (linking the reference MR + this plan) and ask the author to check whether the port needs the same change.
- **`employ-starbase/.agents/rules/*.mdc`** (symlinked into `.cursor/rules`, read by all AI tools per `employ-starbase/CLAUDE.md`) is the other half of Dragon's convention — `globs`-scoped rules fire at edit time, not just MR-review time, unlike BUGBOT.md. Add `.agents/rules/work-schedule-field-port.mdc` with `globs: 'apps/employ/src/components/Ui/Form/WorkScheduleField/**'` (not `alwaysApply`) so any AI tool editing those files gets nudged while writing, not only when a human reviews the MR.
- Together these mirror how Dragon already gates its other cross-cutting concerns (a11y/UX/rebrand) — no new mechanism invented, just a new relevance-gated entry using the existing two-file convention. Both live in the `employ-starbase` repo, not this one.
- Mirror it here too: point back at the Dragon source file + the reference MR from wherever the ported utils land in `src/flows/Onboarding/components/DailySchedule/` (a short comment, and/or an entry in this repo's own `.cursor/BUGBOT.md`), so remote-flows contributors know where the logic came from and can sanity-check against it.

### Phase 6 — Verification

- Manual pass in the Playground with the Germany schema run through the full flow (not just the isolated fieldset) to confirm submit payload shape is unchanged (must match what Tiger expects).
- Check/extend `useOnboardingJsfV1ContractDetails.test.tsx` and sibling contract-details tests for a `daily_schedule`-bearing fixture.
- Confirm the `jsfModify` field entry is a no-op for schemas/countries without a `daily_schedule` field (same tolerance `annual_gross_salary`'s injection presumably already has for schemas missing that field).
- Resolve Phase 2's deferred validation question here: have the requester review the built modal's validation behavior against Dragon's client-side pre-submit check (`DailyScheduleError`) and decide whether anything needs to be replicated beyond schema-driven validation.

---

## What does NOT change

- Dragon's `WorkScheduleFieldForJSONSchema` and everything under `apps/employ/.../WorkScheduleField/` — untouched, no migration.
- The existing `work-schedule` field type (`WorkScheduleField.tsx`, `WorkScheduleFieldDefault.tsx`, `workScheduleUtils.ts`) — untouched, unrelated functionality, not retrofitted, not renamed.
- Tiger/backend schema — `daily_schedule` keeps declaring `inputType: 'fieldset'`; no backend change required, and **no client-side retyping either** — `inputType` is never touched, only `x-jsf-presentation.Component` is injected (Method 3), exactly as `annual_gross_salary`/`paid_time_off_info` already do.
- `src/components/form/utils.ts` (`supportedTypes`), `src/components/form/fields/baseFields.tsx` (`fieldsMap`), `src/lazy-default-components.ts`/`src/default-components.ts`, `src/types/remoteFlows.ts` (`Components` type) — no `daily-schedule` entries added anywhere; these stay exactly as they are today.

---

## Open questions

1. Still waiting on any remaining PAY-2868 (Linear) detail beyond what's already captured in "Behavioral requirements" above.
