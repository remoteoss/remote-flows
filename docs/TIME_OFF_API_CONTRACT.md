# Time Off API Contract (manager side)

This page records what the generated API client says about the time-off
endpoints a manager uses to read, approve and decline time-off requests. It is
a static reading of the repo. It also records answers read from the source of
Tiger, the backend service behind the API gateway. None of it was checked
against the live API.

## Sources

- `src/client/sdk.gen.ts`: the generated request functions and their JSDoc
  (summary, authentication, scopes table).
- `src/client/types.gen.ts`: the generated request, response and error types.
- `src/flows/TimeOff/api.ts`, `hooks.tsx` and `types.ts`: which generated
  exports the SDK already uses.
- Tiger, the backend service behind the gateway: the services
  `Tiger.Timeoff.Services.ApproveTimeoff` and `DeclineTimeoff`, the policy
  `Tiger.Policy.Employer.TimeoffPolicy`, the paginator `Remote.Ecto.Paginator`,
  `TimeoffStatus`, the employer `TimeoffController` and the daily job
  `SetTimeoffRequestAsTakenWorker`. The public gateway routes are not in Tiger.
  Tiger's own employer routes are addressed differently, and its approve route
  takes no body. So every **[tiger]** fact describes the service behind the
  gateway, not what the gateway sends back.

No OpenAPI file is checked into the repo. `openapi-ts.config.ts` generates
`src/client/` from the gateway's published OpenAPI spec. Everything below is
based on the generated client at the commit this page was added in. Run
`git log -- src/client/types.gen.ts` to see whether the client was regenerated
since.

Each fact carries a label that says where it comes from:

| Label         | Meaning                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **[types]**   | A generated type in `types.gen.ts` (field names, optionality, unions).                                                           |
| **[doc]**     | Generated JSDoc, copied from the OpenAPI descriptions.                                                                           |
| **[sdk]**     | Code the SDK wrote itself in `src/flows/TimeOff/`.                                                                               |
| **[assumed]** | A value or behaviour we expected the API to have, which the generated client does not confirm.                                   |
| **[tiger]**   | Behaviour read from the Tiger backend source. It is not visible in the generated client, and the gateway may map it differently. |

## Operations at a glance

| Operation            | Method and route                                 | Generated function                      | Used by the SDK                                                          |
| -------------------- | ------------------------------------------------ | --------------------------------------- | ------------------------------------------------------------------------ |
| Show one request     | `GET /v1/timeoff/{id}`                           | `getV1TimeoffId`                        | Yes, `TimeOff/api.ts`                                                    |
| List requests        | `GET /v1/timeoff`                                | `getV1Timeoff`                          | Yes, `TimeOff/api.ts` and `src/common/api/timeoff.ts` (Termination flow) |
| List time off types  | `GET /v1/timeoff/types`                          | `getV1TimeoffTypes`                     | No                                                                       |
| Approve a request    | `POST /v1/timeoff/{timeoff_id}/approve`          | `postV1TimeoffTimeoffIdApprove`         | Yes, `TimeOff/api.ts`                                                    |
| Decline a request    | `POST /v1/timeoff/{timeoff_id}/decline`          | `postV1TimeoffTimeoffIdDecline`         | Yes, `TimeOff/api.ts`                                                    |
| Leave policy summary | `GET /v1/leave-policies/summary/{employment_id}` | `getV1LeavePoliciesSummaryEmploymentId` | Yes, `src/common/api/timeoff.ts` (Termination flow)                      |
| Leave policy details | `GET /v1/leave-policies/details/{employment_id}` | `getV1LeavePoliciesDetailsEmploymentId` | No                                                                       |

Generated type names for each operation **[types]**:

