---
description: Where visible notices go - flow bag and example app, never the flow's form
paths:
  - 'src/flows/**'
  - 'example/src/**'
---

# Partner-facing UI

Flows are headless: the SDK exposes data, the partner renders it. A visible notice, warning, statement or callout driven by API data (for example "this contractor has no active deposit method") is partner UI, not SDK UI.

## Where each piece goes

| Piece                                                                       | Location                                                                         |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| The data the notice reads (an API field, a derived boolean)                 | The flow bag in `hooks.tsx`, with a one-line JSDoc, and a row in the flow README |
| The notice itself, with the copy and the condition                          | `example/src/<Flow>.tsx`                                                         |
| A test that the bag exposes the data in each state (`true`, `false`, unset) | `src/flows/<Flow>/tests/`                                                        |

Never add the notice to a `*Form.tsx` or any other file under `src/flows/**`. Reference for exposing the data: `isContractorOfRecord` in the InvoiceSchedule README and bag. Its example renders a plain `<p>`; that predates this rule, so don't copy it for the notice.

Some older flow code renders UI that a partner would own. That is tracked debt, not precedent: follow this rule, not those spots.

## Building the notice in the example app

- Use `Alert` and `AlertDescription` from `@remoteoss/remote-flows/internals` with `variant='warning'` and a lucide icon. Never a bare `<p>`.
- Reuse what `example/src` already has (`AlertError`, `components/`) before writing new markup.
- If the Linear issue has a screenshot, open it first (`extract_images`) and match what it shows: variant, icon, wording.
- API-provided HTML goes through `sanitizeHtml`; fixed copy plus a name renders as plain text.

## When the requirements are ambiguous

If the issue says a component "shows" the notice but also says to expose the data so partners can render it, the two conflict. Default to headless and say so in the plan, or ask before coding. Do not build the in-form version first and move it later.

## A field the generated client doesn't type yet

Stack the branch on the PR that regenerates the client, or run `pnpm run openapi-ts`. Do not read the field through a cast and fix it in a follow-up commit.
