# DailySchedule: plain-prop overrides instead of raw react-hook-form

## Problem

`example/src/flows/Onboarding/CustomDailySchedule.tsx` shows a partner rebuilding the `daily_schedule` edit UI from scratch. To do that today, they must import `RFForm`, `Controller`, `useWatch`, `UseFormReturn`, `FieldArrayWithId` — raw react-hook-form re-exports added to the *main* public entry (`src/index.tsx:175-182`) three days ago — and bind directly to `formBag.form`, the raw `UseFormReturn` returned by `useDailyScheduleEditForm` (`src/flows/Onboarding/components/DailySchedule/useDailyScheduleEditForm.tsx:372-382`).

That's a real escape hatch (see PR #1301: a fully custom `Component` can already be swapped in via `jsfModify.contract_details.fields.daily_schedule.presentation.Component`, wrapped by `DailyScheduleContainer.tsx`, which hands it the same `DailyScheduleRenderProps` the shipped `DailySchedule.tsx` gets). But it's the *only* tier available — go from "use our modal as-is" straight to "you now own react-hook-form wiring, `useFieldArray`, per-row `useWatch`, and our validation schema's field names." Every other field type in the SDK (`text`, `date`, `work-schedule`, `drawer`, `zendeskDrawer`, …) instead hands consumers **plain props** — `value`/`onChange`/`error` — while `Controller`/`useWatch` stay an internal implementation detail (`TextField.tsx:41,50`; `Drawer.tsx:9-23`).

The screenshot you shared (Dragon's "Edit Schedule" modal — fixed list of weekday rows: checkbox, start/end time, break minutes) is a good sanity check: the shape a partner would actually want to restyle is narrow and uniform. That supports adding a **plain-prop customization tier** for the common case ("I want my own Dialog/Input/Checkbox look") without requiring the full raw-form rebuild — which stays available for the rare case that needs structural changes (reordering days, extra columns).

## Design

Add two new `Components` map entries, following the exact pattern already used for `drawer`/`zendeskDrawer` (generic, non-JSF, resolved via `useFormFields()` — confirmed nothing about that mechanism requires JSON-Schema-Form or react-hook-form context: `Drawer.tsx` doesn't call `useFormContext` at all):

- **`dailyScheduleRow`** — one weekday row, plain props only: `day`, `label`, `checked`/`onCheckedChange`, `startTime`/`onStartTimeChange`, `endTime`/`onEndTimeChange`, `breakDurationMinutes`/`onBreakDurationMinutesChange`, computed `hoursDisplay`, `disabled`. No RHF types anywhere in the signature.
- **`dailyScheduleModal`** — chrome only, same shape family as `DrawerComponentProps` (`src/types/remoteFlows.ts:133-141`): `open`, `onOpenChange`, `title`, `trigger`, `children`, `className`.

The SDK keeps doing `useFieldArray`/per-row `useWatch` internally (`DailyScheduleEditForm.tsx`'s existing `DayRow`, lines 22-93) and just hands plain values/callbacks to whichever component gets resolved — the consumer's override or the internal default — exactly like `TextField` resolves `components.text` today (`TextField.tsx:41`, `const Component = component || components?.text`).

## Phases

### Phase 1 — Types only (no behavior change)

Add `DailyScheduleRowComponentProps` and `DailyScheduleModalComponentProps` to `src/types/remoteFlows.ts`, extend the `Components` type with `dailyScheduleRow?` / `dailyScheduleModal?`. Purely additive, zero runtime effect, trivially reviewable/revertable on its own.

### Phase 2 — Row override wiring

- In `DailyScheduleEditForm.tsx`, teach `DayRow` to call `useFormFields()` and resolve `components.dailyScheduleRow`; if present, render it with the plain props computed from the existing per-row `useWatch` (already there, lines 36-53) instead of `CheckBoxField`/`TextField`. No override → identical output to today (byte-for-byte, so existing `DailySchedule.test.tsx` keeps passing unmodified).
- Register the internal row UI as the default via `lazy-default-components.ts` (same shape as the `drawer` entry, `lazy-default-components.ts:39-43`), so the override mechanism is symmetric with every other `Components` key.
- Tests: default path unchanged (existing suite); new test rendering with a custom `dailyScheduleRow` and asserting it receives the right plain props and that typing in it round-trips through `formBag`.

### Phase 3 — Modal override wiring

- In `EditEmployeeWorkingHoursDialog.tsx`, resolve `components.dailyScheduleModal` the same way `Drawer.tsx` resolves `components.drawer` (`Drawer.tsx:9-23`). Internal code keeps building the trigger element (the "Edit schedule" `Button`) and title, and hands them to the resolved component as `trigger`/`title` — consumer only owns the chrome, not what triggers it, mirroring how `ContractReviewButton`/`PaidTimeOffButton` build their own trigger and hand it to the generic `Drawer`.
- Register a default (internal `Dialog`) via `lazy-default-components.ts`.
- Tests: default path unchanged; override path renders custom chrome and still opens/closes/saves correctly.

### Phase 4 — Example rewrite

Update `example/src/flows/Onboarding/CustomDailySchedule.tsx` to pass `dailyScheduleRow`/`dailyScheduleModal` via the `components` prop on `<RemoteFlows>`, and delete the `RFForm`/`Controller`/`useWatch`/`UseFormReturn`/`FieldArrayWithId` usage entirely. Keep `buildDailyScheduleSummary`/`calculateWorkingHours`/`WEEKDAY_LABELS`/`DAILY_SCHEDULE_FIELD_NAMES` only where still needed.

### Phase 5 — Deferred, not in this PR

Revisit whether `RFForm`/`Controller`/`useWatch` should stay exported from the main entry (`src/index.tsx`) vs. move to `/internals`-only, now that the common case no longer needs them. Leave as-is for now: the raw `jsfModify...Component` escape hatch (for any field type, not just `daily_schedule`) may still depend on it, and this repo's own precedent (see the DailySchedule summary-utils export decision) is to wait for an actual need rather than guess. Worth a follow-up once Phase 1-4 ships and we see whether anyone still reaches for the raw path.

## Out of scope

- No other flow touched besides `daily_schedule`.
- No change to `jsfModify...presentation.Component` escape hatch itself — it stays available for full rebuilds.
- No CHANGELOG/version bump (release-script-only).

## Open questions for you

1. Does the `dailyScheduleRow` prop list above match what you'd want partners to control, or should `disabled` derive purely from `checked` internally (no separate prop)?
2. Phase 3's "internal code owns the trigger" call — agree, or do you want the trigger swappable too (a third `dailyScheduleTriggerButton`, mirroring the `zendeskDrawer`/`zendeskTriggerButton` pairing)?
3. Ship all 4 phases as one PR, or land Phase 1 (types) separately first since it's zero-risk?
