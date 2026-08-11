# Accordion rendering: button+modal for normal fields, inline accordion for forced-value fields

## Context

The example app already detects `<details data-component="Accordion">` inside field
`description` HTML and renders it as an inline expand/collapse widget
(`example/src/components/Accordion.tsx`), via the shared
`transformHtmlToComponents` function (`example/src/utils/transformHtml.tsx`) that's
registered once on the `RemoteFlows`/`OnboardingFlow` provider
(`example/src/flows/Onboarding/Onboarding.tsx:401`) and handed to every field's
`fieldData.transformHtml`.

Real-world usage (see the France fixture at
`src/flows/Onboarding/tests/fixtures/contractDetails/v1-france.ts:942` and the
`probation_length_recommended` schema shared by the user) confirms this same
`data-component="Accordion"` pattern shows up in plain field descriptions. The user now
wants two distinct presentations depending on field type:

- **Normal fields** (text/select/radio/checkbox/etc.): replace the inline accordion with a
  **button that opens a modal** containing the accordion's content — cleaner UI, keeps the
  field compact.
- **Forced-value fields** (`ForcedValue` in `example/src/Components.tsx`): keep the classic
  **inline accordion** (expand/collapse in place) — confirmed explicitly by the user
  ("when using force value fields we need an accordion and the rest of the fields we need
  button + modal").

This is a consumer-app-only change (`example/`) — no SDK (`src/`) changes are needed. Both
field types already receive the same raw, unsanitized HTML in `fieldData.description` and
the same `fieldData.transformHtml` callback prop from the SDK
(`src/components/form/fields/ForcedValueField.tsx:56-63`, `src/types/fields.ts` —
`FieldDataProps.transformHtml` / `ForcedValueDataProps`), so we can point different field
types at different transform functions purely within `example/`.

## Approach

Split the single `transformHtmlToComponents` function into two transformers that share the
same sanitize/parse plumbing but render the accordion match differently, then wire
`ForcedValue` to always use the inline-accordion variant instead of the
provider-registered `fieldData.transformHtml`.

### 1. `example/src/utils/transformHtml.tsx`

- Factor the existing DOMPurify-sanitize + `html-react-parser` `replace` logic into a shared
  helper, parameterized by how to render a detected `<details data-component="Accordion">`
  match (given `summary` and `content` react nodes):

  ```ts
  const createHtmlTransformer = (
    renderAccordion: (summary: React.ReactNode, content: React.ReactNode) => React.ReactNode,
  ) => (htmlContent: string) => { /* sanitize + parse + replace, calling renderAccordion */ };
  ```

- Keep the export name `transformHtmlToComponents` for the **button + modal** variant (this
  is what's registered on the provider in `Onboarding.tsx:401` and used directly in
  `ReviewOnboardingStep.tsx:573`, so both keep working with the new modal UX with no call-site
  changes). Its `renderAccordion` renders:

  ```tsx
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="link">{summary}</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{summary}</DialogTitle>
      </DialogHeader>
      <div className="accordion-modal-content">{content}</div>
    </DialogContent>
  </Dialog>
  ```

  using `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `Button`
  imported from `@remoteoss/remote-flows/internals` — the same primitives already used for
  this exact trigger-button-opens-modal pattern in
  `example/src/components/PricingPlanModals.tsx` (`EngagingContractorsModal`,
  `PricingPlanOptionsModal`), so no new dependency or styling system is introduced.

- Add a new export `transformHtmlToAccordion` for the **inline accordion** variant, whose
  `renderAccordion` is exactly today's existing behavior:

  ```tsx
  <Accordion summary={summary}>{content}</Accordion>
  ```

  (unchanged from the current `example/src/components/Accordion.tsx`).

### 2. `example/src/Components.tsx`

- Import `transformHtmlToAccordion` from `../utils/transformHtml`.
- In the `ForcedValue` component (around line 331-350), stop using the provider-supplied
  `fieldData.transformHtml` for its description and pass `transformHtmlToAccordion`
  directly instead:

  ```tsx
  {renderDescription(description, transformHtmlToAccordion)}
  ```

  All other field components (`Input`, `Select`, `Textarea`, `Radio`, `Checkbox`,
  `Countries`, `FileUploadField`, `DatePickerInput`, `TelField`, `TimeField`) are
  **unchanged** — they keep calling `renderDescription(fieldData.description,
  fieldData.transformHtml)`, which resolves to the provider's registered
  `transformHtmlToComponents`, now producing the button+modal UI automatically.

### Out of scope (flagging, not changing)

- `x-jsf-presentation.statement.description` (the separate green "Information on
  termination" callout box) can *also* contain a `data-component="Accordion"` block (see the
  France fixture). It's rendered by the SDK's default `statement` field component, which
  isn't overridden in `example/src/Components.tsx` and doesn't currently accept a
  `transformHtml` callback at all (`StatementComponentProps` in `src/types/fields.ts` has no
  such field) — so accordions inside statements aren't transformed today, before or after
  this change. Not touching this now since the user's ask was specifically about normal
  fields and forced-value fields; call this out to the user as a known follow-up if they want
  it later.

## Files touched

- `example/src/utils/transformHtml.tsx` — split into two exported transformers sharing one
  sanitize/parse helper.
- `example/src/Components.tsx` — `ForcedValue` uses `transformHtmlToAccordion` instead of
  `fieldData.transformHtml`.

No changes to `src/` (SDK) — the public API/contract is untouched.

## Verification

1. `npm run type-check` and `npm run lint` at repo root (example app is linted/type-checked
   as part of the workspace — confirm via existing `npm run ci` scope).
2. Manual run: `npm link` root package, `npm link @remoteoss/remote-flows` in `example/`,
   `npm run dev` in both root and `example/`. Load a flow whose schema has a field
   description containing `<details data-component="Accordion">` (e.g. Germany/France
   onboarding contract-details step, `probation_length_recommended`/probation statement) and
   confirm:
   - A normal field's accordion now renders as a "Read more"-style button that opens a
     modal with the accordion's summary as title and its body as content.
   - A forced-value field whose description contains the same `data-component="Accordion"`
     markup still renders the classic inline expand/collapse accordion.
3. Spot-check `ReviewOnboardingStep.tsx`'s direct `transformHtmlToComponents(...)` call
   picks up the new modal behavior as well (expected/desired side-effect).
