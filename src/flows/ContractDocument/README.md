# Contract Document Docs

Welcome to the Contract Document flow docs.

A standalone flow for creating a contractor's contract document — the contract details and
contract preview screens of contractor onboarding, mountable on their own. It does not depend
on the onboarding flow.

The flow acts on one contractor, which you name with the required `employmentId` prop. How you
source that id — a picker of your own, a route param, the row the user clicked — is up to you.

If you want these screens **inside** contractor onboarding, that is part of the
[Contractor Onboarding](../ContractorOnboarding/README.md) flow instead.

> **Work in progress.** This release renders the contract details form and creates the
> contract document. The contract preview step is reached but renders nothing yet. Until the
> flow is complete, its props and bag may change between minor versions without a major bump.

# Table of Contents

- [Getting Started](#getting-started)
  - [Full Example](#full-example)
- [Components API](#components-api)
  - [ContractDocumentFlow](#contractdocumentflow)
  - [ContractDocumentForm](#contractdocumentform)
  - [ContractDocumentSubmitButton](#contractdocumentsubmitbutton)
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
              <p>Contract document {contractDocumentBag.contractDocumentId}</p>
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

| Prop           | Type                                       | Required | Description                                          |
| -------------- | ------------------------------------------ | -------- | ---------------------------------------------------- |
| `employmentId` | `string`                                   | Yes      | The contractor the contract document is created for. |
| `render`       | `(bag) => ReactNode`                       | Yes      | Render prop receiving the flow bag.                  |
| `options`      | `{ jsfModify?: { contract_details?: … } }` | No       | Modify the generated JSON-schema fields, per step.   |

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
while the contract document is being created, and while the flow has no contractor to act on.

## The bag

`useContractDocument({ employmentId, options })` is the headless equivalent of the render
prop, for fully custom UIs. Both surfaces expose the same bag:

| Key                    | Description                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| `stepState`            | Current step (`contract_details` or `contract_preview`) and step count.                                       |
| `steps`                | Every step of the flow, in order, with its label.                                                             |
| `next`                 | Moves to the next step.                                                                                       |
| `back`                 | Moves to the previous step.                                                                                   |
| `goTo`                 | Moves to a specific step.                                                                                     |
| `fields`               | Generated form fields for the current step.                                                                   |
| `fieldValues`          | Current values of the form fields for the current step.                                                       |
| `checkFieldUpdates`    | Feed the latest form values back in so conditional fields re-evaluate.                                        |
| `handleValidation`     | Validation handler for the current step's form.                                                               |
| `parseFormValues`      | Turns the contract details values into the API payload without submitting.                                    |
| `onSubmit`             | Creates the contract document.                                                                                |
| `initialValues`        | Initial form values per step, prefilled from the employment and the schema defaults.                          |
| `meta`                 | Fieldset metadata for the current step.                                                                       |
| `employmentId`         | The contractor the contract document will be created for.                                                     |
| `employment`           | The contractor's employment.                                                                                  |
| `isContractorOfRecord` | Whether the contractor is a Contractor of Record.                                                             |
| `productIdentifier`    | The product the contractor is on, read off the employment.                                                    |
| `contractDocuments`    | The contract documents the contractor already has. `undefined` until loaded, or when loading failed.          |
| `contractDocumentId`   | The contract document created in this flow, once there is one.                                                |
| `canSkipAiValidation`  | True when the last submission was rejected by the AI check and submitting again continues at the user's risk. |
| `isLoading`            | True until the contractor and the current step's form are known.                                              |
| `isSubmitting`         | True while the contract document is being created.                                                            |

## Requests

| Request                                                                        | Purpose                                                                         |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `GET /v1/employments/{employment_id}`                                          | The contractor: country, product, current contract details.                     |
| `GET /v1/employments/{employment_id}/contract-documents`                       | The contract documents the contractor already has.                              |
| `GET /v1/countries/{country_code}/contractor-contract-details?employment_id=…` | The contract details schema. Its `default` values prefill the form (see below). |
| `GET /v1/contractors/employments/{employment_id}/contractor-currencies`        | The currencies offered for the compensation.                                    |
| `POST /v1/contractors/employments/{employment_id}/contract-documents`          | Creates the contract document from the parsed form values.                      |

All are scoped to an employment, so nothing is requested while `employmentId` is empty and
`isLoading` stays `true`.

**Prefill.** When `employment_id` refers to a contractor, the schema's fields carry `default`
values sourced from their current contract — payment terms from the stored contract details or,
absent those, the contractor's rate. Those defaults are compensation data and require one of
`documents-management:create`, `people-contracts:create` or `hiring:update`; without them the
schema comes back without `default` values and the form renders blank rather than failing.

**Product.** The standalone flow has no pricing-plan step. The product is read off the
employment's `contractor_type`: it decides whether the Contractor Services Agreement disclaimer
is shown, whether the start date can be backdated, and which misclassification wording is used.

## AI misclassification check

Remote checks the services and deliverables for misclassification risk when the contract
document is created. When the check rejects the text with a skippable error, the form shows a
warning under the field and `canSkipAiValidation` turns `true`; submitting again sends
`skip_ai_checks: true` and continues at the user's own risk. Editing the field clears the
warning and the next submission is checked again.
