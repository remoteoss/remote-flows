# Contract Document Docs

Welcome to the Contract Document flow docs.

A standalone flow for creating a contractor's contract document — the contract details and
contract preview screens of contractor onboarding, mountable on their own. It does not depend
on the onboarding flow.

The flow acts on one contractor, which you name with the required `employmentId` prop. How you
source that id — a picker of your own, a route param, the row the user clicked — is up to you.

If you want these screens **inside** contractor onboarding, that is part of the
[Contractor Onboarding](../ContractorOnboarding/README.md) flow instead.

> **Work in progress.** This release loads the contractor and their existing contract documents
> and exposes them on the bag, but no form is rendered yet.

# Table of Contents

- [Getting Started](#getting-started)
  - [Full Example](#full-example)
- [Components API](#components-api)
  - [ContractDocumentFlow](#contractdocumentflow)
- [The bag](#the-bag)

## Getting Started

After installation, import the main CSS file in your application:

```css
@import '@remoteoss/remote-flows/styles.css';
```

### Full Example

```tsx
import { ContractDocumentFlow, RemoteFlows } from '@remoteoss/remote-flows';

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

          return <h2>{contractDocumentBag.employment?.full_name}</h2>;
        }}
      />
    </RemoteFlows>
  );
}
```

## Components API

### ContractDocumentFlow

| Prop           | Type                 | Required | Description                                          |
| -------------- | -------------------- | -------- | ---------------------------------------------------- |
| `employmentId` | `string`             | Yes      | The contractor the contract document is created for. |
| `render`       | `(bag) => ReactNode` | Yes      | Render prop receiving the flow bag.                  |

## The bag

`useContractDocument({ employmentId })` is the headless equivalent of the render prop, for
fully custom UIs. Both surfaces expose the same bag:

| Key                    | Description                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------- |
| `stepState`            | Current step (`contract_details` or `contract_preview`) and step count.                                   |
| `steps`                | Every step of the flow, in order, with its label.                                                         |
| `next`                 | Moves to the next step.                                                                                   |
| `back`                 | Moves to the previous step.                                                                               |
| `goTo`                 | Moves to a specific step.                                                                                 |
| `fields`               | Form fields for the current step. Empty for now.                                                          |
| `employmentId`         | The contractor the contract document will be created for.                                                 |
| `employment`           | The contractor's employment.                                                                              |
| `isContractorOfRecord` | Whether the contractor is a Contractor of Record.                                                         |
| `contractDocuments`    | The contract documents the contractor already has.                                                        |
| `isLoading`            | True until the contractor is known: no `employmentId`, or the employment and its documents still loading. |
| `isSubmitting`         | True while a submission is in flight. Always `false` for now.                                             |

## Requests

| Request                                                  | Purpose                                               |
| -------------------------------------------------------- | ----------------------------------------------------- |
| `GET /v1/employments/{employment_id}`                    | The contractor, to tell a Contractor of Record apart. |
| `GET /v1/employments/{employment_id}/contract-documents` | The contract documents the contractor already has.    |

Both are scoped to an employment, so nothing is requested while `employmentId` is empty and
`isLoading` stays `true`.
