# Invoice Schedule Docs

Welcome to the Invoice Schedule flow docs.

A standalone, single-screen flow for creating a contractor invoice schedule — the same screen
Remote exposes on its platform. Mount it anywhere; it does not depend on the onboarding flow.

If you want the invoice-schedule step **inside** contractor onboarding, that is part of the
[Contractor Onboarding](../ContractorOnboarding/README.md) flow instead.

# Table of Contents

- [Getting Started](#getting-started)
  - [Full Example](#full-example)
  - [Targeting a known contractor](#targeting-a-known-contractor)
- [Components API](#components-api)
  - [InvoiceScheduleFlow](#invoicescheduleflow)
  - [InvoiceScheduleForm](#invoicescheduleform)
  - [InvoiceScheduleSubmitButton](#invoiceschedulesubmitbutton)
- [The bag](#the-bag)
- [How values map to the API](#how-values-map-to-the-api)
- [Current limitations](#current-limitations)

## Getting Started

After installation, import the main CSS file in your application:

```css
@import '@remoteoss/remote-flows/styles.css';
```

### Full Example

```tsx
import {
  InvoiceScheduleFlow,
  InvoiceScheduleForm,
  InvoiceScheduleSubmitButton,
  RemoteFlows,
} from '@remoteoss/remote-flows';
import { useState } from 'react';

export function CreateInvoiceSchedule() {
  const [scheduleId, setScheduleId] = useState<string | null>(null);

  return (
    <RemoteFlows auth={/* your token fetcher */}>
      <InvoiceScheduleFlow
        render={(invoiceScheduleBag) => {
          if (invoiceScheduleBag.isLoading) {
            return <div>Loading contractors…</div>;
          }

          if (scheduleId) {
            return <p>Created schedule {scheduleId}</p>;
          }

          return (
            <>
              {invoiceScheduleBag.isLoadingContractorDetails && (
                <p>Loading this contractor's currencies…</p>
              )}

              {invoiceScheduleBag.contractors.isTruncated && (
                <p>
                  Showing {invoiceScheduleBag.contractors.contractors.length} of{' '}
                  {invoiceScheduleBag.contractors.totalCount} contractors.
                </p>
              )}

              <InvoiceScheduleForm
                onSuccess={(data) =>
                  setScheduleId(data?.data?.successes?.[0]?.id ?? null)
                }
                onError={({ error }) => console.error(error)}
              />

              <InvoiceScheduleSubmitButton>
                Create schedule
              </InvoiceScheduleSubmitButton>
            </>
          );
        }}
      />
    </RemoteFlows>
  );
}
```

### Targeting a known contractor

Pass `employmentId` and the flow drops the contractor picker, rendering only the schedule
fields:

```tsx
<InvoiceScheduleFlow employmentId={employmentId} render={/* … */} />
```

## Components API

### InvoiceScheduleFlow

| Prop            | Type                      | Required | Description                                                                                     |
| --------------- | ------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `render`        | `(bag) => ReactNode`      | Yes      | Render prop receiving the flow bag.                                                             |
| `employmentId`  | `string`                  | No       | Create for this contractor and omit the picker. Omit to have the flow load and render a picker. |
| `jsfModify`     | `JSFModify`               | No       | Modify the generated JSON-schema fields (labels, order, presentation).                          |
| `defaultValues` | `Record<string, unknown>` | No       | Default form values.                                                                            |

### InvoiceScheduleForm

| Prop        | Type                                         | Description                                                                    |
| ----------- | -------------------------------------------- | ------------------------------------------------------------------------------ |
| `onSubmit`  | `(payload) => void \| Promise<void>`         | Receives the parsed payload before it is sent. Throwing aborts the submission. |
| `onSuccess` | `(data) => void \| Promise<void>`            | Called once the schedule has been created.                                     |
| `onError`   | `({ error, rawError, fieldErrors }) => void` | Called when creation fails.                                                    |

### InvoiceScheduleSubmitButton

Must be rendered inside the flow's `render` prop. Accepts any button props; disables itself
while the schedule is being created.

## The bag

`useInvoiceSchedule()` is the headless equivalent of the render prop, for fully custom UIs.
Both surfaces expose the same bag:

| Key                          | Description                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| `fields`                     | Generated form fields, including the contractor picker when the flow owns it.              |
| `handleValidation`           | Validation handler for the generated form.                                                 |
| `parseFormValues`            | Turns form values into the API payload without submitting.                                 |
| `onSubmit`                   | Creates the invoice schedule.                                                              |
| `onContractorChange`         | Tell the flow the chosen contractor changed (wired up for you by `InvoiceScheduleForm`).   |
| `employmentId`               | The contractor the schedule will be created for, if known.                                 |
| `rendersContractorSelect`    | Whether this flow renders its own picker.                                                  |
| `isSubmitting`               | True while creating.                                                                       |
| `isLoading`                  | True only for the initial load, before there is a form to show. Safe to return early on.   |
| `isLoadingContractorDetails` | True while the chosen contractor's employment and currencies load; the form stays mounted. |
| `isContractorOfRecord`       | Whether the selected contractor is a Contractor of Record.                                 |
| `contractors`                | `{ contractors, totalCount, isTruncated }` — picker state.                                 |
| `contractorsError`           | Error raised while loading contractors, if any.                                            |

## How values map to the API

The form submits to `POST /v1/contractor-invoice-schedules`.

| Field            | API field        | Notes                                                                     |
| ---------------- | ---------------- | ------------------------------------------------------------------------- |
| Contractor       | `employment_id`  | Only present when the flow renders the picker.                            |
| Invoice currency | `currency`       | Restricted to the selected contractor's supported currencies.             |
| Frequency        | `periodicity`    | See the one-off note below.                                               |
| Start date       | `start_date`     | Date the first invoice is generated.                                      |
| Items 1–10       | `items`          | Slot _n+1_ is revealed once slot _n_ is filled. The API accepts up to 10. |
| Invoice number   | `number`         | Optional — omit it and Remote numbers the invoice for you.                |
| Additional notes | `note`           | Optional.                                                                 |
| Occurrences      | `nr_occurrences` | Optional; blank repeats indefinitely. Hidden for a one-off.               |

**One-off schedules.** Choosing "One time" submits `periodicity: 'monthly'` with
`nr_occurrences: 1`. The API has no `one_time` periodicity for scheduled invoices: recurrence
lives on `nr_occurrences` (1 = one-off, omitted = indefinite, N = capped). This is the same
encoding the Remote platform and Remote's own bulk CSV importer use.

**Contractor of Record.** A CoR contractor is offered only the one-off option, matching the
platform. Note this is a client-side restriction; it is not enforced by the API today.

## Current limitations

- **Contractor search.** `GET /v1/employments` has no name-search parameter, so the picker
  loads up to 10 pages (1000 contractors) and filters in the browser. When the list is
  incomplete, `contractors.isTruncated` is `true` and `contractors.totalCount` reports the real
  figure — surface that rather than implying the list is complete. If you have more contractors
  than that, pass `employmentId` and supply your own picker.
- **Semi-monthly cycle.** Choosing semi-monthly uses the cycle Remote derives from your start
  date (that day and the day 14 days apart). Picking a different pair of days is not yet
  exposed by the API.
- **Create only.** Editing an existing schedule is not part of this flow.
- **No advisory banners.** The platform also warns about missing contractor deposit methods and
  SWIFT fees. Those signals are not on the public API, so they are omitted. A schedule created
  for a contractor without a deposit method comes back with status
  `pending_contractor_action`.