| Generated function                      | Request type                                | Success type                                     | Error type                                    |
| --------------------------------------- | ------------------------------------------- | ------------------------------------------------ | --------------------------------------------- |
| `getV1TimeoffId`                        | `GetV1TimeoffIdData`                        | `GetV1TimeoffIdResponses`                        | `GetV1TimeoffIdErrors`                        |
| `getV1Timeoff`                          | `GetV1TimeoffData`                          | `GetV1TimeoffResponses`                          | `GetV1TimeoffErrors`                          |
| `getV1TimeoffTypes`                     | `GetV1TimeoffTypesData`                     | `GetV1TimeoffTypesResponses`                     | `GetV1TimeoffTypesErrors`                     |
| `postV1TimeoffTimeoffIdApprove`         | `PostV1TimeoffTimeoffIdApproveData`         | `PostV1TimeoffTimeoffIdApproveResponses`         | `PostV1TimeoffTimeoffIdApproveErrors`         |
| `postV1TimeoffTimeoffIdDecline`         | `PostV1TimeoffTimeoffIdDeclineData`         | `PostV1TimeoffTimeoffIdDeclineResponses`         | `PostV1TimeoffTimeoffIdDeclineErrors`         |
| `getV1LeavePoliciesSummaryEmploymentId` | `GetV1LeavePoliciesSummaryEmploymentIdData` | `GetV1LeavePoliciesSummaryEmploymentIdResponses` | `GetV1LeavePoliciesSummaryEmploymentIdErrors` |
| `getV1LeavePoliciesDetailsEmploymentId` | `GetV1LeavePoliciesDetailsEmploymentIdData` | `GetV1LeavePoliciesDetailsEmploymentIdResponses` | `GetV1LeavePoliciesDetailsEmploymentIdErrors` |

Cancellation routes (including the cancel-request approve and decline routes),
employee-side routes (`/v1/employee/timeoff...`), `timeoff-balances`, the
create route (`POST /v1/timeoff`) and the update routes (`PATCH`/`PUT
/v1/timeoff/{id}`) are intentionally not covered here.

## Authentication and scopes

Every operation above lists the same two security schemes in its generated
`security` array **[types]**, and its JSDoc says it accepts either one
**[doc]**:

- **Company-scoped access token** (`OAuth2AuthorizationCode`), from the
  Authorization Code flow or the Refresh Token flow.
- **Customer API token** (`CustomerAPIToken`), generated by the customer on
  their Integration Settings page.

The JSDoc scopes table, category `time_and_attendance` ("Manage timeoffs")
**[doc]**:

| Operation                     | Read only scope | Write scope (read access implicit) |
| ----------------------------- | --------------- | ---------------------------------- |
| Show, list, types             | `timeoff:read`  | `timeoff:write`                    |
| Leave policy summary, details | `timeoff:read`  | `timeoff:write`                    |
| Approve, decline              | none (`-`)      | `timeoff:write`                    |

According to that JSDoc, reads accept `timeoff:read` or `timeoff:write`, and
approving and declining need `timeoff:write`.

One mismatch inside the generated client: the request types of the show, list
and types operations declare a required `headers.Authorization: string`, and its
description says it "requires a Company-scoped access token" only **[types]**.
The JSDoc of the same operations accepts the Customer API token too **[doc]**.
The approve, decline and leave policy request types declare no headers at all
**[types]**. The TimeOff flow passes `Authorization: ''` to every call, and the
SDK client adds the real token **[sdk]**.

The roles and permissions Tiger checks behind these scopes are in question 10
below **[tiger]**.

## Shared response shapes

### `Timeoff` (one time-off request) **[types]**

`TimeoffResponse` wraps one record as `data.timeoff: Timeoff` (both required).

