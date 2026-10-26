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

Never add the notice to a `*Form.tsx` or any other file under `src/flows/**`. Reference for exposing the data: `isContractorOfRecord` in the InvoiceSchedule README and bag. Its example renders a plain `<p>`; that predates this rule, so don't copy its markup.

Some older flow code renders UI that a partner would own. That is tracked debt, not precedent: follow this rule, not those spots.

## Building the notice in the example app

- Match the visual the issue shows (screenshot, Figma, or the platform's own UI). Open the image first (`extract_images`) and note the component type, variant, icon and wording.
- Then find that component in what the repo already ships, before writing markup: the SDK's UI primitives exported from `src/internals.ts` (consumed as `@remoteoss/remote-flows/internals`), then `example/src/components` and the sibling example files. A warning callout is `Alert`; a different design maps to a different primitive.
- Use a bare HTML element only when the design is plain text and nothing shipped fits, and say so in the PR.
- A nearby example that uses bare markup is not a reason to copy it; check it against the issue's design.
- API-provided HTML goes through `sanitizeHtml`; fixed copy plus a name renders as plain text.

## When the requirements are ambiguous

If the issue says a component "shows" the notice but also says to expose the data so partners can render it, the two conflict. Default to headless and say so in the plan, or ask before coding. Do not build the in-form version first and move it later.

## A field the generated client doesn't type yet

Stack the branch on the PR that regenerates the client, or run `pnpm run openapi-ts`. Do not read the field through a cast and fix it in a follow-up commit.
