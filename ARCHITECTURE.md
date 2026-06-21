# Architecture Guide

This document explains the architectural patterns, design philosophy, and decision-making framework for `@remoteoss/remote-flows`. It complements the implementation details in `CLAUDE.md` and user-facing documentation in `README.md`.

**Target audience:** Maintainers, contributors, and anyone making architectural decisions.

> **Living Document:** This architecture guide evolves as the project grows. When you make an architectural decision, update this document. When a pattern emerges, document it here. When you discover a better way, capture the reasoning for the change.

## The Developer's Role

Understanding the job helps explain why we make certain architectural decisions.

**Primary goal:** Serve partners (external consumers) by making internal platform features available as an embeddable SDK.

**The process:**

1. **Analyze the internal platform** - See what's been built internally
2. **Identify minimal requirements** - What's the least we need to ship for partners?
3. **Expose APIs** - Sometimes internal endpoints need to be made public
4. **Build for partners** - Create something they can actually use
5. **Document thoroughly** - How to integrate, what to expect
6. **Align with partner engineers** - Work with Product Design Engineers (PDEs) to understand their needs based on what they've seen in our platform

**Ongoing responsibilities:**

- ✅ **Proactive communication** - Tell partners what's changed, what's coming
- ✅ **Bug triage & fixes** - Respond quickly to partner issues
- ✅ **Protect partners** - Detect when internal team changes could break partner integrations
- ✅ **Maintain revenue** - Partners pay for this - keep it working, unlock new features

**Multi-dimensional thinking required:**

1. **The SDK** - Maintainability, evolution, public API stability
2. **Backend APIs** - Contract between FE and BE, versioning, breaking changes
3. **Domain knowledge** - Understand the HR/employment problem being solved, how it works in our platform
4. **Partner experience** - Make integration easy, reduce friction, minimize breaking changes

**Why this matters for architecture:**

- **"Zero business logic for consumers"** → Partners want minimal integration effort
- **Breaking changes are expensive** → Revenue at risk, partner engineering time
- **Feature flags exist** → Protect partners while shipping new features
- **Documentation is critical** → Partners don't have access to our internal knowledge
- **Versioning is careful** → Different partners move at different speeds
- **Communication is key** → Partners need advance warning of changes

This context explains why we prioritize stability, backward compatibility, and partner experience over internal code elegance.

---

## Table of Contents