| Field                     | Type                                    | Required | Nullable | Note **[doc]**                                                                 |
| ------------------------- | --------------------------------------- | -------- | -------- | ------------------------------------------------------------------------------ |
| `id`                      | `string`                                | yes      | no       | UUID of the time-off record.                                                   |
| `employment_id`           | `string`                                | yes      | no       | UUID of the employment.                                                        |
| `status`                  | union, see below                        | yes      | no       | Current status of the request.                                                 |
| `start_date`              | `string`                                | yes      | no       | First day, ISO 8601 date.                                                      |
| `end_date`                | `string`                                | yes      | no       | Last day, ISO 8601 date.                                                       |
| `timeoff_type`            | `ResponseTimeoffType`                   | yes      | no       |                                                                                |
| `timeoff_days`            | `Array<TimeoffDay>`                     | yes      | no       | Each day has `day`, `hours` and `minutes`.                                     |
| `total_minutes`           | `number`                                | yes      | no       | Always the sum of the per-day `minutes`.                                       |
| `timezone`                | `Timezone` (`string`)                   | yes      | no       |                                                                                |
| `leave_policy`            | `LeavePolicy`                           | yes      | no       | `name`, `leave_type`, `leave_policy_variant_slug`.                             |
| `approver_id`             | `NullableApproverId` (`string \| null`) | no       | yes      | The `id` of a user allowed to approve time off.                                |
| `approved_at`             | `string \| null`                        | no       | yes      | Null if not yet approved.                                                      |
| `automatic`               | `boolean`                               | no       | no       | Created by the system (the example given is public holidays), not requested.   |
| `cancel_reason`           | `string \| null`                        | no       | yes      | Null if not cancelled.                                                         |
| `cancelled_at`            | `NullableDateTime`                      | no       | yes      |                                                                                |
| `document`                | `File`                                  | no       | no       |                                                                                |
| `leave_policy_variant_id` | `string \| null`                        | no       | yes      | Leave type UUID, custom policy variant UUID, or null for standard leave types. |
| `notes`                   | `string \| null`                        | no       | yes      | Optional notes from the employee.                                              |

The record has no `decline_reason`, no `declined_at` and no field naming who
declined **[types]**.

### Time-off status

`TimeoffStatus` (used by the list filter) and the inline union on
`Timeoff.status` hold the same six values **[types]**. Their descriptions
**[doc]**, and how Tiger sets them **[tiger]**:

| Value              | Description **[doc]**                                                        | How Tiger sets it **[tiger]**                                                                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `requested`        | Submitted by the employee, awaiting approval.                                | The system also creates automatic public holidays in this status. Approve and decline only accept this status.                                                                                |
| `approved`         | Approved by a manager.                                                       | Set by approve when `end_date` is today or later (UTC). Also set by decline on an automatic public holiday (see Decline).                                                                     |
| `declined`         | Declined by a manager.                                                       | Set by decline.                                                                                                                                                                               |
| `cancelled`        | Cancelled by the employee or an admin.                                       | Not checked.                                                                                                                                                                                  |
| `taken`            | The approved time off has been taken (the dates have passed).                | Set by approve when `end_date` is before today (UTC). A daily job (`SetTimeoffRequestAsTakenWorker`) also moves `approved` requests whose dates have passed to `taken`, without any API call. |
| `cancel_requested` | The employee asked to cancel an approved time off, pending manager approval. | Not accepted by approve or decline (they return 404). It has its own routes, which this page does not cover.                                                                                  |

### Error types **[types]**

| Type                          | Shape                                                                                                                               |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `BadRequestResponse`          | `{ message: string }` or `{ message?: { code: string; message: string } }`.                                                         |
| `UnauthorizedResponse`        | `{ message: string }`.                                                                                                              |
| `NotFoundResponse`            | `{ message?: string }`.                                                                                                             |
| `UnprocessableEntityResponse` | `{ errors: Record<string, unknown> }` or `{ message: string \| ParameterError \| ActionError \| ... }`.                             |
| `TimeoffErrorResponse`        | `message: string`, `field_errors: Array<{ code: string; field: string \| null; message: string }>`, optional nullable `errors` map. |
| `TooManyRequestsResponse`     | `{ message?: string }`.                                                                                                             |

On `TimeoffErrorResponse`, the JSDoc says `field_errors` is always present and
`errors` is kept for compatibility and may be absent **[doc]**.

### Declared error statuses per operation **[types]**

| Operation                     | 400 | 401 | 403 | 404 | 409 | 422                           | 429 |
| ----------------------------- | --- | --- | --- | --- | --- | ----------------------------- | --- |
| Show, list, types             | yes | yes | no  | yes | no  | `UnprocessableEntityResponse` | yes |
| Approve, decline              | yes | yes | no  | yes | no  | `TimeoffErrorResponse`        | yes |
| Leave policy summary, details | no  | yes | no  | yes | no  | `UnprocessableEntityResponse` | no  |

