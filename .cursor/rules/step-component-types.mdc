---
alwaysApply: true
description: Step component callback types must be exported from types.ts
---

# Step Component Types Rule

## Philosophy: Export Public Types

Step components are part of the public API. Their callback function types (`onSubmit`, `onSuccess`, `onError`) must be exported from `types.ts` so library consumers can use them.

## Pattern to Follow

### 1. Export Callback Types from types.ts

Every step component must have its callback types exported from the flow's `types.ts` file:

```typescript
// src/flows/FlowName/types.ts

// ✅ Export the form payload type (already standard practice)
export type StepNameFormPayload = {
  field1: string;
  field2: number;
};

// ✅ Export the success response type
export type StepNameSuccessResponse = SomeApiResponse;

// ✅ NEW: Export the onSubmit callback type
export type StepNameOnSubmit = (
  payload: StepNameFormPayload,
) => void | Promise<void>;

// ✅ NEW: Export the onSuccess callback type
export type StepNameOnSuccess = (
  response: StepNameSuccessResponse,
) => void | Promise<void>;

// ✅ NEW: Export the onError callback type (if custom shape)
export type StepNameOnError = (params: {
  error: Error;
  rawError: Record<string, unknown>;
  fieldErrors: NormalizedFieldError[];
}) => void;
```

### 2. Use Exported Types in Step Component

```typescript
// src/flows/FlowName/components/StepNameStep.tsx

import {
  StepNameFormPayload,
  StepNameSuccessResponse,
  StepNameOnSubmit,
  StepNameOnSuccess,
  StepNameOnError,
} from '@/src/flows/FlowName/types';

type StepNameStepProps = {
  /** The function is called when the form is submitted. */
  onSubmit?: StepNameOnSubmit;
  /** The function is called when the form submission is successful. */
  onSuccess?: StepNameOnSuccess;
  /** The function is called when an error occurs during form submission. */
  onError?: StepNameOnError;
};

export function StepNameStep({
  onSubmit,
  onSuccess,
  onError,
}: StepNameStepProps) {
  // Component implementation
}
```

### 3. Export from Flow's index.ts

Make the callback types available through the flow's public API:

```typescript
// src/flows/FlowName/index.ts

export { StepNameStep } from './components/StepNameStep';
export type {
  StepNameFormPayload,
  StepNameSuccessResponse,
  StepNameOnSubmit,
  StepNameOnSuccess,
  StepNameOnError,
} from './types';
```

### 4. Re-export from Root index.tsx

Ensure types are available to library consumers:

```typescript
// src/index.tsx

export type {
  StepNameFormPayload,
  StepNameOnSubmit,
  StepNameOnSuccess,
  StepNameOnError,
} from '@/src/flows/FlowName';
```

## Standard onError Type Pattern

Most step components use the same `onError` shape. Consider creating a shared type:

```typescript
// src/flows/types.ts (or specific flow types.ts)

import { NormalizedFieldError } from '@/src/lib/mutations';

export type StepOnErrorParams = {
  error: Error;
  rawError: Record<string, unknown>;
  fieldErrors: NormalizedFieldError[];
};

export type StepOnError = (params: StepOnErrorParams) => void;
```

Then use it in step components:

```typescript
import { StepOnError } from '@/src/flows/types';

export type BasicInformationOnError = StepOnError;
```

## Why This Matters

### For Library Consumers

Users of `@remoteoss/remote-flows` need these types to:

1. **Type their callbacks correctly:**

```typescript
import type {
  BasicInformationOnSubmit,
  BasicInformationOnSuccess,
} from '@remoteoss/remote-flows';

const handleSubmit: BasicInformationOnSubmit = async (payload) => {
  console.log('Submitting:', payload);
};

const handleSuccess: BasicInformationOnSuccess = async (response) => {
  console.log('Success:', response);
};

<BasicInformationStep onSubmit={handleSubmit} onSuccess={handleSuccess} />;
```

2. **Create wrapper components:**

```typescript
import type { BasicInformationOnSubmit } from '@remoteoss/remote-flows';

type CustomStepProps = {
  onSubmit: BasicInformationOnSubmit;
  customProp: string;
};

export function CustomBasicInfoStep({ onSubmit, customProp }: CustomStepProps) {
  // Custom implementation
}
```

3. **Build derived types:**

```typescript
import type {
  BasicInformationFormPayload,
  BasicInformationOnSubmit,
} from '@remoteoss/remote-flows';

type ValidationFn = (payload: BasicInformationFormPayload) => boolean;
```

## Examples from Codebase

### Current Pattern (❌ Not Exported)

```typescript
// BasicInformationStep.tsx
type BasicInformationStepProps = {
  onSubmit?: (payload: BasicInformationFormPayload) => void | Promise<void>;
  onSuccess?: (data: EmploymentCreationResponse) => void | Promise<void>;
  onError?: (params: {...}) => void;
};
```

Users cannot import these callback types!

### Correct Pattern (✅ Exported)

```typescript
// types.ts
export type BasicInformationOnSubmit = (
  payload: BasicInformationFormPayload,
) => void | Promise<void>;

export type BasicInformationOnSuccess = (
  data: EmploymentCreationResponse,
) => void | Promise<void>;

export type BasicInformationOnError = StepOnError;

// BasicInformationStep.tsx
import type {
  BasicInformationOnSubmit,
  BasicInformationOnSuccess,
  BasicInformationOnError,
} from '@/src/flows/Onboarding/types';

type BasicInformationStepProps = {
  onSubmit?: BasicInformationOnSubmit;
  onSuccess?: BasicInformationOnSuccess;
  onError?: BasicInformationOnError;
};
```

## Checklist for New Steps

When creating a new step component:

- [ ] Define `{StepName}FormPayload` in types.ts (if not exists)
- [ ] Define `{StepName}OnSubmit` type in types.ts
- [ ] Define `{StepName}OnSuccess` type in types.ts
- [ ] Define or reuse `{StepName}OnError` type in types.ts
- [ ] Export all types from types.ts
- [ ] Use exported types in step component props
- [ ] Export types from flow's index.ts
- [ ] Re-export types from src/index.tsx
- [ ] Add JSDoc comments to exported types

## Remember

**Step components are public API.** All callback prop types must be exported and documented for library consumers. Inline types are private implementation details—export them!
