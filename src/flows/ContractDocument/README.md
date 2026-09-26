# Contract Document Docs

Welcome to the Contract Document flow docs.

A standalone flow for creating a contractor's contract document — the contract details and
contract preview screens of contractor onboarding, mountable on their own. It does not depend
on the onboarding flow.

The flow acts on one contractor, which you name with the required `employmentId` prop. How you
source that id — a picker of your own, a route param, the row the user clicked — is up to you.

If you want these screens **inside** contractor onboarding, that is part of the
[Contractor Onboarding](../ContractorOnboarding/README.md) flow instead.

> **Work in progress.** This release creates the contract document, opens its PDF for review
> and renders the signature form. No signing request is sent yet. Until the flow is complete,
> its props and bag may change between minor versions without a major bump.

# Table of Contents

- [Getting Started](#getting-started)
  - [Full Example](#full-example)
- [Components API](#components-api)
  - [ContractDocumentFlow](#contractdocumentflow)
  - [ContractDocumentForm](#contractdocumentform)
  - [ContractDocumentSubmitButton](#contractdocumentsubmitbutton)
  - [ContractDocumentPreviewForm](#contractdocumentpreviewform)
  - [ContractDocumentReviewButton](#contractdocumentreviewbutton)
- [The bag](#the-bag)
- [Requests](#requests)
- [AI misclassification check](#ai-misclassification-check)

## Getting Started

After installation, import the main CSS file in your application:

```css
@import '@remoteoss/remote-flows/styles.css';
```

### Full Example

```tsx
import {
  ContractDocumentFlow,
  ContractDocumentForm,
  ContractDocumentPreviewForm,
  ContractDocumentReviewButton,
  ContractDocumentSubmitButton,
  RemoteFlows,
} from '@remoteoss/remote-flows';

export function CreateContractDocument({
  employmentId,
}: {
  employmentId: string;
}) {
  return (
    <RemoteFlows auth={/* your token fetcher */}>
      <ContractDocumentFlow
        employmentId={employmentId}
        render={(contractDocumentBag) => {
          if (contractDocumentBag.isLoading) {
            return <div>Loading…</div>;
          }

          if (
            contractDocumentBag.stepState.currentStep.name ===
            'contract_preview'
          ) {
            return (
              <>
                <ContractDocumentPreviewForm />
                <button type='button' onClick={contractDocumentBag.back}>
                  Back
                </button>
                <ContractDocumentReviewButton
                  render={({ reviewCompleted }) =>
                    reviewCompleted ? 'Review again' : 'Review contract'
                  }
                />
              </>
            );
          }

          return (
            <>
              <ContractDocumentForm
                onError={({ error }) => console.error(error)}
              />
              <ContractDocumentSubmitButton>
                {contractDocumentBag.canSkipAiValidation
                  ? 'Continue anyway'
                  : 'Continue'}
              </ContractDocumentSubmitButton>
            </>
          );
        }}
      />
    </RemoteFlows>
  );
}
```

## Components API

### ContractDocumentFlow

| Prop           | Type                                                             | Required | Description                                          |
| -------------- | ---------------------------------------------------------------- | -------- | ---------------------------------------------------- |
| `employmentId` | `string`                                                         | Yes      | The contractor the contract document is created for. |
| `render`       | `(bag) => ReactNode`                                             | Yes      | Render prop receiving the flow bag.                  |
| `options`      | `{ jsfModify?: { contract_details?: …, contract_preview?: … } }` | No       | Modify the generated JSON-schema fields, per step.   |

### ContractDocumentForm

Renders the contract details form on the `contract_details` step. Submitting it creates the
contract document and moves the flow to `contract_preview`.

| Prop         | Type                                         | Description                                                                    |
| ------------ | -------------------------------------------- | ------------------------------------------------------------------------------ |
| `components` | `Components`                                 | Override the field components used in the form.                                |
| `onSubmit`   | `(payload) => void \| Promise<void>`         | Receives the parsed payload before it is sent. Throwing aborts the submission. |
| `onSuccess`  | `(data) => void \| Promise<void>`            | Called once the contract document has been created.                            |
| `onError`    | `({ error, rawError, fieldErrors }) => void` | Called when creation fails. Field errors are also set on the form.             |

### ContractDocumentSubmitButton

Must be rendered inside the flow's `render` prop. Accepts any button props; disables itself
while the contract document is being created, while the flow has no contractor to act on, and
when the flow failed to load (`error` is set on the bag).

### ContractDocumentPreviewForm

Renders the `contract_preview` step: a header, a statement inviting the user to review the
document, and the signature field. The signature field only appears once the document has
been reviewed (`fieldValues.review_completed`). Signing is not wired yet; the form has no
submission in this release.

| Prop         | Type         | Description                                     |
| ------------ | ------------ | ----------------------------------------------- |
| `components` | `Components` | Override the field components used in the form. |

The header and statement fields can be customized through
`options.jsfModify.contract_preview` (`contract_preview_header`, `contract_preview_statement`,
`signature`), exactly like the same step of contractor onboarding.

### ContractDocumentReviewButton

Must be rendered inside the flow's `render` prop. Opens the contract document PDF in a drawer
through the `pdfViewer` component; closing the drawer marks the document as reviewed. Same API
as the onboarding `ContractReviewButton`: a `render({ reviewCompleted })` prop for the label,
plus any button props.

## The bag

`useContractDocument({ employmentId, options })` is the headless equivalent of the render
prop, for fully custom UIs. Both surfaces expose the same bag:

| Key                      | Description                                                                                                                                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stepState`              | Current step (`contract_details` or `contract_preview`) and step count.                                                                                                                                   |
| `steps`                  | Every step of the flow, in order, with its label.                                                                                                                                                         |
| `next`                   | Moves to the next step.                                                                                                                                                                                   |
| `back`                   | Moves to the previous step.                                                                                                                                                                               |
| `goTo`                   | Moves to a specific step.                                                                                                                                                                                 |
| `fields`                 | Generated form fields for the current step.                                                                                                                                                               |
| `fieldValues`            | Current values of the form fields for the current step.                                                                                                                                                   |
| `checkFieldUpdates`      | Feed the latest form values back in so conditional fields re-evaluate.                                                                                                                                    |
| `handleValidation`       | Validation handler for the current step's form.                                                                                                                                                           |
| `parseFormValues`        | Turns the contract details values into the API payload without submitting.                                                                                                                                |
| `onSubmit`               | Creates the contract document.                                                                                                                                                                            |
| `initialValues`          | Initial form values per step. Contract details: today as the start date, the current contract details, the schema defaults. Contract preview: the company signature, if the document already carries one. |
| `meta`                   | Field metadata for the current step: labels for error messages, and fieldsets.                                                                                                                            |
| `employmentId`           | The contractor the contract document will be created for.                                                                                                                                                 |
| `employment`             | The contractor's employment.                                                                                                                                                                              |
| `isContractorOfRecord`   | Whether the contractor is a Contractor of Record.                                                                                                                                                         |
| `productIdentifier`      | The product the contractor is on, read off the employment.                                                                                                                                                |
| `contractDocuments`      | The contract documents the contractor already has. `undefined` until loaded, or when loading failed.                                                                                                      |
| `contractDocumentId`     | The contract document being previewed: the one created in this flow, or the contractor's existing one.                                                                                                    |
| `documentPreviewPdf`     | The previewed document once loaded: its PDF as a `data:application/pdf;base64,…` URI, name, status and signatories.                                                                                       |
| `markContractAsReviewed` | Marks the document as reviewed, which reveals the signature field.                                                                                                                                        |
| `canSkipAiValidation`    | True when the last submission was rejected by the AI check and submitting again continues at the user's risk.                                                                                             |
| `isLoading`              | True until the contractor and the current step's form are known.                                                                                                                                          |
| `isSubmitting`           | True while the contract document is being created.                                                                                                                                                        |
| `error`                  | The error that stopped the flow from loading (employment or schema), or `null`.                                                                                                                           |

## Requests

| Request                                                                        | Purpose                                                                         |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `GET /v1/employments/{employment_id}`                                          | The contractor: country, product, current contract details.                     |
| `GET /v1/employments/{employment_id}/contract-documents`                       | The contract documents the contractor already has.                              |
| `GET /v1/countries/{country_code}/contractor-contract-details?employment_id=…` | The contract details schema. Its `default` values prefill the form (see below). |
| `GET /v1/contractors/employments/{employment_id}/contractor-currencies`        | The currencies offered for the compensation.                                    |
| `POST /v1/contractors/employments/{employment_id}/contract-documents`          | Creates the contract document from the parsed form values.                      |
| `GET /v1/contractors/employments/{employment_id}/contract-documents/{id}`      | The previewed contract document, with its PDF.                                  |

All are scoped to an employment, so nothing is requested while `employmentId` is empty and
`isLoading` stays `true`.

**Existing contract document.** When the contractor already has a contract document, the flow
opens on the `contract_preview` step with that document, the first one the list returns.
`back` still leads to the contract details form, and submitting it creates a new document.

**Prefill.** When `employment_id` refers to a contractor, the schema's fields carry `default`
values sourced from their current contract — payment terms from the stored contract details or,
absent those, the contractor's rate. Those defaults are compensation data and require one of
`documents-management:create`, `people-contracts:create` or `hiring:update`; without them the
schema comes back without `default` values and the form renders blank rather than failing.
The service start date is prefilled with today's date, as on the Remote platform.

**Product.** The standalone flow has no pricing-plan step. The product is read off the
employment's `contractor_type`: it decides whether the Contractor Services Agreement disclaimer
is shown, whether the start date can be backdated, and which misclassification wording is used.
An employment without a `contractor_type` is treated as a standard contractor, as in contractor
onboarding.

## AI misclassification check

Remote checks the services and deliverables for misclassification risk when the contract
document is created. When the check rejects the text with a skippable error, the form shows a
warning under the field and `canSkipAiValidation` turns `true`; submitting again sends
`skip_ai_checks: true` and continues at the user's own risk. Editing any field of the form
clears the warning and the next submission is checked again.