No in-scope operation declares 403 or 409. The 429 entries use
`TooManyRequestsResponse`, but their description reads "Unprocessable Entity"
**[types]**.

## Operations

### Show one request: `GET /v1/timeoff/{id}`

- Function: `getV1TimeoffId`. Summary: "Show Time Off" **[doc]**.
- Path: `id: string`, required, "Timeoff ID" **[types]**.
- Query and body: none (`never`) **[types]**.
- Headers: `Authorization: string`, required (see Authentication) **[types]**.
- Success: `200: TimeoffResponse` **[types]**.
- Errors: 400, 401, 404, 422 (`UnprocessableEntityResponse`), 429 **[types]**.

### List requests: `GET /v1/timeoff`

- Function: `getV1Timeoff`. Summary: "List Time Off", "Lists all Time Off
  records" **[doc]**.
- Path and body: none **[types]**.
- Headers: `Authorization: string`, required **[types]**.
- Query: the whole `query` object is optional, and so is every parameter in it
  **[types]**:

| Parameter       | Type                         | Description **[doc]**                                                                                                         |
| --------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `employment_id` | `string`                     | Only time off for this employment.                                                                                            |
| `timeoff_type`  | `ResponseTimeoffType`        | Filter by type. Accepts every value a record may carry.                                                                       |
| `status`        | `TimeoffStatus`              | Filter by status.                                                                                                             |
| `start_date`    | `Date` (`string`)            | ISO 8601. With `end_date`: records overlapping the window, partial overlaps included. Alone: records starting on or after it. |
| `end_date`      | `Date` (`string`)            | ISO 8601. With `start_date`: same overlap rule. Alone: records ending on or before it.                                        |
| `order`         | `'asc' \| 'desc'`            | Sort order.                                                                                                                   |
| `sort_by`       | `'timeoff_type' \| 'status'` | Field to sort by.                                                                                                             |
| `page`          | `number`                     | "Starts fetching records after the given page".                                                                               |
| `page_size`     | `number`                     | "Number of items per page".                                                                                                   |

- No default, minimum or maximum is stated for `page` or `page_size`
  **[types]** **[doc]**.
- Tiger's paginator: `page` is 1-based and `page <= 0` is treated as 1.
  `page_size` defaults to 20 and a value below 1 becomes 1. A `page_size`
  above 500 is not rejected: Tiger only logs a warning. So 500 is a
  recommended maximum, not a hard limit today. A non-integer `page` or
  `page_size` is an invalid-argument error **[tiger]**.
- These Tiger values differ from the SDK's `UseTimeOffListOptions.pageSize`
  JSDoc, which says `1` to `100` with `20` by default **[sdk]**. Whether the
  gateway applies Tiger's values was not checked.
- Success: `200: ListTimeoffResponse` **[types]**. Every level is optional:
  `data?.timeoffs?: Array<Timeoff>`, `data?.current_page?`, `data?.total_count?`,
  `data?.total_pages?` (all `number`).
- Errors: 400, 401, 404, 422 (`UnprocessableEntityResponse`), 429 **[types]**.
- The SDK sends only `status`, `page` and `page_size` (`TimeOffRequestsQuery`
  in `TimeOff/api.ts`) **[sdk]**.

### List time off types: `GET /v1/timeoff/types`

- Function: `getV1TimeoffTypes`. Summary: "List Time Off Types" **[doc]**.
- Query: `type?: TimeoffTypesEmploymentType` (`'contractor' | 'full_time'`),
  optional **[types]**. Leaving it out returns the full-time types, the same as
  before the parameter existed **[doc]**.
- Headers: `Authorization: string`, required **[types]**.
- Success: `200: ListTimeoffTypesResponse`, that is
  `data?.timeoff_types: Array<TimeoffTypeResponse>`, each with `name:
  TimeoffType` and `description?: string | null` **[types]**.
- `TimeoffType` has 18 values, while `ResponseTimeoffType` (used on records and
  the list filter) has 48 **[types]**.