1. [Core Architecture](#1-core-architecture)
2. [Consumer Philosophy](#2-consumer-philosophy)
3. [Form Architecture](#3-form-architecture)
4. [Data & API Patterns](#4-data--api-patterns)
5. [Authentication & Proxy Pattern](#5-authentication--proxy-pattern)
6. [Customization System](#6-customization-system)
7. [Testing Philosophy](#7-testing-philosophy)
8. [Evolving the API](#8-evolving-the-api)
9. [Example App Patterns](#9-example-app-patterns)

---

## 1. Core Architecture

### 1.1 Provider Chain

Every consumer application wraps flows in a provider hierarchy:

```tsx
<RemoteFlows auth={fetchToken} theme={theme} components={customComponents}>
  <OnboardingFlow
    employmentId='xxx'
    render={({ flowBag, components }) => {
      // Consumer renders UI using bag + components
    }}
  />
</RemoteFlows>
```

**Provider chain (outside-in):**

1. `ErrorContextProvider` - Global error handling
2. `RemoteFlowsErrorBoundary` - Catches React errors
3. `QueryClientProvider` - Shared React Query client
4. `FormFieldsProvider` - Merges consumer + default field components
5. `RemoteFlowContext` - API client instance
6. `ThemeProvider` - CSS custom properties

**Why this order:** Errors must catch everything → QueryClient must wrap queries → API client must be available to queries → Theme applies globally.

### 1.2 The "Bag" Contract

Every flow exposes a `flowBag` through the render prop with these standard properties:

```tsx
{
  // Step state machine
  stepState: {
    currentStep: { name: string; ... },
    next: () => void,
    previous: () => void,
    goToStep: (name: string) => void,
    canGoBack: boolean,
    isLastStep: boolean,
  },

  // Form fields for current step
  fields: FieldDefinition[],

  // Loading states
  isLoading: boolean,
  isSubmitting: boolean,

  // Flow-specific context
  countryCode?: string,
  employmentId?: string,
  // ... other flow-specific data

  // Validation methods (async since v1.0.0)
  handleValidation: (values: FormValues) => Promise<ParsedValues>,
  parseFormValues: (values: FormValues) => Promise<ParsedValues>,
}
```

**Contract guarantees:**

- `stepState` is always present in multi-step flows
- `fields` is empty array while loading, populated once schemas arrive
- `isLoading` is true until initial data loads
- `isSubmitting` is true during mutation submission
- Validation methods are **always async** (see `MIGRATION.md` for v1.0.0 breaking change)

### 1.3 Two Export Surfaces

Every flow must expose **two ways to use it:**

#### Prebuilt Component (render prop)

```tsx
import { OnboardingFlow } from '@remoteoss/remote-flows';

<OnboardingFlow
  employmentId="xxx"
  render={({ flowBag, components }) => (
    // Consumer renders with components
  )}
/>
```

**Use when:** Consumer wants a guided experience with prebuilt step components.

#### Headless Hook

```tsx
import { useOnboarding } from '@remoteoss/remote-flows';

function CustomOnboarding() {
  const flowBag = useOnboarding({ employmentId: 'xxx' });

  // Consumer builds completely custom UI
  return <div>Custom UI using {flowBag.stepState.currentStep.name}</div>;
}
```

**Use when:** Consumer needs full control over UI/UX and wants only business logic.

**Maintenance rule:** Both surfaces must stay in sync. The render prop component should internally use the headless hook.

### 1.4 File Organization per Flow

Every flow follows this structure:

```text
src/flows/{FlowName}/
├── index.ts                      # Public exports only
├── {FlowName}Flow.tsx            # Render prop component
├── hooks.tsx                     # ⚠️ THE BAG LIVES HERE (useFlowName hook)
├── api.ts                        # React Query hooks/factories
├── context.ts                    # Flow-specific context (if needed)
├── types.ts                      # TypeScript types
├── constants.ts                  # Constants, step names, etc.
├── utils.ts                      # Pure utility functions
├── components/                   # Step components
│   ├── BasicInformationStep.tsx
│   ├── ContractDetailsStep.tsx
│   └── ...
├── json-schemas/                 # Static schema fallbacks
│   └── basic-information.json
└── tests/
    ├── fixtures.ts               # Test data
    └── *.test.tsx                # Tests
```

**Key rules:**

- `hooks.tsx` is the **source of truth** for business logic
- Steps are **presentation components** that consume the bag
- API calls go in `api.ts`, never inline in components
- No cross-flow imports (flows must be self-contained)
- Public API surface defined in `index.ts` (re-exported from `src/index.tsx`)

---

## 2. Consumer Philosophy

These principles guide every architectural decision:

### 2.1 Headless-First Design

**Principle:** Consumers should get business logic by default, UI as an option.

**Why:** Different products have different design systems. A beautiful default UI is worthless if they must override every component. Business logic (API calls, state machines, validation) is universal.

**Implementation:**

- Always build the headless hook first
- Then build the render prop component on top of it
- Default UI components are lazy-loaded (`lazy-default-components.ts`) to keep bundle small
- Consumers can use 0%, 50%, or 100% of our UI components

**Note on default components:** `lazy-default-components.ts` is considered legacy. Ideally, even our examples should use externally imported default components. This keeps the library truly headless with UI as an optional external dependency.

### 2.2 Zero Business Logic for Consumers

**Principle:** Consumers shouldn't think about API calls, state management, or validation _for the flow itself_.

**Why:** They're integrating our flows into their products. They want components that "just work," not a toolkit to build flows themselves.

**What we handle (flow-internal):**

- ✅ API calls within the multi-step form
- ✅ Data fetching & caching for form fields (React Query)
- ✅ Multi-step state machine transitions
- ✅ Form validation (Yup + JSON Schema)
- ✅ Error normalization for mutations
- ✅ Loading/submitting states

**What consumers handle:**

- ✅ Rendering UI (using our bag + components)
- ✅ Success/error callbacks (`onSuccess`, `onError`)

**Good examples** (see `example/src/`):

- `Onboarding.tsx` - Just pass props, render UI, handle callbacks
- `ContractorOnboarding.tsx` - Same pattern with custom field components
- `Termination.tsx` - Minimal consumer code, flow handles everything

**When consumers DO need business logic:**

⚠️ **Integrations with their own systems** - Syncing to external services:

```tsx
// After flow completes
<OnboardingFlow
  onSuccess={async (result) => {
    // Sync to their CRM
    await syncToSalesforce(result.employmentId);

    // Send to their analytics
    await trackEvent('onboarding_complete', { userId, flowType });

    // Notify their backend
    await fetch('/api/webhooks/onboarding', {
      method: 'POST',
      body: JSON.stringify(result),
    });
  }}
/>
```

**Why this happens:** These are consumer-specific integrations unique to their product/infrastructure.

⚠️ **Eligibility checks from their own data** - Business rules based on their system:

```tsx
// Before starting flow
const { canStartOnboarding } = await fetch('/api/check-eligibility', {
  body: { userId, planTier }
}).then(r => r.json());

if (!canStartOnboarding) {
  showError('Please upgrade your plan to onboard employees');
  return;
}

<OnboardingFlow companyId={companyId} type="employee" ... />
```

**Why this happens:** Eligibility rules vary by consumer (plan limits, feature flags, permissions in their system).

**Goal:** Minimize these cases. If **all** consumers need the same data/logic, we should handle it internally.

### 2.3 Customization Strategy

**Principle:** Prefer props over component overrides, but offer both.

**Decision matrix:**

| Customization Need     | Solution                             | Example                                       |
| ---------------------- | ------------------------------------ | --------------------------------------------- |
| Change text/labels     | `jsfModify` on schema                | "First Name" → "Given Name"                   |
| Change field styling   | CSS classes (`RemoteFlows__Input`)   | Brand colors, rounded corners                 |
| Change field behavior  | `components` prop on `<RemoteFlows>` | Custom date picker component                  |
| Change field rendering | `x-jsf-presentation` in schema       | Custom component for specific field           |
| Change validation      | Add flow-level prop                  | `validateOnBlur={false}`                      |
| Change step logic      | This is our responsibility           | Don't make consumers override step components |

**Important:** Component overrides are controlled by JSON schemas. Steps without schemas (read-only/action steps like "invite" or "review") don't have field-level customization - they're customized via render props and `flowBag` properties.

### 2.4 Semver Contract

**What's public API** (breaking changes require major version):

- Everything exported from `src/index.tsx`
- Type signatures of flow props
- The shape of the `flowBag`
- Step component prop interfaces
- Field component interfaces (`FieldComponentProps`)

**What's NOT public API** (can change in minor/patch):

- Anything in `@remoteoss/remote-flows/internals`
- Internal component implementations
- File structure under `src/`
- Private exports (not in `index.ts`)

**Additive changes are safe:**

- ✅ New optional props on flows
- ✅ New fields in the `flowBag`
- ✅ New step components
- ✅ New exported utility functions

**Breaking changes require major version:**

- ❌ Removing props
- ❌ Making optional props required
- ❌ Changing prop types
- ❌ Removing fields from `flowBag`
- ❌ Changing `handleValidation` signature (see v1.0.0 → async)

### 2.5 Feature Flags Strategy

**When to use feature flags:**

Feature flags are used when something could **block partners from upgrading**:

```tsx
<OnboardingFlow
  options={{
    features: ['onboarding_reserves', 'dynamic_steps'],
  }}
/>
```

**Use feature flags when:**

- ✅ Adding a new step that partners must implement UI for (e.g., `employment_agreement_details`)
- ✅ Changing navigation behavior that affects their integration
- ✅ New functionality that's opt-in until proven stable
- ✅ Changes that would break versioning/compatibility if forced on everyone

**Example - New Step:**

```tsx
// Without feature flag: ALL partners must handle new step immediately
// With feature flag: Partners opt in when they're ready

if (features.includes('employment_agreement_details')) {
  steps.push({ name: 'employment_agreement_details', ... });
}
```

**When NOT to use feature flags:**

- ❌ Internal refactors that don't affect consumer code
- ❌ Bug fixes (deploy immediately)
- ❌ Additive props (already backward compatible)

**Feature flag lifecycle:**

1. **New** - Opt-in, default `false`
2. **Proven** - Encourage adoption, still opt-in
3. **Graduation** - Eventually becomes default behavior (major version bump removes flag)

**Goal:** Feature flags enable gradual rollout without blocking partner upgrades. They're not permanent - they graduate or get removed.

### 2.6 Breaking Changes Process

**Breaking changes are not fun.** They require coordination, documentation, and consumer effort. Always try to find another way first.

**Before making a breaking change:**

1. **Exhaust alternatives:**
   - Can we make it additive with a new optional prop?
   - Can we deprecate gracefully with a warning?
   - Can we use a feature flag for gradual migration?
   - Can we support both old and new behavior temporarily?

2. **Communicate proactively:**
   - Reach out to known consumers before committing
   - Ask questions: "How are you using X?" "Would Y break your integration?"
   - Give advance warning: "We're considering changing X in the next major version"
   - Gather feedback: Sometimes consumers reveal use cases you didn't consider

3. **Document the decision:**
   - **Required:** Update `MIGRATION.md` with:
     - What changed and why
     - Before/after code examples
     - Step-by-step migration instructions
     - Expected effort (minutes, hours, days?)
   - **Required:** Update CHANGELOG with `BREAKING CHANGE:` footer
   - **Recommended:** Write a migration guide for complex changes

4. **Provide migration path:**
   - Support window: How long will we support the old version?

**Example - Good breaking change process:**

````markdown
## v2.0.0 Breaking Change: handleValidation is now async

**Why:** Backend validation requires async operations.

**Before:**

```tsx
const parsed = handleValidation(values);
return submitToApi(parsed);
```
````

**After:**

```tsx
const parsed = await handleValidation(values);
return submitToApi(parsed);
```

**Migration:** Add `await` before `handleValidation()` calls.
TypeScript will catch missing awaits.

**Timeline:** v1.x supported until 2024-12-31.

**When breaking changes are unavoidable:**

- Be honest about the pain
- Provide excellent migration docs
- Support consumers through the upgrade
- Learn from it: What could we have designed differently?

### 2.7 Communication with Consumer Devs

**Before making decisions:**

- Ask: "Will this force consumers to rewrite code on upgrade?"
- Ask: "Is this solving a real consumer problem or just cleaner for us?"
- Check: Do we have issues/requests from multiple consumers?

**When releasing:**

- Document breaking changes in `MIGRATION.md`
- Add migration examples (before/after code)
- Announce in changelog with upgrade path or even offer partners internally pdfs on how to do things

---

## 3. Form Architecture

### 3.1 Multi-Step State Machine

Multi-step flows use `useStepState` (from `src/flows/useStepState.ts`), which provides:

```tsx
const stepState = useStepState({
  steps: [
    { name: 'basic_information', validate: true },
    { name: 'contract_details', validate: true },
    { name: 'invite', validate: false }, // Read-only step
  ],
  initialStep: 'basic_information',
});
```

**Step transitions happen via:**

1. **User interaction:** `stepState.next()`, `stepState.previous()`, `stepState.goToStep('step_name')`
2. **Mutation success:** `onSuccess={() => stepState.next()}` after POST/PUT
3. **External navigation:** Consumer calls `goToStep` based on URL params

**Important:** Steps are not just UI—they're **state nodes**. Some steps (like "invite") don't have forms; they just trigger an action.

### 3.2 JSON Schema Forms

Every step's form is defined by a JSON schema:

**Static schema** (committed to repo):

```tsx
import basicInfoSchema from './json-schemas/basic-information.json';
```

**Dynamic schema** (fetched from API):

```tsx
const { data: schema } = useQuery({
  queryKey: ['schema', countryCode],
  queryFn: () => fetchSchema(countryCode),
});
```

**Why JSON Schema:**

1. **Backend-driven validation** - Backend owns validation rules, frontend renders them
2. **Country-specific fields** - Different countries have different required fields
3. **Consumer customization** - `jsfModify` lets consumers override labels/descriptions without touching code
4. **Type safety** - We generate TypeScript types from schemas

#### 3.2.1 Schema Ownership & Creation

**Where schemas live:**

- **Shared schemas** - Sometimes schemas are shared between Platform (Remote.com) and the public API
- **Library-specific schemas** - Sometimes it's easier to create the schema here rather than exposing a new API endpoint
- **Decision criteria:** If non-SDK partners (not using the library) will need it, create it in the public API. If it's only for this library, keep it here.

**Schema versioning:**

The `jsonSchemaVersion` param controls which version of each schema the API returns:

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersion: {
      employment_basic_information: 3, // Use v3 of basic info schema
    },
    jsonSchemaVersionByCountry: {
      DEU: {
        contract_details: 4, // Germany uses v4 of contract details
      },
      CHE: {
        contract_details: 2, // Switzerland uses v2
      },
    },
  }}
/>
```

**Why versioning:**

- Backend can evolve schemas without breaking existing flows
- Different countries can be on different schema versions
- Consumers can opt into new versions when ready
- Gradual rollout of schema changes

**Schema shape:**

```json
{
  "type": "object",
  "properties": {
    "first_name": {
      "type": "string",
      "title": "First Name",
      "description": "Employee's legal first name",
      "minLength": 1
    }
  },
  "required": ["first_name"]
}
```

### 3.3 Step Components Pattern

Each step is a self-contained component:

```tsx
export function BasicInformationStep({
  onSuccess,
  onError,
}: {
  onSuccess?: (response: ApiResponse) => void;
  onError?: (error: { error: Error; fieldErrors: FieldError[] }) => void;
}) {
  const { flowBag } = useFlowContext();

  const mutation = useMutation({
    mutationFn: submitBasicInfo,
    onSuccess: (data) => {
      flowBag.stepState.next(); // Advance step
      onSuccess?.(data);
    },
    onError: (error) => {
      const normalized = isMutationError(error)
        ? { error, fieldErrors: error.fieldErrors }
        : { error: new Error('Unknown'), fieldErrors: [] };
      onError?.(normalized);
    },
  });

  return <JsonSchemaForm fields={flowBag.fields} onSubmit={mutation.mutate} />;
}
```

**Key patterns:**

- Step components **don't hold state** (state lives in `flowBag`)
- Step components **expose callbacks** (`onSuccess`, `onError`) for consumer control
- Step components **use the mutation pattern** (see next section)

### 3.4 Validation

Forms are validated using:

1. **JSON Schema validation** (native in `@remoteoss/remote-json-schema-form-kit` v1+)
2. **React Hook Form** (field-level + form-level validation)
3. **Backend validation** (returned in mutation errors)

**Legacy:** Older flows may still use Yup or Zod schemas generated from JSON Schema. With `@remoteoss/remote-json-schema-form-kit` v1+, JSON Schema validation is handled natively without needing Yup/Zod adapters.

**Validation flow:**

```tsx
// 1. Get form schema (includes validation from JSON Schema)
const formSchema = useGetSchema(jsonSchema); // Internally calls createHeadlessForm

// 2. React Hook Form with schema validation
const { handleSubmit } = useForm({
  // Validation resolver is built into formSchema
});

// 3. Transform values before submission (from formSchema)
const handleValidation = formSchema.handleValidation; // Async function

// 4. Submit to API
const mutation = useMutation({
  mutationFn: async (values) => {
    const parsed = await handleValidation(values); // Transform via schema
    return submitToApi(parsed);
  },
});

// 5. Handle backend validation errors
mutation.onError((error) => {
  if (isMutationError(error)) {
    // Set field errors from backend
    error.fieldErrors.forEach(({ field, messages }) => {
      setError(field, { message: messages[0] });
    });
  }
});
```

**Key insight:** `handleValidation` comes from the schema (via `createHeadlessForm` from `@remoteoss/remote-json-schema-form-kit`), not manually written validation logic. The JSON Schema is the source of truth for validation rules and transformations.

**Important:** `handleValidation` and `parseFormValues` are **async** since v1.0.0 (see `MIGRATION.md`).

---

## 4. Data & API Patterns

### 4.1 React Query Patterns

We use **two patterns** deliberately:

#### Pattern A: `queryOptions` Factory (Preferred for flexibility)

```tsx
// api.ts
export const countriesOptions = (client: Client) => {
  return queryOptions({
    queryKey: ['countries'] as const,
    retry: false,
    queryFn: async () => {
      const response = await getSupportedCountry({ client });
      if (response.error || !response.data) {
        throw new Error('Failed to fetch countries');
      }
      return response;
    },
  });
};

// Usage: consumers can compose with their own options
const { data } = useQuery({
  ...countriesOptions(client),
  select: (response) => response.data?.filter((c) => c.active),
  staleTime: 60000,
  enabled: isReady,
});
```

**Use when:**

- Different call sites need different `select` transformations (either within library flows or by external consumers)
- Need to add `enabled`, `staleTime`, or other React Query options at usage site
- Query needs to work with `useSuspenseQuery`, `useQueries`, or prefetching

#### Pattern B: Custom Hook (For fixed transformations)

```tsx
// api.ts
export const useIdentity = () => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['identity'],
    queryFn: () => getCurrentIdentity({ client }),
    select: (data) => data.data?.data, // Always return this shape
  });
};

// Usage: consumers get the same transformation every time
const { data: identity } = useIdentity();
```

**Use when:**

- The data transformation is **always identical** across all consumers
- The hook adds business logic beyond just query configuration
- No need for composability (everyone wants the same thing)

**Decision guide:** If you're unsure, start with `queryOptions`. It's more flexible and can always be wrapped in a custom hook later.

### 4.2 OpenAPI-Generated Types

All API types are generated from OpenAPI specs:

```bash
npm run openapi-ts        # From production gateway
npm run openapi-ts:local  # From local gateway
```

**Generated files** (never hand-edit):

- `src/client/types.gen.ts` - TypeScript types
- `src/client/sdk.gen.ts` - SDK functions
- `src/client/schemas.gen.ts` - Zod schemas

**Usage:**

```tsx
import { GetEmployment } from '@/src/client/sdk.gen';
import type { Employment } from '@/src/client/types.gen';

const { data } = await GetEmployment({
  client,
  path: { id: employmentId },
});
```

**Linting:** `.oxlintrc.json` ignores `src/client/**/*.gen.ts` from lint checks.

### 4.3 Mutation Normalization

All mutations use `mutationToPromise` to normalize errors:

```tsx
import { mutationToPromise } from '@/src/lib/mutations';

const mutation = useMutation({
  mutationFn: mutationToPromise(async (values) => {
    return await createEmployment({ client, body: values });
  }),
});
```

**What `mutationToPromise` does:**

1. Wraps SDK calls in try/catch
2. Normalizes API errors into `MutationError`
3. Extracts field errors from backend response
4. Provides `normalizedErrors`, `fieldErrors`, `rawError` properties

**Don't use plain `mutateAsync`** - always use `mutationToPromise` or the newer `mutateAsyncOrThrow` pattern.

### 4.4 Error Handling

Backend errors are normalized via `MutationError`:

```tsx
try {
  await mutation.mutateAsync(values);
} catch (error) {
  if (isMutationError(error)) {
    // ✅ Type-safe access to normalized errors
    console.log(error.normalizedErrors); // { field_name: { error: [...], source: '...' } }
    console.log(error.fieldErrors); // [{ field, messages, userFriendlyLabel }]
    console.log(error.rawError); // Original API error
    console.log(error.response); // HTTP response

    // Example: Handle AI validation errors
    const aiError = error.normalizedErrors.services_and_deliverables;
    if (aiError?.source === 'remote_ai' && aiError.skippable) {
      // Show warning, allow user to skip
    }
  }
  throw error; // Re-throw after handling
}
```

**Why the type guard:** Without `isMutationError()`, TypeScript doesn't know the error shape. Always use the guard before accessing error properties.

### 4.5 Step Transitions via Mutations

Steps advance automatically when mutations succeed:

```tsx
const mutation = useMutation({
  mutationFn: mutationToPromise(submitStep),
  onSuccess: (response) => {
    stepState.next(); // ✅ Step advances automatically
    onSuccess?.(response); // ✅ Consumer callback (optional)
  },
  onError: (error) => {
    // ✅ Error is handled, step does NOT advance
    onError?.({ error, fieldErrors: [...] });
  },
});
```

**Key pattern:** Steps advance themselves on mutation success. Errors prevent advancement and are surfaced via the `onError` callback.

**Why steps advance automatically:**

- Consistent behavior across all flows
- Consumer doesn't need to know step sequencing logic
- Step knows its own success criteria

**Consumer callbacks (`onSuccess`, `onError`):**

- `onSuccess` - For side effects (analytics, showing toasts, redirecting)
- `onError` - For displaying errors, but step advancement is already blocked

**Exceptions - when consumers control advancement:**

⚠️ **Business logic requires conditional advancement:**

```tsx
// Example: Skip step based on response
onSuccess: (response) => {
  if (response.requiresAdditionalVerification) {
    stepState.goToStep('verification'); // Manual navigation
  } else {
    stepState.next(); // Or skip to completion
  }
};
```

⚠️ **Mutation fails but user can continue:**

```tsx
onError: ({ error, fieldErrors }) => {
  if (isMutationError(error) && error.canSkip) {
    // Show warning but allow proceeding
    setShowSkipOption(true);
  }
};

// Later: <button onClick={() => stepState.next()}>Continue Anyway</button>
```

**Pattern:** Step triggers mutation → mutation succeeds → step advances + consumer notified → mutation fails → step stays + consumer handles error (or conditionally allows skip).

---

## 5. Authentication & Proxy Pattern

### 5.1 Auth Prop Architecture

Flows require authentication via the `auth` prop on `<RemoteFlows>`:

```tsx
<RemoteFlows
  auth={async () => {
    const token = await fetchToken(); // Server-side call
    return {
      accessToken: token,
      expiresIn: 3600, // seconds
    };
  }}
>
  {/* flows */}
</RemoteFlows>
```

**Why `auth` is a function:**

- Tokens expire - we call `auth` again when the token expires
- Server-side fetching - avoid exposing API keys/secrets client-side
- Flexibility - consumers control how they get tokens (cookie, session, etc.)

### 5.2 Server-Side Proxy Pattern

Consumers can proxy API calls through their backend:

```tsx
<RemoteFlows
  proxy={{
    url: 'https://your-backend.com',
    headers: { 'x-custom-header': 'value' },
  }}
>
  {/* flows */}
</RemoteFlows>
```

**How it works:**

1. SDK makes request to `/v1/employments/xxx`
2. SDK sees `proxy.url` is set
3. SDK rewrites request to `https://your-backend.com/v1/employments/xxx`
4. Your backend:
   - Receives request with `x-custom-header`
   - Proxies request to Remote API with `Authorization: Bearer <token>`
   - Returns response to frontend

**Why use a proxy:**

- **Security:** Never expose API keys client-side

---

## 6. Customization System

### 6.1 Theming (CSS Custom Properties)

Consumers customize appearance via the `theme` prop:

```tsx
<RemoteFlows
  theme={{
    colors: {
      primaryBackground: '#ffffff',
      primaryForeground: '#364452',
      accentBackground: '#e3e9ef',
      accentForeground: '#0f1419',
      danger: '#d92020',
      borderInput: '#cccccc',
    },
    spacing: '0.25rem',
    borderRadius: '0px',
    font: { fontSizeBase: '1rem' },
  }}
>
```

**Note:** While theming is available, most consumers prefer to use custom CSS classes as it provides more granular control.

**How it works:**

- `applyTheme()` (from `src/lib/applyTheme.ts`) converts theme object to CSS custom properties
- Properties are injected into `<style>` tag in document head
- Components reference properties: `var(--RemoteFlows-primaryBackground)`

**CSS class naming:**

- Prefix: `RemoteFlows__`
- Examples: `RemoteFlows__Button`, `RemoteFlows__Input`, `RemoteFlows__Select`
- Variants: `RemoteFlows__Button--primary`, `RemoteFlows__Button--danger`

**Consumers can also override with CSS:**

```css
.RemoteFlows__Button {
  background: blue !important;
}
```

### 6.2 Field Component Overrides

Consumers can replace default field renderers:

```tsx
import type { FieldComponentProps } from '@remoteoss/remote-flows';

const CustomInput = ({ field, fieldState, fieldData }: FieldComponentProps) => (
  <div>
    <label htmlFor={field.name}>{fieldData.label}</label>
    <input {...field} className="my-custom-input" />
    {fieldState.error && <p className="error">{fieldState.error.message}</p>}
  </div>
);

<RemoteFlows components={{ text: CustomInput }}>
```

**Field types you can override:**

- `text`, `textarea`, `email`, `tel`, `url`
- `number`, `select`, `radio`, `checkbox`
- `date`, `datetime-local`, `time`
- `file`, `hidden`

**Critical rule:** Custom components **must** spread `{...field}` onto the input element:

```tsx
// ✅ CORRECT: Binds React Hook Form
<input {...field} />

// ❌ WRONG: Form won't work
<input value={someValue} onChange={someHandler} />
```

**Why:** `field` contains `name`, `value`, `onChange`, `onBlur`, `ref` props that React Hook Form needs.

### 6.3 jsfModify for Schema Text

Consumers can override text in JSON schemas without code changes:

```tsx
<OnboardingFlow
  jsfModify={{
    modify: {
      first_name: {
        label: 'Given Name',
        description: 'Enter your first name as it appears on your ID',
      },
      last_name: {
        label: 'Family Name',
      },
    },
  }}
/>
```

**What can be overridden:**

- `label` - Field label text
- `description` - Help text below field
- `placeholder` - Input placeholder

**Why this pattern:**

- No need to fork/override components
- Centralized text changes (i18n, A/B tests, brand voice)
- Survives library upgrades (schema structure changes don't break overrides)

**Implementation:** `@remoteoss/remote-json-schema-form-kit` handles the merging.

### 6.4 Current Consumer Patterns

**What consumers actually do** (based on real usage):

1. **Use `components` prop** - Bring their own input components that match their design system
2. **CSS classes** - Override styles via `RemoteFlows__*` classes rather than `theme` prop
3. **`jsfModify`** - Override labels/descriptions for i18n or brand voice
4. **Minimal theming** - Most don't use the `theme` prop, preferring direct CSS control

**Why this matters:**

- The `components` prop is the primary customization mechanism
- CSS classes are more popular than theme tokens
- Simplicity wins: Fewer props, clearer docs, better DX

### 6.5 Bundle Size Considerations

**Current approach:** Bundle size limits are **monitoring tools, not hard gates**.

```json
// .sizelimit.json
{
  "@remoteoss/remote-flows": {
    "limit": "150kb"
  }
}
```

**What we monitor:**

- Total bundle size via `npm run size`
- Impact of new dependencies
- Trends over time (is it growing?)

**Why not hard limits:**

- Sometimes a valuable feature justifies the size increase
- Different flows have different size requirements
- Gives flexibility while maintaining awareness

**What to do when bundle grows:**

1. **Understand why** - New dependency? Larger schema? More features?
2. **Is it justified?** - Does the value outweigh the cost?
3. **Can we optimize?** - Lazy loading? Tree shaking? Smaller alternative?

**Best practices:**

- Lazy-load default components (`lazy-default-components.ts`)
- External dependencies (React, React DOM) aren't bundled
- Split flows into separate entry points (`/flows/*`)
- Review dependencies before adding them

**Goal:** Stay aware of bundle size without blocking valuable features.

---

## 7. Testing Philosophy

### 7.1 Vitest Globals

Vitest globals are **enabled** in `vitest.config.ts`:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true, // ← This line
  },
});
```

**Do NOT import test utilities:**

```tsx
// ❌ WRONG
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ✅ CORRECT
describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should work', () => {
    expect(true).toBe(true);
  });
});
```

**Why:** Globals reduce boilerplate. This is a project convention - follow it.

### 7.2 MSW for API Mocking

All API calls are mocked using MSW (Mock Service Worker):

```tsx
// src/tests/server.ts
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const server = setupServer(
  http.get('/v1/employments/:id', ({ params }) => {
    return HttpResponse.json({ id: params.id, country: { code: 'USA' } });
  }),
);
```

**Test setup:**

```tsx
// vitest.setup.ts
import { server } from './src/tests/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**Per-test overrides:**

