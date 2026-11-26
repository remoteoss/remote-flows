# Time Off Docs

Welcome to the Time Off flow docs.

Two standalone flows for a manager who reviews employees' time-off requests and approves or
declines them, including an employee's request to cancel time off that was already approved:

- **`TimeOffFlow`** acts on one request, named by its ID. The ID comes from you (a route param,
  a notification, a row of your own list) or is typed in by the user. It needs nothing else.
- **`TimeOffListFlow`** lists the requests the token can see, filtered by status and paged, and
  opens one for review or decides on it straight from its row. Use it when you don't have a list
  of your own.

Both flows share the same review step and the same Approve and Decline buttons, and neither
depends on the other or on any other flow. For a fully custom UI, use their hooks instead (see
[The bags](#the-bags)).

# Table of Contents

- [Getting Started](#getting-started)
  - [Full Example](#full-example)
- [Supplying the request ID](#supplying-the-request-id)
- [Components API](#components-api)
  - [TimeOffFlow](#timeoffflow)
  - [RequestIdStep](#requestidstep)
  - [NextButton](#nextbutton)
  - [ReviewStep](#reviewstep)
  - [ApproveButton](#approvebutton)
  - [DeclineButton](#declinebutton)
  - [RetryButton](#retrybutton)
  - [BackButton](#backbutton)
- [Outcomes](#outcomes)
- [Loading and errors](#loading-and-errors)
- [The list flow](#the-list-flow)
  - [List example](#list-example)
  - [TimeOffListFlow](#timeofflistflow)
  - [StatusFilter](#statusfilter)
  - [ListStep](#liststep)
  - [ViewButton](#viewbutton)
  - [ListRetryButton](#listretrybutton)
  - [PreviousPageButton and NextPageButton](#previouspagebutton-and-nextpagebutton)
  - [Pagination](#pagination)
- [The bags](#the-bags)
  - [useTimeOff](#usetimeoff)
  - [useTimeOffList](#usetimeofflist)
  - [useTimeOffRequest and useTimeOffRequests](#usetimeoffrequest-and-usetimeoffrequests)
- [Requests and authentication](#requests-and-authentication)
- [Time-off versions and approvers](#time-off-versions-and-approvers)
- [Verification status](#verification-status)
- [Current limitations](#current-limitations)

## Getting Started

After installation, import the main CSS file in your application:

```css
@import '@remoteoss/remote-flows/styles.css';
```

### Full Example

The flow has two steps, `request_id` then `review`. Switch on
`timeOffBag.stepState.currentStep.name` to render each one.

```tsx
import { RemoteFlows, TimeOffFlow } from '@remoteoss/remote-flows';
import type { TimeOffRequest } from '@remoteoss/remote-flows';
import { useState } from 'react';
import { fetchToken } from './auth';

export function ReviewTimeOff({ timeOffId }: { timeOffId?: string }) {
  const [outcome, setOutcome] = useState<TimeOffRequest['status'] | null>(null);
  const [decisionError, setDecisionError] = useState<string | null>(null);

  return (
    <RemoteFlows auth={fetchToken}>
      <TimeOffFlow
        timeOffId={timeOffId}
        render={({
          timeOffBag,
          components: {
            RequestIdStep,
            NextButton,
            ReviewStep,
            RetryButton,
            BackButton,
            ApproveButton,
            DeclineButton,
          },
        }) => {
          if (timeOffBag.stepState.currentStep.name === 'request_id') {
            return (
              <>
                <RequestIdStep />
                <NextButton>Next</NextButton>
              </>
            );
          }

          const status = timeOffBag.timeOffRequest?.status;
          const canDecide =
            status === 'requested' || status === 'cancel_requested';

          return (
            <>
              {timeOffBag.isLoading && <p>Loading the request…</p>}

              {timeOffBag.timeOffRequestError && (
                <div role='alert'>
                  <p>
                    The request could not be loaded (
                    {timeOffBag.timeOffRequestError.reason}).
                  </p>
                  <RetryButton>Try again</RetryButton>
                </div>
              )}

              <ReviewStep>
                {outcome && <p>The request is now {outcome}.</p>}
                {decisionError && <p role='alert'>{decisionError}</p>}

                {canDecide && (
                  <>
                    <DeclineButton
                      declineReason={null}
                      onSuccess={({ status }) => setOutcome(status)}
                      onError={({ message }) => setDecisionError(message)}
                    >
                      Decline
                    </DeclineButton>
                    <ApproveButton
                      approverId={null}
                      onSuccess={({ status }) => setOutcome(status)}
                      onError={({ message }) => setDecisionError(message)}
                    >
                      Approve
                    </ApproveButton>
                  </>
                )}
              </ReviewStep>

              <BackButton
                onClick={() => {
                  setOutcome(null);
                  setDecisionError(null);
                }}
              >
                Back
              </BackButton>
            </>
          );
        }}
      />
    </RemoteFlows>
  );
}
```

`fetchToken` is your call to your own server for an access token, as described in
[Authentication](../../../README.md#authentication). The example app has a fuller version of this
screen in `example/src/TimeOff.tsx`, with an `Alert` for each state, a dialog that asks for the
decline reason, and "Approve cancellation" and "Decline cancellation" labels for a cancellation
request.

## Supplying the request ID

The flow always starts on the `request_id` step, which holds a single required text field.

- **You know the ID.** Pass it as `timeOffId`. The field starts filled with it, and the user
  confirms with Next. Rendering `RequestIdStep` is optional: with `timeOffId` set,
  `timeOffBag.next()` moves to `review` directly.
- **The user knows the ID.** Leave `timeOffId` out and render `RequestIdStep`. Next stays
  disabled until the field holds a non-blank value.

Leaving the step stores the ID, trimmed, in `timeOffBag.timeOffId` and moves to `review`.
**Nothing is fetched on the `request_id` step.** The SDK does not check the ID's format or
whether the request exists there: the request is loaded once the flow reaches `review`. An ID
that doesn't exist only shows up then, as a `not_found` error.

Back from `review` returns to `request_id` with the ID still filled in, so the user can correct
it or enter another one.

## Components API

All components below come from the `components` argument of the render prop and must be
rendered inside it. Buttons accept any button props (`className`, `disabled`, `onClick`, …) and
render through the `button` component you can override on `<RemoteFlows components={…}>`.

### TimeOffFlow

| Prop        | Type                                       | Required | Description                                                                               |
| ----------- | ------------------------------------------ | -------- | ----------------------------------------------------------------------------------------- |
| `timeOffId` | `string`                                   | No       | The request to open, when you already know it. The request ID step starts filled with it. |
| `render`    | `(props: TimeOffRenderProps) => ReactNode` | Yes      | Receives `{ timeOffBag, components }`.                                                    |

`components` holds `RequestIdStep`, `NextButton`, `ReviewStep`, `RetryButton`, `BackButton`,
`ApproveButton` and `DeclineButton`.

### RequestIdStep

The request ID form: one text field, "Time off request ID" (`timeoff_id`). It takes no props.

### NextButton

Submits the request ID form and moves to `review`. Disabled while the field is blank
(`timeOffBag.hasRequestId` is `false`).

### ReviewStep

Shows the loaded request. It renders nothing while the request is loading or failed to load
the first time, so render those states yourself (see [Loading and errors](#loading-and-errors)).
A failed reload keeps the request shown, next to `timeOffRequestError`.

By default it renders a list of the request's details, in this order, each one only when it
applies:

| `name`                  | Label                             | Shown when                                                                                    |
| ----------------------- | --------------------------------- | --------------------------------------------------------------------------------------------- |
| `status`                | Status                            | Always                                                                                        |
| `team_member`           | Team member                       | The team member's employment has loaded                                                       |
| `decline_reason`        | Reason for decline                | The request is `declined` and has a `decline_reason`                                          |
| `cancelled_on`          | Cancelled on                      | The request is `cancelled` and has a `cancelled_at`                                           |
| `leave_policy`          | Type                              | Always                                                                                        |
| `start_date`            | Start date                        | Always                                                                                        |
| `end_date`              | End date                          | Always                                                                                        |
| `duration`              | Duration                          | Always                                                                                        |
| `notes`                 | Notes                             | The request has `notes`                                                                       |
| `requested_on`          | Requested on                      | The request has an `inserted_at`                                                              |
| `last_edited_on`        | Last edited on                    | Its `updated_at` differs from its `inserted_at`                                               |
| `created_by`            | Requested by                      | Its `created_by_id` resolves to a name, shown as "Name (Role)"                                |
| `edit_reason`           | Edit reason                       | The request has an `edit_reason`                                                              |
| `approved_by`           | Approved by                       | The request is `approved` or `taken` and its `approver_id` is one of the company managers     |
| `approved_on`           | Approved on                       | The request is `approved` or `taken` and has an `approved_at`                                 |
| `cancel_reason`         | Cancellation reason               | The request is `cancel_requested` or `cancelled` and has a `cancel_reason`                    |
| `cancel_decline_reason` | Reason for declining cancellation | The request is not `declined` and has a `decline_reason`: a cancellation request was declined |

"Requested by" is "Anne White (Employer)" when `created_by_id` is one of the company managers'
`user_id`. Any other `created_by_id` is taken to be the team member themselves: "Jane Smith
(Employee)", or "(Contractor)" on a contractor employment. A manager who has left the company
is the exception, see [Current limitations](#current-limitations). A request with no
`created_by_id`, for example one entered by Remote or created automatically, has no
"Requested by". Dates are shown in the browser's time zone. `updated_at` changes with every
change to the request, approval and decline included, so most decided requests have a "Last
edited on".

Read `details` by `name`, not by position. The rows that need a name (`team_member`,
`created_by`, `approved_by`) are only there once the names have loaded (see
[Requests and authentication](#requests-and-authentication)), so the entries after them move when
they arrive, and which rows a request has depends on its status and data. New detail names may be
added later, so give a `switch` on `name` a default branch.

| Prop       | Type                                                                                  | Description                                                                                                                                                                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `render`   | `({ timeOffRequest, teamMemberName, createdBy, approverName, details }) => ReactNode` | Replaces the default details. `teamMemberName`, `createdBy` (`{ name, role }`, `role` being `Employer`, `Employee` or `Contractor`) and `approverName` are the names behind the `team_member`, `created_by` and `approved_by` rows, each `undefined` until it loads. `details` are the same details, labelled and formatted. |
| `children` | `ReactNode`                                                                           | Rendered under the details, for example the Approve and Decline buttons.                                                                                                                                                                                                                                                     |

`ReviewStep` does not decide which actions fit the request. Render Approve and Decline only
when `timeOffRequest.status` is `requested` or `cancel_requested`, as in the example: those are
the statuses the API has decisions for, and the ones the list flow offers decisions for (see
[Outcomes](#outcomes)).

### ApproveButton

Approves the request under review. The route depends on the request's status:

- `requested`: `POST /v1/timeoff/{timeoff_id}/approve`.
- `cancel_requested`: `POST /v1/timeoff/{timeoff_id}/cancel-request/approve`, which approves the
  employee's request to cancel the time off. This route takes no body, so `approverId` is not sent.

Any other status is sent to `/approve`, which the API is expected to refuse.

| Prop         | Type                                                        | Required | Description                                                                                                                                                                  |
| ------------ | ----------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `approverId` | `string \| null`                                            | Yes      | Sent unchanged as `approver_id`: the `id` of a user allowed to approve time off, as listed by the company managers endpoint, or `null`. Not sent for a cancellation request. |
| `onSuccess`  | `(timeOffRequest: TimeOffRequest) => void \| Promise<void>` | No       | Receives the request as the API returns it, or as reloaded after a cancellation decision. Read the outcome from its `status`.                                                |
| `onError`    | `(error: TimeOffDecisionError) => void`                     | No       | Called when the approval fails. The button is enabled again so the user can retry.                                                                                           |

Disabled until the request is loaded and while any decision is being sent. Clicks while an
approval is in flight are ignored, so a double click sends one request. Without `children` it
renders a check icon labelled "Approve".

### DeclineButton

Declines the request under review: `POST /v1/timeoff/{timeoff_id}/decline` for a `requested`
request, `POST /v1/timeoff/{timeoff_id}/cancel-request/decline` for a `cancel_requested` one,
which declines the employee's request to cancel the time off. Same behaviour as
`ApproveButton`, with `declineReason` instead of `approverId`:

| Prop            | Type                                                        | Required | Description                                                                                                                   |
| --------------- | ----------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `declineReason` | `string \| null`                                            | Yes      | Sent unchanged as `decline_reason`, on both routes: why the request or its cancellation is declined, or `null` for none.      |
| `onSuccess`     | `(timeOffRequest: TimeOffRequest) => void \| Promise<void>` | No       | Receives the request as the API returns it, or as reloaded after a cancellation decision. Read the outcome from its `status`. |
| `onError`       | `(error: TimeOffDecisionError) => void`                     | No       | Called when the decline fails. The button is enabled again so the user can retry.                                             |

Without `children` it renders a cross icon labelled "Decline". The flow has no field for the
reason: collect it in your own UI and pass it in. The SDK sends it as given, so send `null`
rather than a blank string when the user gives no reason, as the example app does.

### RetryButton

Loads the request under review again. Disabled while it is retrying.

### BackButton

Moves to the previous step: the request ID step in `TimeOffFlow`, the list in `TimeOffListFlow`.

## Outcomes

A successful decision resolves with the request, and the review step switches to that version,
so it shows the new status. Any list of requests the SDK has loaded is refreshed.

- **On a `requested` request**, the approve and decline routes return the request, so the SDK
  uses that version without loading it again.
- **On a `cancel_requested` request**, the cancellation routes answer `{ data: { status: "ok" } }`
  without the request, so the SDK loads it again with `GET /v1/timeoff/{id}` and resolves with
  that. Approving the cancellation is expected to leave the request `cancelled`, and declining it
  to put it back to `approved`, with the reason as its `decline_reason`.

Read the result from the returned `status` instead of assuming one. The SDK shows whatever the
API answers with. Its tests cover an approval that answers `taken` and a decline that answers
`approved`; when the API does that is described in [Verification status](#verification-status).

The statuses a request can have are `requested`, `approved`, `declined`, `taken`,
`cancel_requested` and `cancelled`. All six can be loaded, listed, filtered on and shown.
Approving and declining are offered for `requested` and `cancel_requested`. The SDK picks the
route from the status of the request it holds: the loaded request on the review step, the listed
request in the list.

## Loading and errors

The flows render no loading, error or success message. They expose the state on the bag, and
you render the message:

| State                  | Read it from                     | Notes                                                                                         |
| ---------------------- | -------------------------------- | --------------------------------------------------------------------------------------------- |
| Request loading        | `timeOffBag.isLoading`           | `true` on the first load of the request under review.                                         |
| Request failed to load | `timeOffBag.timeOffRequestError` | A `TimeOffRequestError`, or `null`. Not retried automatically: render `RetryButton`.          |
| Decision being sent    | `timeOffBag.isSubmitting`        | `true` while an approval or a decline is in flight, and while the request reloads after one.  |
| Decision failed        | `onError` of the button          | A `TimeOffDecisionError`. `approve()` and `decline()` on the bag reject with the same object. |

`TimeOffRequestError` is `{ reason, status }`:

| `reason`         | When                                                                               |
| ---------------- | ---------------------------------------------------------------------------------- |
| `not_found`      | `404`: the request doesn't exist or isn't visible to the token.                    |
| `unauthorized`   | `401` or `403`: the token is rejected or lacks the access the route needs.         |
| `request_failed` | Anything else. `status` is `undefined` when no response came back (network error). |

`TimeOffDecisionError` is `{ reason, status, message, fieldErrors }`:

| `reason`         | When                                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| `not_found`      | `404`.                                                                                                   |
| `unauthorized`   | `401` or `403`.                                                                                          |
| `rejected`       | `422`: the API refuses the decision. `message` and `fieldErrors` (`{ code, field, message }[]`) say why. |
| `request_failed` | Anything else, `400`, `409` and `429` included. `status` is `undefined` when no response came back.      |

After a cancellation decision, a failed reload also rejects with a `TimeOffDecisionError`, with
the reason and status of the reload, although the decision was sent. The lists are still
refreshed; `refetchTimeOffRequest` loads the request again.

## The list flow

`TimeOffListFlow` adds a way to find a request. Its steps are `list` then `review`, and its
review step uses the same `ReviewStep`, `RetryButton`, `BackButton`, `ApproveButton` and
`DeclineButton` as `TimeOffFlow`.

### List example

```tsx
import { RemoteFlows, TimeOffListFlow } from '@remoteoss/remote-flows';
import { fetchToken } from './auth';

export function TimeOffRequests() {
  return (
    <RemoteFlows auth={fetchToken}>
      <TimeOffListFlow
        pageSize={20}
        render={({
          timeOffListBag,
          components: {
            StatusFilter,
            ListStep,
            ListRetryButton,
            PreviousPageButton,
            NextPageButton,
            ReviewStep,
            RetryButton,
            BackButton,
            ApproveButton,
            DeclineButton,
          },
        }) => {
          if (timeOffListBag.stepState.currentStep.name === 'list') {
            return (
              <>
                <StatusFilter />
                {timeOffListBag.isLoadingTimeOffRequests && <p>Loading…</p>}
                {timeOffListBag.isEmpty && (
                  <p>No time-off requests with this status.</p>
                )}
                {timeOffListBag.timeOffRequestsError && (
                  <div role='alert'>
                    <p>The requests could not be loaded.</p>
                    <ListRetryButton>Try again</ListRetryButton>
                  </div>
                )}
                <ListStep />
                <PreviousPageButton>Previous</PreviousPageButton>
                <span>
                  Page {timeOffListBag.currentPage} of{' '}
                  {timeOffListBag.totalPages}
                </span>
                <NextPageButton>Next</NextPageButton>
              </>
            );
          }

          const status = timeOffListBag.timeOffRequest?.status;
          const canDecide =
            status === 'requested' || status === 'cancel_requested';

          return (
            <>
              {timeOffListBag.isLoading && <p>Loading the request…</p>}
              {timeOffListBag.timeOffRequestError && (
                <RetryButton>Try again</RetryButton>
              )}
              <ReviewStep>
                {canDecide && (
                  <>
                    <DeclineButton declineReason={null}>Decline</DeclineButton>
                    <ApproveButton approverId={null}>Approve</ApproveButton>
                  </>
                )}
              </ReviewStep>
              <BackButton>Back to the list</BackButton>
            </>
          );
        }}
      />
    </RemoteFlows>
  );
}
```

The example app's version is `example/src/TimeOffList.tsx`.

### TimeOffListFlow

| Prop       | Type                                           | Required | Description                                                                             |
| ---------- | ---------------------------------------------- | -------- | --------------------------------------------------------------------------------------- |
| `pageSize` | `number`                                       | No       | How many requests a page holds. Sent unchanged as `page_size`; left out, the API picks. |
| `render`   | `(props: TimeOffListRenderProps) => ReactNode` | Yes      | Receives `{ timeOffListBag, components }`.                                              |

`components` holds `StatusFilter`, `ListStep`, `ViewButton`, `ListRetryButton`,
`PreviousPageButton`, `NextPageButton`, `ReviewStep`, `RetryButton`, `BackButton`,
`ApproveButton` and `DeclineButton`.

### StatusFilter

A "Status" select with the six statuses. The list starts on `requested`, the requests awaiting
a decision. Picking another status lists that status from the first page; clearing the select
keeps the current status and goes back to the first page. It takes no props.

### ListStep

Lists the requests of the loaded page. It renders nothing until a page with requests is loaded:
use `isLoadingTimeOffRequests`, `timeOffRequestsError` and `isEmpty` for those states.

By default each row shows the team member's name, once their employment loads, then the
request's type, status, start date, end date and duration, then its actions: `ViewButton`, and
for a `requested` or `cancel_requested` request `DeclineButton` and `ApproveButton`, which decide
on the cancellation for a `cancel_requested` one. Each default action is labelled
after its row ("Approve Jane Smith, Paid time off, Requested, …", or "Approve cancellation of
Jane Smith, …" for a `cancel_requested` one) for screen readers.
**The default row actions send `declineReason: null` and `approverId: null`.** To send a reason
or an approver, render your own actions with `renderActions`.

| Prop            | Type                                   | Description                                                                                                                                                     |
| --------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `render`        | `(item: TimeOffListItem) => ReactNode` | Replaces the content of each row, rendered before its actions.                                                                                                  |
| `renderActions` | `(item: TimeOffListItem) => ReactNode` | Replaces the actions of each row. `ViewButton`, `ApproveButton` and `DeclineButton` rendered here act on that row's request.                                    |
| `renderItem`    | `(item: TimeOffListItem) => ReactNode` | Replaces the whole list markup: only what it returns renders for each request, with no list or row element around it. The buttons act on that request here too. |

`TimeOffListItem` is `{ timeOffRequest, teamMemberName, createdBy, approverName, details,
listedDetails, canDecide }`: the request, the names behind it as in `ReviewStep`'s `render`, all
its details as listed in [ReviewStep](#reviewstep), the ones a row shows by default, and whether
it is `requested` or `cancel_requested` and so can be approved or declined. Read `details` and
`listedDetails` by `name`, not by position: `team_member` is their first entry once the name has
loaded and absent before, so the others move when it arrives. The accessible names of the default
row actions start with the team member's name for the same reason, so match them on the leave
type or the dates rather than on the whole label.

With `managerUserId` the user ID you want to send as the approver:

```tsx
<ListStep
  renderActions={({ canDecide }) => (
    <>
      <ViewButton>Open</ViewButton>
      {canDecide && (
        <ApproveButton approverId={managerUserId}>Approve</ApproveButton>
      )}
    </>
  )}
/>
```

Approving or declining from a row doesn't open the request: the page is reloaded and the
request leaves it if it no longer matches the status filter.

### ViewButton

Opens the row's request on the `review` step. Render it inside `ListStep`'s `renderActions` or
`renderItem`. Without children it renders an eye icon labelled "View". From your own markup,
`timeOffListBag.selectTimeOffRequest(id)` does the same.

### ListRetryButton

Loads the current page again. Disabled while it is retrying.

### PreviousPageButton and NextPageButton

Load the page before or after the loaded one. Each is disabled when there is no such page
(`hasPreviousPage`, `hasNextPage`).

### Pagination

The page numbers come from the API's `current_page` and `total_pages`; `totalCount` is the
number of requests in the current status. A status is first listed without a `page`
parameter, so the API returns its first page; Previous and Next then send the page number.

- Changing the status filter goes back to the first page.
- Back from the review step returns to the page and status the list showed.
- After a decision the page is loaded again. If a decision empties the last page, the list
  moves to the new last page instead of showing an empty one.

## The bags

`useTimeOff()` and `useTimeOffList()` are the headless equivalents of the render props, for
fully custom UIs. Each returns the same bag its flow passes to `render`. The prebuilt
components read the flow's context, so they only work inside the flow's `render`; with the hook
alone you build your own UI from the bag. Every hook must be used inside `<RemoteFlows>`.

### useTimeOff

`useTimeOff({ timeOffId? })` returns `timeOffBag`:

| Key                     | Description                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `stepState`             | The current step (`request_id` or `review`) and the step count.                          |
| `steps`                 | Every step, in order, with a label.                                                      |
| `fields`                | Fields of the request ID step.                                                           |
| `handleValidation`      | Validates the request ID step values.                                                    |
| `checkFieldUpdates`     | Feed the latest request ID values back in.                                               |
| `timeOffId`             | The ID stored when leaving the request ID step, or the one you supplied.                 |
| `hasRequestId`          | Whether the request ID step holds a non-blank ID.                                        |
| `timeOffRequest`        | The request under review, once loaded on the `review` step.                              |
| `teamMemberName`        | The full name of the team member the request under review is for, once it loads.         |
| `createdBy`             | `{ name, role }`: who entered the request under review, once the names it needs load.    |
| `approverName`          | The company manager who approved the request under review, once the managers load.       |
| `isLoading`             | `true` on the first load of the request under review.                                    |
| `timeOffRequestError`   | A `TimeOffRequestError`, or `null`.                                                      |
| `refetchTimeOffRequest` | Loads the request under review again.                                                    |
| `approve`               | `({ approverId }) => Promise<TimeOffRequest>`. Rejects with a `TimeOffDecisionError`.    |
| `decline`               | `({ declineReason }) => Promise<TimeOffRequest>`. Rejects with a `TimeOffDecisionError`. |
| `isSubmitting`          | `true` while a decision is in flight, and while the request reloads after one.           |
| `next`, `back`, `goTo`  | Move to the next step, the previous step, or a named step.                               |

`approve` and `decline` pick the route from the status of the request under review, as
`ApproveButton` and `DeclineButton` do.

### useTimeOffList

`useTimeOffList({ pageSize? })` returns `timeOffListBag`. Its review keys (`timeOffRequest`,
`teamMemberName`, `createdBy`, `approverName`, `isLoading`, `timeOffRequestError`,
`refetchTimeOffRequest`, `approve`, `decline`) work as in `useTimeOff`, on the request picked from
the list. The other keys:

| Key                                               | Description                                                                                                                                                                |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stepState`, `steps`                              | The current step (`list` or `review`) and every step.                                                                                                                      |
| `fields`, `handleValidation`, `checkFieldUpdates` | The status filter. `checkFieldUpdates({ status })` lists that status from the first page.                                                                                  |
| `status`                                          | The status the list is filtered by. Starts as `requested`.                                                                                                                 |
| `timeOffRequests`                                 | The requests of the loaded page, empty until it loads.                                                                                                                     |
| `timeOffListItems`                                | The same requests as `TimeOffListItem`s, ready to render.                                                                                                                  |
| `isEmpty`                                         | Whether the loaded page holds no request.                                                                                                                                  |
| `currentPage`, `totalPages`, `totalCount`         | Paging as the API reports it.                                                                                                                                              |
| `isLoadingTimeOffRequests`                        | `true` on the first load of a page.                                                                                                                                        |
| `timeOffRequestsError`                            | A `TimeOffRequestsError`, or `null`.                                                                                                                                       |
| `refetchTimeOffRequests`                          | Loads the current page again.                                                                                                                                              |
| `hasPreviousPage`, `hasNextPage`                  | Whether a page comes before or after the loaded one.                                                                                                                       |
| `previousPage`, `nextPage`                        | Load that page.                                                                                                                                                            |
| `selectTimeOffRequest`                            | `(id) => void`. Opens that request on the `review` step.                                                                                                                   |
| `timeOffId`                                       | The ID of the request picked from the list.                                                                                                                                |
| `approveTimeOffRequest`, `declineTimeOffRequest`  | Decide on any listed request without opening it: `({ timeOffId, approverId })`, `({ timeOffId, declineReason })`. The route follows the status the request is listed with. |
| `isSubmitting`                                    | `true` while any decision, from the review step or a row, is in flight.                                                                                                    |
| `back`, `goTo`                                    | Back to the list on the same page and status, or to a named step.                                                                                                          |

`TimeOffRequestsError` is `{ reason, status }`, with `reason` `unauthorized` (`401`, `403`),
`rejected` (`400` or `422`: the API refuses the status or paging values) or `request_failed`.

### useTimeOffRequest and useTimeOffRequests

Two read-only hooks, for showing time off elsewhere in your app without a flow:

- `useTimeOffRequest({ timeOffId })` loads one request and returns `{ timeOffRequest, isLoading,
  error, refetch }`, with `error` a `TimeOffRequestError`. Nothing loads while `timeOffId` is
  blank.
- `useTimeOffRequests({ status?, page?, pageSize? })` loads one page and returns
  `{ timeOffRequests, isEmpty, currentPage, totalPages, totalCount, isLoading, error, refetch }`,
  with `error` a `TimeOffRequestsError`. `status` defaults to `requested`. You own the page
  number.

Neither can approve or decline: decisions go through the flows or their bags.

## Requests and authentication

| Request                                                                          | Sent when                                                                                                                           | Scope (generated API docs)                        |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `GET /v1/timeoff/{id}`                                                           | The flow reaches `review`, `RetryButton`, `useTimeOffRequest`, and after a decision on a cancellation request                       | `timeoff:read` or `timeoff:write`                 |
| `GET /v1/timeoff`                                                                | The list flow or `useTimeOffRequests` mounts, the page or status changes, and again after a decision (refetch through invalidation) | `timeoff:read` or `timeoff:write`                 |
| `POST /v1/timeoff/{timeoff_id}/approve` with `{ approver_id }`                   | `ApproveButton`, `approve`, `approveTimeOffRequest`                                                                                 | `timeoff:write`                                   |
| `POST /v1/timeoff/{timeoff_id}/decline` with `{ decline_reason }`                | `DeclineButton`, `decline`, `declineTimeOffRequest`                                                                                 | `timeoff:write`                                   |
| `POST /v1/timeoff/{timeoff_id}/cancel-request/approve`, no body                  | `ApproveButton`, `approve`, `approveTimeOffRequest` on a `cancel_requested` request                                                 | `timeoff:write`                                   |
| `POST /v1/timeoff/{timeoff_id}/cancel-request/decline` with `{ decline_reason }` | `DeclineButton`, `decline`, `declineTimeOffRequest` on a `cancel_requested` request                                                 | `timeoff:write`                                   |
| `GET /v1/employments/{employment_id}`                                            | Once per employment behind a listed or reviewed request, for the session                                                            | `employment:read` or `employment:write`           |
| `GET /v1/company-managers`, every page of 100                                    | Once per `RemoteFlows` mount, when the list flow mounts or a request is first reviewed                                              | `company_manager:read` or `company_manager:write` |

The list sends only `status`, `page` (once the user changes page) and `page_size` (when you
pass `pageSize`). According to the generated API docs, a token with only `timeoff:read` can load
requests but not approve or decline them.

The time-off routes don't return names, so the SDK resolves them. The team member's name and
employment type come from the employment behind each request. Who entered a request
(`created_by_id`) and who approved it (`approver_id`) are matched against the `user_id` of the
company managers. Rows and the review render from the time-off data alone and the names fill in
when they arrive. If a name can't be loaded, for example with a token that lacks
`employment:read` or `company_manager:read`, the rows that need it are left out and everything
else works as before: no error is reported and the request is not retried. "Requested by" needs
the company managers, so it is left out whenever they can't be loaded.

The requests carry the token your `auth` function returns, like every flow. The generated API
docs accept two token types on these routes: a company-scoped access token (Authorization Code
or Refresh Token flow) and a Customer API token. See
[Authentication](../../../README.md#authentication).

## Time-off versions and approvers

**You don't choose a time-off version.** The SDK has a single path: the same `/v1/timeoff`
routes for every company and employment, with no prop, option or header to pick a version. The
generated API client has no second variant of these routes either.

**One decision per request.** A request has one `approver_id` and one `approved_at`. The SDK
sends one approval and treats its answer as the outcome: it does not model approval steps, a
chain of approvers or a request waiting for another approver.

## Verification status

This page separates three kinds of statement.

**What the SDK does.** Everything in the sections above about steps, buttons, requests sent,
caching, paging and error mapping is read from the code in `src/flows/TimeOff` and covered by
its unit tests, which run against mocked API responses. These include: no request on the request
ID step, one request per double click, the outcome taken from the returned `status`, `401` and
`403` both reported as `unauthorized`, and `422` errors read whether the API puts `message` and
`field_errors` at the top level or under `error`.

**What the generated API client declares.** The routes, request bodies, statuses, scopes and
token types come from the client generated from the API's published OpenAPI description:

- `approver_id` and `decline_reason` are required keys whose value may be `null`. The meaning of
  `approver_id: null` is not documented.
- A request has the six statuses listed in [Outcomes](#outcomes). It carries `decline_reason`,
  `edit_reason`, `inserted_at`, `updated_at` and `created_by_id`, which the API returns once the
  change that adds these fields to time-off responses is live. Until then the rows that need them
  are left out.
- The approve and decline routes declare `400`, `401`, `404`, `422` and `429`. No route here
  declares `403`.
- The decline route documents that only `requested` requests can be declined.
- The cancellation routes answer `{ data: { status } }`, not the request. Their approve route
  takes no body and documents that the request must be `cancel_requested`; their decline route
  requires `decline_reason`, which may be `null`. Approve declares `401`, `404`, `422` and `429`,
  decline the same plus `409`.
- The list route states no default or maximum for `page` and `page_size`.

**Not yet verified against the live API.** The ID-based flow has not been run end to end against
the sandbox yet. Until it is, these points are expected but unconfirmed:

- Which status a token without the needed access gets, `401` or `403`. The SDK reports both as
  `unauthorized`.
- Approving or declining a request that is no longer `requested`, for example one already
  approved, may return `404` rather than `409`. The SDK reports it as `not_found`.
- Approving a request whose dates have passed may come back as `taken` instead of `approved`.
- Declining a request the system created on its own (`automatic: true`, such as a public holiday)
  may come back as `approved`.
- What `approver_id: null` does, and whether the API records the `approver_id` you send or the
  user behind the token.
- Deciding on a cancellation request: that approving it leaves the request `cancelled` and
  declining it puts it back to `approved` with the reason as its `decline_reason`, whether an
  empty `decline_reason` is accepted like `null`, and what a request that is no longer
  `cancel_requested` answers (`404`, `409` or `422`).
- Which requests a token can see. A request outside it is expected to answer `404`.
- What `GET /v1/employments/{employment_id}` and `GET /v1/company-managers` answer for a token
  without `employment:read` or `company_manager:read`, and whether every employment behind a
  listed request can be loaded with the same token. The SDK leaves the names out whatever the
  failure.
- The default and largest `page_size`, and whether a Customer API token works on the read routes,
  whose generated header description names only the company-scoped access token.
- The `field_errors` codes a `422` carries.
- Whether these routes behave the same whatever time-off version a company is on, with any
  difference handled by the API.

## Current limitations

- **Review and decide only.** Creating, editing or cancelling a request are not part of these
  flows.
- **Not shown.** The API does not return the approvers a request still waits for ("Pending
  approval from"), attachments, payroll periods, or who declined a request and when, so the
  details leave them out.
- **Departed managers show as the team member.** A request entered by a company manager who
  has since left the company shows the team member as the person who requested it, because
  the API no longer lists that manager.
- **Status is the only filter.** The list can't be filtered by employee, dates or type, or
  sorted.
- **No ID check before review.** Any non-blank ID moves on; an unknown one shows as `not_found`
  on the review step.
- **No automatic retries.** A failed load stays failed until `RetryButton`, `ListRetryButton` or
  a `refetch` call.
- **English, `en-US` copy.** Field labels, status names, detail labels, dates (`Nov 16, 2026`)
  and durations (`16 hours`) are fixed. Use `ReviewStep`'s `render` and `ListStep`'s `render` or
  `renderItem` to show your own.