- Errors: 400, 401, 404, 422 (`UnprocessableEntityResponse`), 429 **[types]**.

### Approve a request: `POST /v1/timeoff/{timeoff_id}/approve`

- Function: `postV1TimeoffTimeoffIdApprove`. Summary: "Approve Time Off",
  "Approve a time off request" **[doc]**.
- Path: `timeoff_id: string`, required **[types]**.
- Body: `ApproveTimeoffParams`, required **[types]**:
  - `approver_id: NullableApproverId`, that is `string | null`. The key is
    required; its value may be `null` **[types]**.
  - The JSDoc says it matches the `id` of a user who may approve time-off
    requests, and points to the company managers endpoint to find them
    **[doc]**. It does not say what `null` means.
  - Tiger records the authenticated user as the approver and has no
    `approver_id` input **[tiger]**. Whether the gateway uses the body value is
    not known.
- Success: `200: TimeoffResponse` **[types]**.
- A request whose `end_date` is before today (UTC) comes back as `taken`, with
  `approved_at` and `approver_id` set. Otherwise it comes back as `approved`
  **[tiger]**.
- Errors: 400, 401, 404, 422 (`TimeoffErrorResponse`), 429 **[types]**.
- Approving a request that is not in the `requested` status returns 404, not 409. This includes a request that is already approved **[tiger]**.
- Time off linked to a leave of absence cannot be approved: 422 **[tiger]**.
- The SDK sends `approver_id` exactly as the partner passes it, `null`
  included (`TimeOffApproveOptions.approverId`) **[sdk]**.

Side effects **[tiger]**: the employee gets an email and a push notification,
a webhook is enqueued, and the time-off ledger is updated.

### Decline a request: `POST /v1/timeoff/{timeoff_id}/decline`

- Function: `postV1TimeoffTimeoffIdDecline`. Summary: "Decline Time Off"
  **[doc]**.
- The JSDoc says only requests in the `requested` status can be declined
  **[doc]**.
- Path: `timeoff_id: string`, required **[types]**.
- Body: `DeclineTimeoffParams`, required **[types]**:
  - `decline_reason: string | null`. The key is required; its value may be
    `null` **[types]**.
- Success: `200: TimeoffResponse` **[types]**. The returned record has no
  field holding the decline reason (see `Timeoff`).
- Errors: 400, 401, 404, 422 (`TimeoffErrorResponse`), 429 **[types]**.
- Declining a request that is not in the `requested` status returns 404
  **[tiger]**.
- Time off linked to a leave of absence cannot be declined: 422 **[tiger]**.
- Declining an automatic public holiday (`automatic: true`, type
  `public_holiday`, status `requested`) does not decline it. Tiger reverts it:
  the status becomes `approved` and the original dates are restored. The
  response is the same `TimeoffResponse`, with `status: approved` **[tiger]**.
- The SDK sends `decline_reason` exactly as the partner passes it
  (`TimeOffDeclineOptions.declineReason`) **[sdk]**.

Side effects **[tiger]**: the employee gets a notification email that uses the
decline reason, the time-off ledger is rolled back, and the days are unlinked
from payroll runs.

### Leave policy summary: `GET /v1/leave-policies/summary/{employment_id}`

- Function: `getV1LeavePoliciesSummaryEmploymentId`. Summary: "List Leave
  Policies Summary", all the time-off data for one employment **[doc]**.
- Path: `employment_id: string`, required. No query, body or headers
  **[types]**.
- Success: `200: ListLeavePoliciesSummaryResponse`, that is
  `data: Array<LeavePolicySummary>` **[types]**. Each entry has
  `leave_policy` (`name`, `description`, `leave_type`, `leave_policy_variant_id`,
  `unit: 'days' | 'hours' | 'unlimited'`), `working_hours_per_day`, and the
  amounts `annual_balance`, `annual_entitlement`, `balance`,
  `current_entitlement` (limited `{ days, hours }` or `unlimited`) and
  `booked`, `pending_approval`, `taken`, `upcoming_approved`,
  `upcoming_requested`, `used` (always limited `{ days, hours }`).
- Errors: 401, 404, 422 (`UnprocessableEntityResponse`) **[types]**.

