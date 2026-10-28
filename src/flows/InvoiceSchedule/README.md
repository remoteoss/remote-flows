# Invoice Schedule Docs

Welcome to the Invoice Schedule flow docs.

A standalone, single-screen flow for creating a contractor invoice schedule — the same screen
Remote exposes on its platform. Mount it anywhere; it does not depend on the onboarding flow.

The flow acts on one contractor, which you name with the required `employmentId` prop. How you
source that id — a picker of your own, a route param, the row the user clicked — is up to you.

If you want the invoice-schedule step **inside** contractor onboarding, that is part of the
[Contractor Onboarding](../ContractorOnboarding/README.md) flow instead. There the form is grouped under the platform's headings (Invoicing details, Invoice items,
Invoicing preferences, Summary); this standalone flow renders the same fields without them.

# Table of Contents

- [Getting Started](#getting-started)
  - [Full Example](#full-example)
- [Components API](#components-api)
  - [InvoiceScheduleFlow](#invoicescheduleflow)
  - [InvoiceScheduleForm](#invoicescheduleform)
  - [InvoiceScheduleSubmitButton](#invoiceschedulesubmitbutton)
  - [InvoiceSchedulePreviewButton](#invoiceschedulepreviewbutton)
- [Callouts](#callouts)
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

export function CreateInvoiceSchedule({
  employmentId,
}: {
  employmentId: string;
}) {
  const [scheduleId, setScheduleId] = useState<string | null>(null);

  return (
    <RemoteFlows auth={/* your token fetcher */}>
      <InvoiceScheduleFlow
        employmentId={employmentId}
        render={(invoiceScheduleBag) => {
          if (invoiceScheduleBag.isLoading) {
            return <div>Loading…</div>;
          }

          if (scheduleId) {
            return <p>Created schedule {scheduleId}</p>;
          }

          return (
            <>
              {invoiceScheduleBag.isContractorOfRecord && (
                <p>This contractor can only be invoiced one-off.</p>
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

## Components API

### InvoiceScheduleFlow

| Prop            | Type                      | Required | Description                                                            |
| --------------- | ------------------------- | -------- | ---------------------------------------------------------------------- |
| `employmentId`  | `string`                  | Yes      | The contractor the schedule is created for.                            |
| `render`        | `(bag) => ReactNode`      | Yes      | Render prop receiving the flow bag.                                    |
| `jsfModify`     | `JSFModify`               | No       | Modify the generated JSON-schema fields (labels, order, presentation). |
| `defaultValues` | `Record<string, unknown>` | No       | Default form values.                                                   |

### InvoiceScheduleForm

| Prop        | Type                                         | Description                                                                    |
| ----------- | -------------------------------------------- | ------------------------------------------------------------------------------ |
| `onSubmit`  | `(payload) => void \| Promise<void>`         | Receives the parsed payload before it is sent. Throwing aborts the submission. |
| `onSuccess` | `(data) => void \| Promise<void>`            | Called once the schedule has been created.                                     |
| `onError`   | `({ error, rawError, fieldErrors }) => void` | Called when creation fails.                                                    |

Render it once `invoiceScheduleBag.isLoading` is false, as in the example above. The form reads
its starting values, including `defaultValues`, when it mounts, so a form mounted earlier starts empty.

### InvoiceScheduleSubmitButton

Must be rendered inside the flow's `render` prop. Accepts any button props; disables itself
while the schedule is being created, and while the flow has no contractor to create for.

### InvoiceSchedulePreviewButton

Renders the invoice the form currently describes as a draft PDF and shows it in a drawer,
without creating anything. Must be rendered inside the flow's `render` prop.

Disabled while a preview is in flight, and while the flow has no contractor to preview against
— the preview endpoint is scoped to an employment.

| Prop        | Type                                         | Description                                                           |
| ----------- | -------------------------------------------- | --------------------------------------------------------------------- |
| `onSuccess` | `(preview) => void \| Promise<void>`         | Receives the preview document, for consumers that want it themselves. |
| `onError`   | `({ error, rawError, fieldErrors }) => void` | Called when the preview fails.                                        |

```tsx
<InvoiceSchedulePreviewButton onError={({ error }) => console.error(error)}>
  Preview invoice
</InvoiceSchedulePreviewButton>
```

A preview covers a single invoice, so the recurrence fields (`periodicity`,
`nr_occurrences`) are left out of the request.

`preview.content` is a `data:application/pdf;base64,…` URI. Browsers block top-level
navigation to the `data:` scheme, so it can be rendered in an `iframe`/`embed` or handed to an
`<a download>`, but not passed to `window.open`. Override the `pdfViewer` component on
`<RemoteFlows components={…}>` to render it your own way.

## Callouts

The form shows the platform's invoice date note under the invoice date: the invoice date is
when the invoice is created, not when the contractor gets paid, so backdate the invoice date if
payment is needed by a specific day.

The form does not warn about a contractor with no active deposit method. Render your own notice
from the bag: `employment.has_active_withdrawal_method` is `false` when they have none. The
schedule can still be created, and Remote reaches out to the contractor to get one added. The
example app shows one.

## The bag

`useInvoiceSchedule()` is the headless equivalent of the render prop, for fully custom UIs.
Both surfaces expose the same bag:

| Key                    | Description                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| `fields`               | Generated form fields.                                                                                 |
| `initialValues`        | Starting values for the generated form, with `defaultValues` applied.                                  |
| `fieldValues`          | The latest form values, as reported through `checkFieldUpdates`.                                       |
| `checkFieldUpdates`    | Feed the latest form values back in so conditional fields re-evaluate.                                 |
| `handleValidation`     | Validation handler for the generated form.                                                             |
| `parseFormValues`      | Turns form values into the API payload without submitting.                                             |
| `onSubmit`             | Creates the invoice schedule.                                                                          |
| `previewInvoice`       | Renders the current values as a draft PDF without creating anything.                                   |
| `employmentId`         | The contractor the schedule will be created for.                                                       |
| `isSubmitting`         | True while creating.                                                                                   |
| `isPreviewingInvoice`  | True while a draft PDF preview is being generated.                                                     |
| `isLoading`            | True until there is a form to show: no `employmentId`, or its currencies and employment still loading. |
| `isContractorOfRecord` | Whether the contractor is a Contractor of Record.                                                      |
| `employment`           | The contractor's employment once loaded, e.g. for `has_active_withdrawal_method` or the name.          |

## How values map to the API

The form submits to `POST /v1/contractor-invoice-schedules`.

| Field            | API field        | Notes                                                                                                                                              |
| ---------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| —                | `employment_id`  | Taken from the `employmentId` prop, not collected by the form.                                                                                     |
| Invoice currency | `currency`       | Restricted to the contractor's supported currencies.                                                                                               |
| Frequency        | `periodicity`    | See the one-off note below.                                                                                                                        |
| Start date       | `start_date`     | Date the first invoice is generated. Today (UTC) or later.                                                                                         |
| Items 1–10       | `items`          | Slot _n+1_ is revealed once slot _n_ is filled. The API accepts up to 10.                                                                          |
| Invoice number   | `number`         | Optional — omit it and Remote numbers the invoice for you.                                                                                         |
| Additional notes | `note`           | Optional.                                                                                                                                          |
| End date         | `nr_occurrences` | Required for a recurring schedule: "No end date" omits it, "End after a number of occurrences" sends the count (at least 1). Hidden for a one-off. |

**One-off schedules.** Choosing "One time" submits `periodicity: 'monthly'` with
`nr_occurrences: 1`. The API has no `one_time` periodicity for scheduled invoices: recurrence
lives on `nr_occurrences` (1 = one-off, omitted = indefinite, N = capped). This is the same
encoding the Remote platform and Remote's own bulk CSV importer use.

**Contractor of Record.** A CoR contractor is offered only the one-off option, matching the
platform. `contractor_type` arrives with the employment, so the recurring cadences are on offer
for a moment first; a recurring choice made in that window is cleared once the restriction is
known. Note this is a client-side restriction; it is not enforced by the API today.

## Semi-monthly cycle

Choosing the semi-monthly frequency reveals a "Semi-monthly" group with an **Invoicing cycle**
radio. The default is the 15th and the last day of the month. **Custom cycle** reveals
**First invoice raised on** (1st to 14th) and a read-only line saying the second invoice is
raised 14 days after the first. It is derived in the schema (a computed `const`), so it needs
no form code. The group is sent as `custom_days`: `[15, 31]` for the default cycle
(the API treats 31 as the last day of the month) and `[first, first + 14]` for a custom one.

The start date must fall on one of the cycle's days: the 15th or the last day of the month for the default cycle, or the first or second day for a custom one. Any other date fails validation on `start_date` with "Choose a date that matches the selected invoicing cycle". The date picker is not restricted to those days, so the error appears after a date is picked.

## Current limitations

- **Create only.** Editing an existing schedule is not part of this flow.