```tsx
it('handles error', async () => {
  server.use(
    http.get('/v1/employments/:id', () => {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }),
  );

  // Test error handling
});
```

**Fixtures:** Store mock data in `{flow}/tests/fixtures.ts`:

```tsx
// src/flows/Onboarding/tests/fixtures.ts
export const mockEmployment = {
  id: 'emp-123',
  country: { code: 'USA' },
  status: 'pending',
};
```

### 7.3 Strict Equality Assertions

Always use **exact object matching**, never `expect.objectContaining()`:

```tsx
// ❌ BAD: Too loose, hides bugs
expect(mockApiCall).toHaveBeenCalledWith(
  expect.objectContaining({ employmentId: 'xxx' }),
);

// ✅ GOOD: Exact match
expect(mockApiCall).toHaveBeenCalledWith({
  employmentId: 'xxx',
  countryCode: 'USA',
  values: { first_name: 'John' },
});
```

**Why:** `objectContaining` lets tests pass even if we're passing extra unexpected fields. Strict equality catches bugs.

### 7.4 QueryClient Management

React Query tests must wrap components in a provider:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

describe('useEmployment', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  afterEach(() => {
    queryClient.clear(); // ⚠️ IMPORTANT: Clear between tests
  });

  it('fetches employment', async () => {
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useEmployment('emp-123'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockEmployment);
  });
});
```

**Critical:** `queryClient.clear()` in `afterEach` prevents test pollution.

---

## 8. Evolving the API

### 8.1 Decision Framework

When adding features, ask:

#### Question 1: Is this presentation or business logic?

- **Presentation:** UI-only concern (colors, layout, animation)
  - → Offer via `theme` prop or CSS classes
  - → Example: Button color variants
- **Business logic:** Affects behavior (validation, API calls, state)
  - → Handle internally, expose minimal props if needed
  - → Example: Auto-save on blur

#### Question 2: How much does it vary across consumers?

- **Always the same:** Fixed behavior for everyone
  - → Hardcode it, no prop needed
  - → Example: Mutation retry logic
- **Sometimes varies:** Some consumers need different behavior
  - → Add optional prop with sensible default
  - → Example: `validateOnBlur?: boolean`
- **Always varies:** Every consumer has different needs
  - → Offer component override slot
  - → Example: Custom field renderers

#### Question 3: Can we add it later without breaking changes?

- **Yes:** Additive change (new optional prop/field)
  - → Safe to add now
  - → Example: New field in `flowBag`
- **No:** Would require removing/changing existing API
  - → Think hard before adding
  - → Might need major version bump
  - → Example: Making optional prop required

### 8.2 Additive vs Breaking Changes

#### ✅ Safe Additive Changes (minor/patch)

```tsx
// Before
type FlowBag = {
  employmentId: string;
  countryCode: string;
};