### Leave policy details: `GET /v1/leave-policies/details/{employment_id}`

- Function: `getV1LeavePoliciesDetailsEmploymentId`. Summary: "List Leave
  Policies Details", the custom and standard leave policies of one employment
  **[doc]**.
- Path: `employment_id: string`, required. No query, body or headers
  **[types]**.
- Success: `200: ListLeavePoliciesDetailsResponse`, that is
  `data: Array<LeavePolicyDetails>`, each with `custom: boolean`, `name:
  string`, `leave_policy_variant_id` (a UUID or a leave type value) and
  `uses_accrual_as_balance?: boolean` **[types]**.
- Errors: 401, 404, 422 (`UnprocessableEntityResponse`) **[types]**.

## Specific contract points

| Point                       | What the client says                                                                                                                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `approver_id` on approve    | Required key, nullable value (`string \| null`) **[types]**. No meaning of `null` is documented **[doc]**.                                                                                                                     |
| `decline_reason` on decline | Required key, nullable value (`string \| null`) **[types]**. No length or content rule is documented.                                                                                                                          |
| `taken` status              | In the enum: "the approved time off has been taken (the dates have passed)" **[doc]**. Nothing says what approving a request whose dates have passed returns.                                                                  |
| `public_holiday`            | A value of `ResponseTimeoffType`, `TimeoffType` and the leave policy `leave_policy_variant_id` unions **[types]**, and the example given for `automatic: true` records **[doc]**. It is not a status and not a decline reason. |
| V1/V2 variants              | No in-scope operation has a second variant.                                                                                                                                                                                    |
| Pagination                  | `page` and `page_size`, both optional `number`, with no default or maximum **[types]**. Other list endpoints in the same file say "defaults to 20, limited to 100"; the time-off list does not.                                |
| Several approvers           | A record has one `approver_id` and one `approved_at` **[types]**. Nothing defines a list of approvers, approval steps or an approval chain.                                                                                    |

What Tiger does on these points is in Discrepancies and in the answers below.

## Discrepancies

Differences between what we expected the API to have, what the generated
client says and what Tiger does. The "Assumed" column and the **[assumed]**
label mark a value or behaviour we expected, which the generated client does
not confirm. The "Tiger" column holds **[tiger]** facts only; the gateway layer
was not checked.

