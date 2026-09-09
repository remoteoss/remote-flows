# Daily Schedule — Splicing the branch into reviewable PRs

Goal: split the existing `feat/pay-2868-daily-schedule-render-prop-contract` work into a
sequence of small PRs — first to re-verify my own understanding of what I built, then as a
walkthrough for others. Each PR should be reviewable/testable on its own, in the order below.

Related: [daily-schedule-field.md](daily-schedule-field.md) (the original phased design doc).
This file is about **how to re-cut the already-built work into PRs**, not new design.

## Order

### PR 1 — Foundation: flag + wiring + container actually mounted

- Add `'daily_schedule'` to `OnboardingFeatures` (`src/flows/Onboarding/types.ts`).
- `jsfModify` wiring in `Onboarding/hooks.tsx`: capture any consumer-supplied
  `x-jsf-presentation.Component` for `daily_schedule` first, then unconditionally inject the
  override (mirrors `paid_time_off_info` in `Termination/hooks.tsx`), gated behind the feature
  flag.
- `DailyScheduleContainer` is mounted for real (not a throwaway stub) and receives the actual
  `field.value` / `field.onChange` (setValue) from the JSF Component-override contract — but its
  `render` output stays minimal for now (e.g. just proves it has the right payload).
- **Why this first**: it's the seam reviewers most need to see — flag → jsfModify → container
  receiving live field props — before any UI/UX detail. A stub-only component would hide that
  contract; mounting the real container (with a minimal render) shows it without requiring the
  full UI yet.
- Tests: flag on/off gating, no-op when `daily_schedule` isn't in the schema, consumer-supplied
  `Component` override is preserved, container receives the expected field props.
- Call out explicitly in the PR description: not user-facing yet, minimal render only, this PR
  is about proving the wiring.

### PR 2 — Read-only summary UI

- Replace the minimal render with the real `DailySchedule.tsx` summary (heading + text) driven by
  the container's derived payload (country name, default schedule, work-hours bounds, etc.).
- Still no "Edit" button / modal.
- Tests: summary renders correct derived values for a few schema fixtures.

### PR 3 — Edit modal + validation (one PR, not two)

- "Edit" button opens the modal; `useDailyScheduleEditForm` (RHF + zod) owns the form state,
  save-mapping back to the exact `DailyScheduleValue` shape, and validation.
- Field-level + root error surfacing in the modal.
- Keep this as **one PR**, not split into "wire edit button" + "show errors" — the hook returns
  `handleSave` and `rootError` together; they're not a separable concern.
- Tests: opening/editing/saving a schedule, validation errors surfacing per field and at the
  root, save writing back the correct shape.

### PR 4 — Polish

- Reset button.
- Summary re-render when rows/schedule change (confirm this falls out of existing state wiring
  rather than needing new plumbing — check before assuming it's separate work).
- Any remaining edge cases found while re-deriving the above.

### PR 5 (optional) — Example app / demo wiring

- Enable the `daily_schedule` flag in the Onboarding demo (`example/`), for manual QA and as a
  reference for partners.

## Rationale for this ordering (vs. building logic bottom-up first)

Considered building `DailyScheduleContainer`/utils fully in isolation first (Playground-only,
no wiring, no flag) and wiring it in last. Rejected for the PR-splitting purpose specifically:
reviewers can't picture impact from utils alone, and the actual dev history already proved out
the render-prop contract early. Starting with the flag + wiring + a real (if minimally-rendering)
container gives reviewers the concrete integration point first; each following PR fills in one
visible layer on top of the same seam.