// After: Added new optional field
type FlowBag = {
  employmentId: string;
  countryCode: string;
  jurisdiction?: string; // ← New
};
```

```tsx
// Before
<OnboardingFlow employmentId="xxx" />

// After: Added new optional prop
<OnboardingFlow
  employmentId="xxx"
  validateOnBlur={false} // ← New, optional
/>
```

#### ❌ Breaking Changes (major version required)

```tsx
// Before
const handleValidation = (values: FormValues) => ParsedValues;

// After: Changed return type to async
const handleValidation = (values: FormValues) => Promise<ParsedValues>;
// ↑ BREAKING: Consumers using `const result = handleValidation(...)` will break
```

```tsx
// Before
<OnboardingFlow employmentId="xxx" />

// After: Made prop required
<OnboardingFlow
  employmentId="xxx"
  countryCode="USA" // ← Now required
/>
// ↑ BREAKING: Existing code without `countryCode` will break
```

```tsx
// Before
type FlowBag = { employmentId: string };

// After: Renamed field
type FlowBag = { employment_id: string }; // Changed snake_case
// ↑ BREAKING: Code accessing `flowBag.employmentId` will break
```

### 8.3 Public API vs Internals

**Public API** (`src/index.tsx`):

```tsx
export { OnboardingFlow } from './flows/Onboarding';
export { useOnboarding } from './flows/Onboarding/hooks';
export type { OnboardingFlowBag } from './flows/Onboarding/types';
```

- Semver guarantees apply
- Breaking changes require major version
- Full TypeScript documentation

**Internals** (`src/internals.tsx`):

```tsx
export { parseStepValues } from './lib/utils';
export { useStepState } from './flows/useStepState';
export { mutationToPromise } from './lib/mutations';
```

- **No semver guarantees**
- Can change in any version
- For advanced consumers who need low-level access
- Documented with "⚠️ Internal API - may change without notice"

**When to use internals:**

- Experimental features we're not ready to commit to
- Low-level utilities that most consumers don't need
- Implementation details that might need to change

### 8.4 Example Scenarios

#### Scenario 1: Consumer requests "disable submit button while loading"

**Analysis:**

- Presentation concern? Yes (button state)
- Business logic concern? Partly (we control `isSubmitting`)
- Does it vary? No, everyone wants this

**Decision:** Make default `SubmitButton` auto-disable when `isSubmitting`. No prop needed.

```tsx
export function SubmitButton({ children, disabled, ...props }) {
  const { flowBag } = useFlowContext();
  return (
    <button
      disabled={disabled || flowBag.isSubmitting} // ← Auto-disable
      {...props}
    >
      {children}
    </button>
  );
}
```

**Why:** This is sensible default behavior. If a consumer wants different behavior, they can override the `SubmitButton` component.

#### Scenario 2: Consumer requests "step navigation from URL params"

**Analysis:**

- Presentation? No
- Business logic? Yes (routing)
- Does it vary? Yes (different apps have different routing patterns)
- Can we handle internally? No (we don't know their routing)

**Decision:** Expose `goToStep` in the bag, let consumer handle routing:

```tsx
function MyFlow() {
  const { flowBag } = useOnboarding({ employmentId });
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const step = searchParams.get('step');
    if (step) flowBag.stepState.goToStep(step);
  }, [searchParams]);

  // ...
}
```

**Why:** Routing is consumer's responsibility. We provide primitives (`goToStep`), they wire it up.

---

## 9. Example App Patterns

The `example/` app demonstrates integration patterns. These are **not** part of the library—they're reference implementations showing best practices for consuming the library.

### 9.1 Dynamic Step Navigation

**Good examples:** `example/src/Onboarding.tsx`, `example/src/ContractorOnboarding.tsx`

Steps should be **dynamic and generated from the hooks/bag**, not hardcoded:

```tsx
// ✅ GOOD: Dynamic steps from the bag
const OnBoardingRender = ({ onboardingBag, components }) => {
  const currentStepIndex = onboardingBag.stepState.currentStep.index;

  return (
    <>
      <div className='steps-navigation'>
        <ul>
          {onboardingBag.steps
            .filter((step) => step.visible)
            .map((step, index) => (
              <li
                key={step.name}
                className={`step-item ${step.index === currentStepIndex ? 'active' : ''}`}
              >
                {index + 1}. {step.label}
              </li>
            ))}
        </ul>
      </div>
      {/* Render current step */}
    </>
  );
};
```

```tsx
// ❌ BAD: Hardcoded steps
const STEPS = ['Select Country', 'Basic Information', 'Contract Details'];