| Area                      | Assumed                                                                                                                 | Generated client                                                                                                                                                                  | Tiger **[tiger]**                                                                                                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Export names              | `getV1TimeoffId`, `getV1Timeoff`, `getV1TimeoffTypes`, `postV1TimeoffTimeoffIdApprove`, `postV1TimeoffTimeoffIdDecline` | All five exist under these names. No difference.                                                                                                                                  | Not checked.                                                                                                                                                                           |
| Leave policy routes       | Names not confirmed                                                                                                     | `getV1LeavePoliciesSummaryEmploymentId` and `getV1LeavePoliciesDetailsEmploymentId`, both keyed by `employment_id`, not by a time-off id.                                         | Not checked.                                                                                                                                                                           |
| Scopes                    | Reads `timeoff:read`, decisions `timeoff:write`                                                                         | Same. Reads also accept `timeoff:write` (read access implicit). Decisions have no read-only scope.                                                                                | Tiger also checks a role and a permission (see question 10).                                                                                                                           |
| Authentication modes      | Two modes                                                                                                               | Two modes in the JSDoc and `security` arrays. But the `Authorization` header description on the show, list and types request types names only the company-scoped access token.    | Not checked.                                                                                                                                                                           |
| `approver_id`             | Possibly "null defaults to the token's user"                                                                            | Nullable, required key. No documented meaning of `null`. **[assumed]**                                                                                                            | Tiger records the authenticated user as the approver. Whether the gateway uses the body value is not known.                                                                            |
| `decline_reason`          | Required or optional, nullable or not                                                                                   | Required key, nullable. The response record has no field to read it back.                                                                                                         | Used in the notification email to the employee.                                                                                                                                        |
| Error declarations        | 401, 403, 404, 409, 422, 429                                                                                            | 403 and 409 are not declared on any in-scope operation. 400 is declared on the five time-off operations. The leave policy routes declare only 401, 404 and 422.                   | Tiger never returns 409 for an already-decided request: approve and decline return 404 on any status other than `requested`.                                                           |
| 422 type                  | One error shape                                                                                                         | Approve and decline use `TimeoffErrorResponse`; the reads use `UnprocessableEntityResponse`.                                                                                      | Not checked.                                                                                                                                                                           |
| Pagination defaults       | `page` 1, `page_size` 20, maximum 500                                                                                   | None stated. The SDK's own `UseTimeOffListOptions.pageSize` JSDoc says `1` to `100` with `20` by default **[sdk]**, which the generated time-off list type does not state either. | 20 default, 500 soft maximum (Tiger). `page` is 1-based. This does not match the SDK JSDoc (`1` to `100`, default `20`).                                                               |
| `taken` on a past request | Approving a past request returns `taken`                                                                                | `taken` is in the enum. The return of approving a past request is not described.                                                                                                  | Confirmed when `end_date` is before today (UTC). A request that started in the past and ends today or later stays `approved`. A retroactive-window check can reject very old requests. |
| `public_holiday`          | Automatic decline for public holidays                                                                                   | Only a time off type and the example for `automatic` records. No decline behaviour is described.                                                                                  | Nothing is declined automatically. Declining an automatic public holiday reverts it and returns `approved`.                                                                            |
| Several approvers         | Multi-approver behaviour                                                                                                | One `approver_id` per record. No approval chain.                                                                                                                                  | One `approver_id` per record. Tiger has a multi-reviewer mechanism; its use for time off is unknown.                                                                                   |
| V1/V2 variants            | Possible `...Id2` exports                                                                                               | None for the in-scope operations.                                                                                                                                                 | Not checked.                                                                                                                                                                           |

## Questions and answers

These questions were first listed as needing the real API. The generated
client does not answer them. Each one now has an answer, its source label and
a confidence:

- **Tiger code**: confirmed by reading the Tiger source. The gateway layer was
  not checked, so the gateway may still map the behaviour differently.
- **Not confirmed**: needs a real call against the gateway, or its owners.

1. Which requests return 401, and which return 403, given that 403 is not
   declared?
   - Answer: a caller without the needed role (see question 10) gets an
     "unauthorized" error from Tiger. Which HTTP status the gateway sends for
     it is not known. 403 is likely in practice, but it is not declared.
   - Source: **[tiger]** for the error, none for the status.
   - Confidence: Not confirmed.
2. When does each route return 404: an unknown id, a request from another
   company, an employment the token cannot see?
   - Answer: 404 when the id is unknown, when the request is outside the
     caller's company scope (see question 10), or, on approve and decline,
     when the request is not in the `requested` status (already approved,
     declined, cancelled, taken or `cancel_requested`). So approving an
     already-approved request returns 404, not 409.
   - Source: **[tiger]**.
   - Confidence: Tiger code. The gateway layer was not checked.
3. Can any route return 409, for example on a request that was already
   approved or declined?
   - Answer: no. Tiger returns 404 for an already-decided request (see
     question 2). This matches the generated client, which declares no 409.
   - Source: **[tiger]**.
   - Confidence: Tiger code. The gateway layer was not checked.
4. What makes approve and decline return 422, and which `field_errors` codes
   come back?
   - Answer: time off linked to a leave of absence cannot be approved or
     declined, and Tiger refuses it with a 422. The retroactive-window
     rejection on approve (see question 5) is also an error, probably a 422.
     The `field_errors` codes are not known.
   - Source: **[tiger]**.
   - Confidence: Tiger code for the causes. Not confirmed for the codes. The
     gateway layer was not checked.
5. What happens when a manager approves a request whose dates have passed:
   does the record come back as `taken`, `approved`, or an error?
   - Answer: Tiger sets `taken` when `end_date` is before today (UTC), and
     `approved` otherwise. The record comes back with `approved_at` and
     `approver_id` set. The check is on `end_date`, not `start_date`: a
     request that started in the past and ends today or later stays
     `approved`. It is not an error, with one exception: for employments on
     the newer time-off version (v2), Tiger rejects a request that is more
     than one year old and also outside the leave cycle before the current
     one. The error code for that rejection is not known.
   - Source: **[tiger]**.
   - Confidence: Tiger code. The gateway layer was not checked.
