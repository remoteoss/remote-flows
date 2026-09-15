# Contract Document Docs

Welcome to the Contract Document flow docs.

A standalone flow for creating a contractor's contract document — the contract details and
contract preview screens of contractor onboarding, mountable on their own. It does not depend
on the onboarding flow.

If you want these screens **inside** contractor onboarding, that is part of the
[Contractor Onboarding](../ContractorOnboarding/README.md) flow instead.

> **Work in progress.** This release ships the two-step shell only: the steps exist and can
> be navigated, but no form is rendered and no request is made yet.

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

export function CreateContractDocument() {
  return (
    <RemoteFlows auth={/* your token fetcher */}>
      <ContractDocumentFlow
        render={(contractDocumentBag) => {
          const { stepState, back, next } = contractDocumentBag;

          return (
            <>
              <h2>{stepState.currentStep.name}</h2>
              <button type='button' onClick={back}>
                Back
              </button>
              <button type='button' onClick={next}>
                Next
              </button>
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

| Prop     | Type                 | Required | Description                         |
| -------- | -------------------- | -------- | ----------------------------------- |
| `render` | `(bag) => ReactNode` | Yes      | Render prop receiving the flow bag. |

## The bag

`useContractDocument()` is the headless equivalent of the render prop, for fully custom UIs.
Both surfaces expose the same bag:

| Key            | Description                                                             |
| -------------- | ----------------------------------------------------------------------- |
| `stepState`    | Current step (`contract_details` or `contract_preview`) and step count. |
| `steps`        | Every step of the flow, in order, with its label.                       |
| `next`         | Moves to the next step.                                                 |
| `back`         | Moves to the previous step.                                             |
| `goTo`         | Moves to a specific step.                                               |
| `fields`       | Form fields for the current step. Empty for now.                        |
| `isLoading`    | True while the flow is loading data. Always `false` for now.            |
| `isSubmitting` | True while a submission is in flight. Always `false` for now.           |