{
  STEPS.map((step, index) => <li key={index}>{step}</li>);
}
```

**Why dynamic steps:**

- **Steps can be conditionally shown/hidden** - Based on country, product type, feature flags
- **Step labels come from SDK** - Can be updated if necessary by consumers
- **Step order can change** - Without breaking the UI

**How it works:**

Steps are generated in `src/flows/{FlowName}/hooks.tsx`:

```tsx
// hooks.tsx - Steps are defined here
const steps = [
  { name: 'select_country', label: 'Select Country', visible: true, index: 0 },
  {
    name: 'basic_information',
    label: 'Basic Information',
    visible: true,
    index: 1,
  },
  {
    name: 'contract_details',
    label: 'Contract Details',
    visible: !!countryCode,
    index: 2,
  },
  // ...
];

// Returned in the bag
return {
  steps,
  stepState,
  // ...
};
```

Consumers map over `flowBag.steps` to render navigation UI.

### 9.2 Component Structure Convention

Example apps follow this naming pattern for clarity:

```tsx
// Top-level export (what consumers import)
export function OnboardingForm() {
  return (
    <RemoteFlows {...auth}>
      <OnboardingWithProps {...formData} />
    </RemoteFlows>
  );
}

// Inner component: renders the flow
function OnboardingWithProps({ companyId, type }) {
  return (
    <OnboardingFlow
      companyId={companyId}
      type={type}
      render={OnBoardingRender}
    />
  );
}