6. Are requests on a public holiday declined automatically, and if so, how does
   the record show it?
   - Answer: no. The system creates an automatic public holiday
     (`automatic: true`, type `public_holiday`) in the `requested` status.
     Declining it reverts it instead: the status becomes `approved` and the
     original dates are restored. The decline response is the same
     `TimeoffResponse`, with `status: approved`.
   - Source: **[tiger]**.
   - Confidence: Tiger code. The gateway layer was not checked.
7. What happens when two managers decide the same request at the same time?
   - Answer: approve and decline run under one lock per employment
     (`RunWithEmploymentLock`), so they run one after the other. The second
     decision finds the request no longer `requested` and gets a 404, not a
     409 or a 422.
   - Source: **[tiger]**.
   - Confidence: Tiger code. The gateway layer was not checked.
8. What do `page` and `page_size` default to, and what is the largest
   `page_size` accepted? Is `page` 1-based?
   - Answer: `page` is 1-based and `page <= 0` is treated as 1. `page_size`
     defaults to 20, a value below 1 becomes 1, and a value above 500 is
     accepted with a logged warning. So 500 is a soft maximum. A non-integer
     value is an invalid-argument error. This does not match the SDK's
     `UseTimeOffListOptions.pageSize` JSDoc (`1` to `100`, default `20`).
   - Source: **[tiger]**.
   - Confidence: Tiger code. Whether the gateway applies the same values is
     not confirmed.
9. What does `approver_id: null` do on approve?
   - Answer: Tiger records the authenticated user as the approver. Its approve
     route has no `approver_id` input. Whether the gateway uses the body value
     is not known. No meaning of `null` is documented.
   - Source: **[tiger]** for the approver Tiger records, **[doc]** for the
     missing documentation.
   - Confidence: Not confirmed.
10. Which managers can approve or decline which requests, and how do company
    roles and manager permissions limit that?
    - Answer: `TimeoffPolicy` needs a company-admin-type role: edit access in
      `EmployerAuthorization`, or the older "people manager" permission. The
      employer `TimeoffController` also needs `time-off-management:update` to
      approve or decline, and `time-off-management:read` to show or list.
      Tiger only returns time off of the caller's company that falls in the
      caller's reporting scope. So a manager sees the requests of the people
      they report on, which can explain a 404 on a colleague's request. A
      per-customer setting can widen the scope to company-wide time off of
      paid types.
    - Source: **[tiger]**.
    - Confidence: Tiger code. The gateway layer was not checked.
11. Can a request need more than one approver?
    - Answer: a time-off record has one `approver_id` and one `approved_at`.
      Tiger has a multi-reviewer mechanism; its use for time off is unknown.
    - Source: **[types]** and **[tiger]**.
    - Confidence: Tiger code for the record. Not confirmed for the
      multi-reviewer mechanism.
12. Does the deployed API differ from this generated client (fields, statuses,
    errors), and from one deployed version to another?
    - Answer: it cannot be answered by reading code. To check, compare
      `git log -- src/client/types.gen.ts` with the gateway's current
      published OpenAPI spec.
    - Source: none.
    - Confidence: Not confirmed. Needs a runtime check.
13. Does the Customer API token work on the show, list and types routes, given
    that their header description names only the company-scoped access token?
    - Answer: Tiger does not handle the Customer API token, so it cannot
      answer this.
    - Source: none.
    - Confidence: Not confirmed.

### Still open

- 1 (partly): the HTTP status the gateway sends for a missing role.
- 4 (codes): the `field_errors` codes on approve and decline.
- 9: what the gateway does with `approver_id`, including `null`.
- 11 (partly): whether time off uses Tiger's multi-reviewer mechanism.
- 12: whether the deployed API differs from the generated client.
- 13: whether the Customer API token works on show, list and types.
