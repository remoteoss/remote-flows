# Work Week Schedule: architecture and customization model

This documents the `work_week_schedule` field in Onboarding's `contract_details` step
(Vietnam today). It follows the same headless container + render prop pattern as the
daily schedule (see [DAILY_SCHEDULE_ARCHITECTURE.md](./DAILY_SCHEDULE_ARCHITECTURE.md)),
for a simpler shape: one start and end time and one break that apply to every working day.

## Where it lives

It is gated behind the `work_week_schedule` feature (`options.features`) and wired in
`[src/flows/Onboarding/hooks.tsx](../src/flows/Onboarding/hooks.tsx)` next to the daily schedule:

```text
hooks.tsx (useOnboarding)
contractDetailsCustomFields.fields.work_week_schedule.presentation.Component
-> WorkWeekScheduleContainer (headless, owns the draft)
-> render(renderProps)
-> partner's Component (if given through jsfModify)
-> WorkWeekSchedule (default UI, otherwise)
```

The same wiring turns `work_hours_per_week` into a read-only total: working hours per day
times 5 for full-time, or times the number of `work_days_for_part_time_worker` for part-time.

Override it with `options.jsfModify.contract_details.fields.work_week_schedule.presentation.Component`,
like the daily schedule. A custom component receives `WorkWeekScheduleRenderProps` and
does not wrap itself in the container.

## Render props

| Prop                 | What it is                                                                   |
| -------------------- | ---------------------------------------------------------------------------- |
| `labels`             | Title, description and field labels from the schema, with defaults if absent |
| `config`             | Bounds from the schema: `minStartTime`, `maxEndTime`, `minBreakMinutes`      |
| `summary`            | The saved schedule, for a read-only view                                     |
| `savedScheduleError` | Bounds error of the saved schedule, or null                                  |
| `editBag`            | Draft state and actions, below                                               |

`buildWorkWeekScheduleSummary(summary)` turns a summary into display lines, so a custom UI
can reuse the default wording without its markup.

## The edit bag

- `state`: `draft`, `workingHours`, `unsavedSummary` (live preview), `hasUnsavedChanges`,
  `error`, `hasFieldErrors` and `getFieldError(field)`. A field error shows after the field
  was blurred or a save failed.
- `actions`: `update(field, value)`, `handleBlur(field)`, `save()` and `close()`.
  `save()` resolves `{ saved: true }` or `{ saved: false, reason: 'invalid_schedule' }`.
  `close()` discards unsaved edits.

## Wording

Titles and field labels come from the schema through `labels`. The rest of the default UI's
copy (buttons, "Preview", the dialog title) is hardcoded, as in the daily schedule, so
partners own that wording and its translation.

## Known gaps

- The schema's `work_schedule_*` validations only run when the step is submitted. The dialog
  checks the same bounds itself, so the two can drift.
- Part-time: the weekly total did not update after picking work days in the prototype, so
  the part-time calculation is unconfirmed.
- Only the Vietnam schema was checked. Other countries that return `work_week_schedule`
  are untested.
- The shared `FieldSetField` change that forwards `label`, `description`, `fields` and
  `meta` to a custom component affects every custom fieldset component.