// Render function: receives bag and components
function OnBoardingRender({ onboardingBag, components }) {
  // Render UI using bag + components
}
```

**Why this structure:**

- Clear separation: auth setup → flow props → render logic
- Easy to test each layer independently
- Shows consumers how to compose the library

### 9.3 Error Handling Pattern

Example apps use a shared error type and display component:

```tsx
type Errors = {
  apiError: string;
  fieldErrors: {
    field: string;
    messages: string[];
    userFriendlyLabel: string;
  }[];
};

const [errors, setErrors] = useState<Errors>({ apiError: '', fieldErrors: [] });

<StepComponent
  onError={(e) => setErrors({
    apiError: e.error.message,
    fieldErrors: e.fieldErrors
  })}
/>

<AlertError errors={errors} />
```

**Why this pattern:**

- Separates API errors from field errors
- Lets consumer map field names to user-friendly labels
- Shared `AlertError` component displays both types
- Shows one way to handle errors (consumers can choose their own pattern)

**Not part of library:** Error display is consumer responsibility. Examples show one approach.

---

## Summary

This architecture guide captures the **patterns**, **philosophy**, and **decision-making framework** for `@remoteoss/remote-flows`.

**Key takeaways:**

1. **Headless-first** - Business logic by default, UI as an option
2. **Zero consumer complexity** - Handle API calls, state, validation internally
3. **Flexible customization** - Props for common needs, component overrides for edge cases
4. **Stable public API** - Additive changes preferred, breaking changes minimized
5. **Two React Query patterns** - `queryOptions` for flexibility, custom hooks for fixed transformations
6. **Proxy pattern for auth** - Server-side token minting, header-based scoping
7. **Multi-step state machine** - `useStepState` primitive, mutations advance steps
8. **Test with globals** - Vitest globals enabled, MSW for mocking, strict equality assertions

**When making decisions, ask:**

- Does this force consumers to rewrite code?
- Do we have to explain to the consumer, how to use it and its cumbersome?
- Can we add it later without breaking changes?
- Should this be a prop or a component override?

**For questions not covered here, see:**

- `CLAUDE.md` - Implementation details
- `README.md` - User-facing documentation
- `MIGRATION.md` - Breaking changes and upgrade paths
- `docs/COMPONENT_CUSTOMIZATION.md` - Field component overrides
