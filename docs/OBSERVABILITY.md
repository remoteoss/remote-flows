# RemoteFlows Observability Documentation

## Table of Contents

- [Overview](#overview)
- [Table of Contents](#table-of-contents)
- [Architecture](#architecture)
  - [System Components](#system-components)
- [Core Modules](#core-modules)
  - [1. Error Context System](#1-error-context-system)
  - [2. Error Boundary](#2-error-boundary)
  - [3. Telemetry Service](#3-telemetry-service)
  - [5. Unhandled Error Reporting](#5-unhandled-error-reporting)
  - [6. React Query Integration](#6-react-query-integration)
- [Error Payload Schema](#error-payload-schema)
  - [Full Payload Structure](#full-payload-structure)
  - [Example Payload](#example-payload)
- [Debug Mode](#debug-mode)
  - [Enabling Debug Mode](#enabling-debug-mode)
  - [Debug Output](#debug-output)
  - [Debug Messages](#debug-messages)
- [Configuration](#configuration)
  - [Provider Configuration](#provider-configuration)
  - [Error Boundary Options](#error-boundary-options)
- [API Endpoint](#api-endpoint)
  - [Telemetry Error Reporting](#telemetry-error-reporting)
- [Best Practices](#best-practices)
  - [1. Always Use Error Context in Flows](#1-always-use-error-context-in-flows)
  - [2. Custom Fallback UI](#2-custom-fallback-ui)
- [Testing](#testing)
  - [Testing Error Boundaries](#testing-error-boundaries)
- [Architecture Decisions](#architecture-decisions)
  - [Why WeakSet for Handled Errors?](#why-weakset-for-handled-errors)
  - [Why Global Ref for Error Context?](#why-global-ref-for-error-context)
  - [Why 100ms Deduplication Window?](#why-100ms-deduplication-window)
  - [Why Filter 404 Errors?](#why-filter-404-errors)
- [Summary](#summary)
- [Additional Resources](#additional-resources)

## Overview

RemoteFlows SDK includes a comprehensive observability system that automatically captures, categorizes, and reports errors to a telemetry API. The system is designed to:

- **Prevent crashes**: Error boundaries catch errors before they crash the host application
- **Track context**: Automatically captures flow, step, and query/mutation metadata
- **Categorize intelligently**: Classifies errors by type and severity
- **Filter noise**: Only reports actionable errors (excludes client errors like 404s)
- **Deduplicate**: Prevents duplicate error reports from React Strict Mode
- **Debug-friendly**: Includes rich console logging when debug mode is enabled

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     RemoteFlows Provider                     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         ErrorContextProvider                        │    │
│  │  (Manages flow/step context for error reports)     │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │   RemoteFlowsErrorBoundary                   │  │    │
│  │  │   • Catches render errors                    │  │    │
│  │  │   • Reports to telemetry API                 │  │    │
│  │  │   • Shows fallback UI or rethrows            │  │    │
│  │  │                                               │  │    │
│  │  │  ┌────────────────────────────────────────┐  │  │    │
│  │  │  │   QueryClientProvider                  │  │  │    │
│  │  │  │   • Query/Mutation error handlers     │  │  │    │
│  │  │  │   • Reports React Query errors         │  │  │    │
│  │  │  │                                         │  │  │    │
│  │  │  │  ┌──────────────────────────────────┐  │  │  │    │
│  │  │  │  │   Flow Components                │  │  │  │    │
│  │  │  │  │   • useErrorReporting()          │  │  │  │    │
│  │  │  │  │   • Updates error context        │  │  │  │    │
│  │  │  │  │                                   │  │  │  │    │
│  │  │  │  │  useErrorReportingForUnhandled  │  │  │  │    │
│  │  │  │  │  • window.error listener         │  │  │  │    │
│  │  │  │  │  • unhandledrejection listener   │  │  │  │    │
│  │  │  │  └──────────────────────────────────┘  │  │  │    │
│  │  │  └────────────────────────────────────────┘  │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Core Modules

### 1. Error Context System

**Files:**

- `src/components/error-handling/ErrorContext.tsx`
- `src/components/error-handling/useErrorReporting.ts`

**Purpose:** Tracks flow/step information for contextual error reporting.

```typescript
type ErrorContextData = {
  flow?: string; // e.g., "onboarding", "termination"
  step?: string; // e.g., "basic_information", "contract_details"
  metadata?: Record<string, unknown>; // Additional context
};
```

**Usage in Flows:**

```typescript
// In flow hooks (e.g., useOnboarding)
const { updateErrorContext } = useErrorReporting({
  flow: 'onboarding',
  metadata: {
    employmentId,
    companyId,
    isUpdating: Boolean(employmentId),
  },
});

// Update context when step changes
const onStepChange = useCallback(
  (step: Step) => {
    updateErrorContext({ step: step.name });
  },
  [updateErrorContext],
);
```

**Global Context Reference:**

The error context is synchronized to a global ref (`globalErrorContextRef`) so React Query error handlers can access it without prop drilling.

### 2. Error Boundary

**File:** `src/components/error-handling/RemoteFlowsErrorBoundary.tsx`

**Features:**

- Catches React rendering errors
- Reports errors to telemetry API
- Marks errors as "handled" to prevent duplicate reports
- Configurable fallback UI or rethrow behavior

**Props:**

```typescript
interface RemoteFlowsErrorBoundaryProps {
  debug: boolean; // Enable console logging
  environment?: Environment; // 'production' | 'sandbox' | 'staging' | 'local'
  client: Client; // API client instance
  errorBoundary?: {
    useParentErrorBoundary?: boolean; // Rethrow to parent (default: false)
    fallback?: ReactNode | ((error: Error) => ReactNode); // Custom UI
  };
}
```

**Default Behavior:**

- Shows fallback UI: `<FallbackErrorBoundary />` (red alert box)
- If `useParentErrorBoundary: true`, rethrows to parent boundary

### 3. Telemetry Service

**File:** `src/components/error-handling/telemetryService.ts`

**Core Functions:**

#### `reportTelemetryError()`

Main entry point for error reporting:

1. Checks deduplication (100ms window)
2. Builds error payload
3. Filters via `shouldReportError()`
4. Logs to console (debug mode)
5. POSTs to `/v1/telemetry/errors` endpoint
6. Silently fails if telemetry API is down

**Deduplication:**

Uses a `Map<errorSignature, timestamp>` to prevent duplicate reports within 100ms (catches React Strict Mode double-invokes).

### 5. Unhandled Error Reporting

**File:** `src/components/error-handling/useErrorReportingForUnhandledErrors.tsx`

**Purpose:** Captures errors not caught by error boundaries.

**Listeners:**

- `window.addEventListener('error')` - Runtime JavaScript errors
- `window.addEventListener('unhandledrejection')` - Promise rejections

**Deduplication with Error Boundary:**

Uses a `WeakSet<Error>` to track errors already handled by error boundaries, preventing duplicate reports.

### 6. React Query Integration

**File:** `src/queryConfig.ts`

**Purpose:** Reports errors from TanStack Query operations.

**Context Enrichment:**

Query/mutation errors include:

- Current flow and step from `globalErrorContextRef`
- `queryKey` or `mutationKey` in metadata
- All standard error payload fields

## Error Payload Schema

### Full Payload Structure

```typescript
type ErrorPayload = {
  error: {
    message: string; // Error message
    stack?: string; // Stack trace
    name: string; // Error name (TypeError, etc.)
    category: ErrorCategory; // Classified category
    severity: ErrorSeverity; // Classified severity
    component_stack?: string[]; // React component hierarchy
  };
  context?: {
    flow?: string; // Current flow
    step?: string; // Current step
    metadata?: {
      employmentId?: string; // Business context
      queryKey?: string; // React Query context
      mutationKey?: string; // React Query context
      [key: string]: unknown;
    };
  };
  metadata: {
    sdk_version: string; // RemoteFlows version
    timestamp: string; // ISO 8601 timestamp
    url: string; // Current page URL
    user_agent: string; // Browser user agent
    environment: Environment; // SDK environment
  };
};
```

### Example Payload

```json
{
  "error": {
    "message": "Cannot read property 'country' of undefined",
    "stack": "TypeError: Cannot read property 'country' of undefined\n    at OnboardingForm...",
    "name": "TypeError",
    "category": "RUNTIME_ERROR",
    "severity": "critical",
    "component_stack": ["OnboardingForm", "BasicInformationStep"]
  },
  "context": {
    "flow": "onboarding",
    "step": "basic_information",
    "metadata": {
      "employmentId": "emp_123",
      "companyId": "com_456",
      "isUpdating": true
    }
  },
  "metadata": {
    "sdk_version": "1.2.3",
    "timestamp": "2025-11-30T12:34:56.789Z",
    "url": "https://app.remote.com/onboarding",
    "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
    "environment": "production"
  }
}
```

## Debug Mode

### Enabling Debug Mode

```tsx
<RemoteFlows auth={auth} debug={true}>
  {/* flows */}
</RemoteFlows>
```

### Debug Output

When `debug: true`, errors are logged to console with rich formatting:

```
📮 [RemoteFlows] Error Report (Debug Mode)
─────────────────────────────────────────
❌ Error: Cannot read property 'country' of undefined
📛 Name: TypeError
🔴 Severity: CRITICAL
🏷️  Category: RUNTIME_ERROR
🧩 Component Stack: OnboardingForm → BasicInformationStep
🔄 Flow: onboarding
📍 Step: basic_information
📝 Context Metadata: { employmentId: "emp_123", ... }
⏰ Timestamp: 2025-11-30T12:34:56.789Z
🌐 URL: https://app.remote.com/onboarding
📦 SDK Version: 1.2.3

📚 Stack Trace:
[full stack trace...]

📋 Full Payload (would be sent to telemetry):
{
  "error": { ... },
  "context": { ... },
  "metadata": { ... }
}
─────────────────────────────────────────
```

### Debug Messages

- `"[RemoteFlows] Skipping duplicate error report"` - Deduplication caught duplicate
- `"[RemoteFlows] Skipping already-handled error from window listener"` - Error already handled by boundary
- `"[RemoteFlows] Failed to report error telemetry: ..."` - Telemetry API call failed
- `"[RemoteFlows] Error telemetry setup failed: ..."` - Telemetry initialization error

## Configuration

### Provider Configuration

```tsx
<RemoteFlows
  auth={fetchToken}
  environment='production' // or "sandbox", "staging"
  debug={false} // Enable verbose logging
  errorBoundary={{
    useParentErrorBoundary: true, // Rethrow to parent
    fallback: <CustomErrorUI />, // Custom fallback UI
  }}
>
  {/* flows */}
</RemoteFlows>
```

### Error Boundary Options

| Option                   | Type                                         | Default                     | Description                                                                   |
| ------------------------ | -------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------- |
| `useParentErrorBoundary` | `boolean`                                    | `false`                     | If `true`, rethrows errors to parent boundary. If `false`, shows fallback UI. |
| `fallback`               | `ReactNode \| ((error: Error) => ReactNode)` | `<FallbackErrorBoundary />` | Custom UI to show when error occurs. Can be static or function.               |

**Default Fallback UI:**

```tsx
<div
  style={{
    padding: '20px',
    border: '1px solid #dc2626',
    borderRadius: '4px',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
  }}
>
  Something went wrong in RemoteFlows. Please refresh the page.
</div>
```

## API Endpoint

### Telemetry Error Reporting

**Endpoint:** `POST /v1/telemetry/errors`

**Request Body:**

```typescript
{
  error: {
    message: string;
    stack?: string;
    name: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    component_stack?: string[];
  };
  context?: ErrorContextData;
  metadata: {
    sdk_version: string;
    timestamp: string;
    url: string;
    user_agent: string;
    environment: Environment;
  };
}
```

**Responses:**

- `204 No Content` - Success
- `400 Bad Request` - Invalid payload
- `429 Too Many Requests` - Rate limited

**Error Handling:**

The SDK silently fails if telemetry API is unavailable (won't crash the app):

```typescript
try {
  await postReportErrorsTelemetry({ client, body: payload });
} catch (err) {
  // Silently fail - don't crash if telemetry reporting fails
  if (debugMode) {
    console.warn('[RemoteFlows] Failed to report error telemetry:', err);
  }
}
```

## Best Practices

### 1. Always Use Error Context in Flows

```typescript
const { updateErrorContext } = useErrorReporting({
  flow: 'myFlow',
  metadata: {
    /* relevant business context */
  },
});

// Update on step changes
useEffect(() => {
  updateErrorContext({ step: currentStep });
}, [currentStep]);
```

**PS**: only implemented in OnboardingFlow for now

### 2. Custom Fallback UI

Provide user-friendly error messages:

```tsx
<RemoteFlows
  errorBoundary={{
    fallback: (error) => (
      <div className="error-container">
        <h2>Oops! Something went wrong</h2>
        <p>Please try refreshing the page or contact support.</p>
        {debug && (
          <details>
            <summary>Error Details</summary>
            {error.message}
          </details>
        )}
      </div>
    )
  }}
>
```

## Testing

### Testing Error Boundaries

```tsx
import { render, waitFor } from '@testing-library/react';
import { RemoteFlows } from '@remoteoss/remote-flows';

it('should catch and report errors', async () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  render(
    <RemoteFlows auth={mockAuth} debug={true}>
      <ThrowError />
    </RemoteFlows>,
  );

  await waitFor(() => {
    expect(mockTelemetryAPI).toHaveBeenCalledWith({
      body: {
        error: {
          message: 'Test error',
          category: expect.any(String),
          severity: expect.any(String),
        },
      },
    });
  });
});
```

## Architecture Decisions

### Why WeakSet for Handled Errors?

- **Automatic cleanup**: Garbage collected when errors are no longer referenced
- **No memory leaks**: Unlike Map, doesn't require manual cleanup
- **Perfect for deduplication**: Errors already handled by boundary shouldn't be reported by window listener

### Why Global Ref for Error Context?

- **React Query integration**: Error handlers don't have access to React Context
- **Performance**: Avoids prop drilling through component tree
- **Simplicity**: Single source of truth for current error context
- **Synchronization**: Automatically updated by ErrorContextProvider

### Why 100ms Deduplication Window?

- **React Strict Mode**: In development, React intentionally double-invokes effects
- **Typical delay**: Double-invokes happen within ~10-50ms
- **Safety margin**: 100ms catches legitimate duplicates without filtering distinct errors
- **Cleanup efficiency**: Short enough to periodically clean up without bloat

### Why Filter 404 Errors?

- **Expected behavior**: 404s are often expected (e.g., checking if resource exists)
- **High volume**: Can create noise in telemetry data
- **Not actionable**: Usually don't indicate SDK bugs
- **User decision**: Developers can catch 404s in their own error handlers if needed

---

## Summary

The RemoteFlows observability system provides:

✅ **Automatic error capture** - Error boundaries + window listeners  
✅ **Rich context** - Flow, step, query/mutation metadata  
✅ **Smart filtering** - Only reports actionable errors  
✅ **Deduplication** - Prevents noise from React Strict Mode  
✅ **Intelligent classification** - Categories and severity levels  
✅ **Debug-friendly** - Verbose console logging when enabled  
✅ **Non-blocking** - Never crashes the app, even if telemetry fails  
✅ **Production-ready** - Tested with comprehensive test suite  
✅ **Zero-config** - Works out of the box with sensible defaults

The system is designed to be **zero-config** for basic usage while providing full customization when needed.

## Additional Resources

- [Error Handling Tests](../src/components/error-handling/tests/)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [OpenAPI Schema](../openapi-ts.config.ts)
