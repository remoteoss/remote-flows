# Daily Schedule: architecture and customization model

This documents the pattern we followed for the `daily_schedule` field in Onboarding's
`contract_details` step, why we landed on a headless render-prop + edit-bag split, and
how it's expected to extend to other custom JSF fields in the future.

## Where it lives today

The `daily_schedule` field is a JSON Schema Form (JSF) field with a custom `Component`,
wired up **only** inside `[src/flows/Onboarding/hooks.tsx](../src/flows/Onboarding/hooks.tsx)`,
as part of `contractDetailsCustomFields` (alongside `annual_gross_salary` and
`equity_compensation`). It is gated behind the `daily_schedule` feature flag
(`options.features`) and is not currently generalized to other flows.

```markdown
hooks.tsx (useOnboarding)
contractDetailsCustomFields.fields.daily_schedule.presentation.Component
-> DailyScheduleContainer (headless, owns derived state)
-> render(renderProps)
-> customer's Component (if provided via jsfModify)
-> DailySchedule (our default UI, otherwise)
```

Consumers override the field's presentation via `options.jsfModify.contract_details.fields.daily_schedule`,
exactly like any other JSF field override — see
`[example/src/flows/Onboarding/constants.ts](../example/src/flows/Onboarding/constants.ts)`:

```ts
jsfModify: {
  contract_details: {
    fields: {
      daily_schedule: {
        presentation: {
          Component: CustomDailySchedule,
        },
      },
    },
  },
},
```

Because `DailyScheduleContainer` is already wrapping the field in `hooks.tsx`, a custom
`Component` receives `DailyScheduleRenderProps` directly — it does not need to (and should
not) re-wrap itself in the container.

## The core decision: headless container + render prop

`DailyScheduleContainer` (`[components/DailySchedule/DailyScheduleContainer.tsx](../src/flows/Onboarding/components/DailySchedule/DailyScheduleContainer.tsx)`)
follows the same pattern as `PaidTimeOffContainer`: it owns all schema-derived and
form-derived state, and calls `render(renderProps)` with a plain data payload. It does not
render any markup itself — presentation is entirely up to whoever consumes `render`.

This mirrors the flow-level pattern (`<OnboardingFlow render={...}>` / `useOnboarding()`)
at the level of a single field: **the container computes, the render prop presents.**

### What the render prop gives you

```ts
type DailyScheduleRenderProps = {
  summaryDays: DailyScheduleSummaryDay[];
  subtractBreaksFromWorkHours: boolean;
  savedScheduleHoursError: DailyScheduleHoursError | null;
  editBag: DailyScheduleEditBag;
};
```

- `summaryDays` / `subtractBreaksFromWorkHours` — enough to render a read-only summary of
  the _saved_ schedule. We deliberately don't hand back pre-rendered text or JSX; consumers
  decide how to lay out and word the summary themselves. `buildDailyScheduleSummary()`
  (exported from the main package) turns this into line-based segments if a consumer wants
  our exact copy without our exact markup — see
  `[DailyScheduleSummaryBody.tsx](../src/flows/Onboarding/components/DailySchedule/DailyScheduleSummaryBody.tsx)`,
  which is itself just a reference/default implementation over that same utility.
- `savedScheduleHoursError` — validation state for the _saved_ schedule (e.g. weekly hours
  outside the country's allowed range), so consumers can decide how to surface it (banner,
  inline text, toast, etc). `DailyScheduleHoursErrorBanner` is our default presentation of
  this, exported from internals to showcase in demo, customers can build their own.
- `editBag` — everything needed to build an edit UI (see below).

Both the error banner and the summary body are exported from `@remoteoss/remote-flows/internals`
specifically for demo purposes.

## The edit bag: state & actions, not a form library

`editBag` (built by `useDailyScheduleEditForm`, returned as `{ state, actions }`) is the
part we iterated on the most.

**We tried exposing React Hook Form directly and rejected it.** RHF is an internal
implementation detail of how the field's value round-trips into the JSF form — leaking its
`control`/`register`/`formState` shape to consumers would mean:

- any future change to how we manage the edit form's internal state becomes a breaking
  change for every custom implementation, and
- consumers would need to know RHF conventions instead of a small, purpose-built API.

Instead, `DailyScheduleEditState` / `DailyScheduleEditActions`
(`[components/DailySchedule/types.ts](../src/flows/Onboarding/components/DailySchedule/types.ts)`)
are a **framework-agnostic** surface:

```ts
type DailyScheduleEditState = {
  rows: DailyScheduleEditFormRow[]; // one row per weekday, plain values
  unsavedSummaryDays: DailyScheduleSummaryDay[]; // live preview while editing
  hoursRangeError: DailyScheduleHoursError | null;
  isDirty: boolean;
  formError: string | null;
  hasFieldErrors: boolean;
  getFieldError: (index, field) => string | undefined;
};

type DailyScheduleEditActions = {
  updateRow: (index, field, value) => void;
  toggleDay: (index) => void;
  save: () => Promise<void>;
  reset: () => void;
  close: () => void;
  validate: () => boolean;
  handleBlur: () => void;
};
```

`rows` are plain objects (`day`, `checked`, `start_time`, `end_time`,
`break_duration_minutes`, `hours`) — no RHF field arrays, no refs, no subscriptions. Actions
are stable functions that internally call into RHF and `setValue` (the JSF field's value
setter) but never hand that mechanism back to the caller. This is the same boundary
discipline the rest of the package uses for forms in general (see "Forms" in the root
`CLAUDE.md`): consumers get `handleValidation`/`parseFormValues`-style async functions and
plain data, never the form library instance.

The tradeoff we accepted: any interaction the edit bag doesn't expose (e.g. per-keystroke
validation timing, focus management) requires us to add a new state field or action rather
than consumers reaching in themselves. That's intentional — it's the same
narrow-but-stable-surface tradeoff as the rest of the public API, and it's what let us
change the internal validation/JSF wiring during iteration without breaking the example.

## Two implementations, one contract

Both the default UI and the example custom UI consume the exact same
`DailyScheduleRenderProps` / `DailyScheduleEditBag` contract:

|               | Default                                                                                   | Custom example                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Component     | `[DailySchedule.tsx](../src/flows/Onboarding/components/DailySchedule/DailySchedule.tsx)` | `[CustomDailyScheduleExample.tsx](../example/src/flows/Onboarding/CustomDailyScheduleExample.tsx)` |
| Summary       | `DailyScheduleSummaryBody` (used directly)                                                | `DailyScheduleSummaryBody` (reused from `internals`)                                               |
| Error display | `DailyScheduleHoursErrorBanner` (used directly)                                           | `DailyScheduleHoursErrorBanner` (reused from `internals`)                                          |
| Edit form     | `DailyScheduleEditForm` + `EditEmployeeWorkingHoursDialog` (dialog-based)                 | Inline custom markup driven entirely by `editBag.state`/`editBag.actions`                          |

Neither implementation reaches past the render props / edit bag to touch JSF internals,
RHF, or `DailyScheduleContainer` directly — which is what makes it possible to swap one for
the other via `jsfModify` alone, and why both are covered by the same test expectations in
`src/flows/Onboarding/tests/`.

## PRs involved

- [#1296](https://github.com/remoteoss/remote-flows/pull/1296)
- [#1301](https://github.com/remoteoss/remote-flows/pull/1301)
- [#1302](https://github.com/remoteoss/remote-flows/pull/1302)
- [#1304](https://github.com/remoteoss/remote-flows/pull/1304)
- [#1305](https://github.com/remoteoss/remote-flows/pull/1305)
- [#1306](https://github.com/remoteoss/remote-flows/pull/1306)
- [#1313](https://github.com/remoteoss/remote-flows/pull/1313)
- [#1314](https://github.com/remoteoss/remote-flows/pull/1314)
- [#1315](https://github.com/remoteoss/remote-flows/pull/1315)
- [#1317](https://github.com/remoteoss/remote-flows/pull/1317)
- [#1318](https://github.com/remoteoss/remote-flows/pull/1318)

_Note_: Discarded [API](https://github.com/remoteoss/remote-flows/blob/f2cacbe36c059b96f7e20339bdcd01d69132ca67/example/src/flows/Onboarding/CustomDailySchedule.tsx) where we leaked RHF (react-hook-form) details

## Walkthrough Video

For outsiders of the repo / or anyone wanted to know how the whole feature works this is the next video

[https://www.loom.com/share/e1bc6d44eb2140689992ef4a1c546eb1](https://www.loom.com/share/e1bc6d44eb2140689992ef4a1c546eb1) -> Remoters only access
