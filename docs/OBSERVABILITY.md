# RemoteFlows Observability Documentation

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
  flow?: string;        // e.g., "onboarding", "termination"
  step?: string;        // e.g., "basic_information", "contract_details"
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

```typescript
// src/queryConfig.ts
export const globalErrorContextRef: { current: ErrorContextData } = {
  current: {},
};

// Synced by ErrorContextProvider
useEffect(() => {
  globalErrorContextRef.current = errorContext;
}, [errorContext]);
```

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
  debug: boolean;           // Enable console logging
  environment?: Environment; // 'production' | 'sandbox' | 'staging'
  client: Client;           // API client instance
  errorBoundary?: {
    useParentErrorBoundary?: boolean;  // Rethrow to parent (default: false)
    fallback?: ReactNode | ((error: Error) => ReactNode); // Custom UI
  };
}
```

**Default Behavior:**
- Shows fallback UI: `<FallbackErrorBoundary />` (red alert box)
- If `useParentErrorBoundary: true`, rethrows to parent boundary

**Implementation:**

```typescript
class RemoteFlowsErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Mark as handled to prevent duplicate window listener report
    markErrorAsHandled(error);
    
    // Get error context from React Context
    const errorContext = this.context?.errorContext;
    
    // Report to telemetry API
    reportTelemetryError(
      error,
      npmPackageVersion,
      this.props.client,
      this.props.environment,
      errorContext,
      { debugMode: this.props.debug }
    );
    
    // Optionally rethrow to parent
    if (this.props.errorBoundary?.useParentErrorBoundary) {
      throw error;
    }
  }
}
```

### 3. Telemetry Service

**File:** `src/components/error-handling/telemetryService.ts`

**Core Functions:**

#### `buildErrorPayload()`

Creates standardized error payload with:
- Error details (message, stack, name)
- Category (RENDER_ERROR, NETWORK_ERROR, etc.)
- Severity (critical, error, warning, info)
- Component stack (parsed React components)
- Context (flow, step, metadata)
- Metadata (SDK version, timestamp, URL, user agent, environment)

```typescript
export function buildErrorPayload(
  error: Error,
  sdkVersion: string,
  environment: Environment,
  context?: ErrorContextData,
): ErrorPayload {
  const category = categorizeError(error);
  const severity = determineErrorSeverity(error, category);
  const componentStack = parseComponentStack(error, error.stack);

  return {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
      category,
      severity,
      component_stack: componentStack,
    },
    context,
    metadata: {
      sdk_version: sdkVersion,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      environment: environment,
    },
  };
}
```

#### `shouldReportError()`

Filters which errors get reported:
- ✅ All non-network errors
- ✅ Network errors: 5xx, 401, 403, 429, timeouts
- ❌ Client errors: 404, 400

```typescript
export function shouldReportError(
  error: Error,
  payload: ErrorPayload,
): boolean {
  // Report all non-network errors
  if (payload.error.category !== 'NETWORK_ERROR') {
    return true;
  }

  const message = error.message.toLowerCase();

  // Skip 404 errors
  if (message.includes('404') || message.includes('not found')) {
    return false;
  }

  // Report server errors (5xx) and auth errors (403, 401)
  const reportableStatusPatterns = [
    /\b5\d{2}\b/, // 5xx server errors
    /\b403\b/,    // Forbidden
    /\b401\b/,    // Unauthorized
    /\b429\b/,    // Too Many Requests
    /timeout/i,   // Timeout errors
  ];

  return reportableStatusPatterns.some((pattern) => pattern.test(message));
}
```

#### `reportTelemetryError()`

Main entry point for error reporting:
1. Checks deduplication (100ms window)
2. Builds error payload
3. Filters via `shouldReportError()`
4. Logs to console (debug mode)
5. POSTs to `/v1/telemetry/errors` endpoint
6. Silently fails if telemetry API is down

```typescript
export function reportTelemetryError(
  error: Error,
  sdkVersion: string,
  client: Client,
  environment?: Environment,
  context?: ErrorContextData,
  options: { debugMode?: boolean } = { debugMode: false },
): void {
  // Check deduplication
  if (wasRecentlyReported(error)) {
    if (options.debugMode) {
      console.log('[RemoteFlows] Skipping duplicate error report');
    }
    return;
  }

  const payload = buildErrorPayload(error, sdkVersion, environment ?? 'production', context);

  // Check if should report
  if (shouldReportError(error, payload)) {
    // Log in debug mode
    if (options.debugMode) {
      logDebugPayload(payload, Boolean(options.debugMode));
    }

    try {
      postReportErrorsTelemetry({ client, body: payload }).catch((err) => {
        // Silently fail - don't crash if telemetry reporting fails
        if (options.debugMode) {
          console.warn('[RemoteFlows] Failed to report error telemetry:', err);
        }
      });
    } catch (err) {
      // Silently fail
      if (options.debugMode) {
        console.warn('[RemoteFlows] Error telemetry setup failed:', err);
      }
    }
  }
}
```

**Deduplication:**

Uses a `Map<errorSignature, timestamp>` to prevent duplicate reports within 100ms (catches React Strict Mode double-invokes).

```typescript
const recentlyReported = new Map<string, number>();
const DEDUPE_WINDOW_MS = 100; // 100ms catches Strict Mode double-invokes

function getErrorSignature(error: Error): string {
  return `${error.name}:${error.message}:${error.stack?.substring(0, 100) || ''}`;
}

function wasRecentlyReported(error: Error): boolean {
  const signature = getErrorSignature(error);
  const lastReported = recentlyReported.get(signature);
  const now = Date.now();

  if (lastReported && now - lastReported < DEDUPE_WINDOW_MS) {
    return true;
  }

  recentlyReported.set(signature, now);

  // Cleanup old entries periodically
  if (recentlyReported.size > 100) {
    for (const [sig, timestamp] of recentlyReported.entries()) {
      if (now - timestamp > DEDUPE_WINDOW_MS) {
        recentlyReported.delete(sig);
      }
    }
  }

  return false;
}
```

### 4. Error Classification

**File:** `src/components/error-handling/utils.ts`

#### Error Categories

```typescript
type ErrorCategory =
  | 'RENDER_ERROR'      // React rendering errors
  | 'NETWORK_ERROR'     // API calls, fetch failures
  | 'VALIDATION_ERROR'  // Form/data validation
  | 'STATE_ERROR'       // State management issues
  | 'HOOK_ERROR'        // React hooks violations
  | 'RUNTIME_ERROR'     // General runtime errors
  | 'UNKNOWN_ERROR';    // Uncategorized
```

#### Error Severity

```typescript
type ErrorSeverity =
  | 'critical'  // App-breaking (white screen)
  | 'error'     // Feature-breaking (form can't submit)
  | 'warning'   // Non-blocking (optional feature failed)
  | 'info';     // Informational (deprecated API usage)
```

#### Pattern Matching

Errors are categorized using pattern matching on error messages and names:

```typescript
const ERROR_PATTERNS: readonly ErrorPattern[] = [
  // Priority 1: React rendering errors (most critical)
  {
    category: 'RENDER_ERROR',
    severity: 'critical',
    messagePatterns: ['element type is invalid', 'hydration', 'rendered more hooks'],
    namePatterns: ['invariantviolation'],
  },
  // Priority 2: Hook errors (critical React violations)
  {
    category: 'HOOK_ERROR',
    severity: 'critical',
    messagePatterns: ['hook', 'useeffect', 'usestate', 'usecontext'],
    namePatterns: [],
  },
  // Priority 3: Network errors
  {
    category: 'NETWORK_ERROR',
    severity: 'error',
    messagePatterns: ['fetch', 'network', 'http', 'timeout'],
    namePatterns: ['networkerror'],
  },
  // ... more patterns
];
```

**Priority order matters** - first match wins.

**Override Patterns:**

```typescript
const CRITICAL_MESSAGE_PATTERNS = [
  'cannot read property',
  'is not a function',
  'is not defined',
];

const WARNING_MESSAGE_PATTERNS = ['warning', 'deprecated'];
```

#### Component Stack Parsing

Extracts React component names from stack traces:

```typescript
export const parseComponentStack = (
  error: Error,
  stack?: string,
): string[] | undefined => {
  if (!stack) return undefined;

  const componentStack: string[] = [];
  const lines = stack.split('\n');

  // Check error message for component names
  // Example: "Check the render method of `FieldSetField`."
  const messageComponentMatch = error.message.match(/`([A-Z][a-zA-Z0-9_]*)`/);
  if (messageComponentMatch?.[1]) {
    componentStack.push(messageComponentMatch[1]);
  }

  // Parse stack trace lines
  for (const line of lines) {
    // Match patterns like:
    // - "at ComponentName (http://..."
    // - "ComponentName@http://..."
    const atMatch = line.match(/at\s+([A-Z][a-zA-Z0-9_]*)/);
    const symbolMatch = line.match(/([A-Z][a-zA-Z0-9_]*)@/);

    const componentName = atMatch?.[1] || symbolMatch?.[1];

    if (componentName && !componentStack.includes(componentName)) {
      // Filter out React internals and JS built-ins
      if (!FILTERED_COMPONENT_NAMES.includes(componentName)) {
        componentStack.push(componentName);
      }
    }
  }

  return componentStack.length > 0 ? componentStack : undefined;
};
```

Filters out React internals (`Fragment`, `StrictMode`, `Suspense`, etc.) and JS built-ins (`Function`, `Object`, `Array`, etc.).

### 5. Unhandled Error Reporting

**File:** `src/components/error-handling/useErrorReportingForUnhandledErrors.tsx`

**Purpose:** Captures errors not caught by error boundaries.

**Listeners:**
- `window.addEventListener('error')` - Runtime JavaScript errors
- `window.addEventListener('unhandledrejection')` - Promise rejections

**Implementation:**

```typescript
export function useErrorReportingForUnhandledErrors(
  errorContext: ErrorContextData,
  environment: Environment,
  client: Client,
  debug: boolean,
) {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Skip if already handled by error boundary
      if (event.error && handledErrors.has(event.error)) {
        if (debug) {
          console.log('[RemoteFlows] Skipping already-handled error from window listener');
        }
        return;
      }
      
      reportTelemetryError(
        event.error,
        npmPackageVersion,
        client,
        environment,
        errorContext,
        { debugMode: debug }
      );
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));

      reportTelemetryError(
        error,
        npmPackageVersion,
        client,
        environment,
        errorContext,
        { debugMode: debug }
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [errorContext, environment, client, debug]);
}
```

**Deduplication with Error Boundary:**

Uses a `WeakSet<Error>` to track errors already handled by error boundaries, preventing duplicate reports.

```typescript
// Module-scope WeakSet shared across all hook instances
const handledErrors = new WeakSet<Error>();

// Error boundary marks errors as handled
export function markErrorAsHandled(error: Error): void {
  handledErrors.add(error);
}

// Window listener checks before reporting
if (event.error && handledErrors.has(event.error)) {
  return; // Skip already-handled error
}
```

### 6. React Query Integration

**File:** `src/queryConfig.ts`

**Purpose:** Reports errors from TanStack Query operations.

**Implementation:**

```typescript
export const getQueryClient = (
  debug: boolean,
  client: Client,
  environment?: Environment,
) =>
  new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (error instanceof Error) {
          reportTelemetryError(
            error,
            npmPackageVersion,
            client,
            environment,
            {
              ...globalErrorContextRef.current,
              metadata: {
                ...globalErrorContextRef.current.metadata,
                queryKey: JSON.stringify(query.queryKey),
              },
            },
            { debugMode: debug }
          );
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (error instanceof Error) {
          reportTelemetryError(
            error,
            npmPackageVersion,
            client,
            environment,
            {
              ...globalErrorContextRef.current,
              metadata: {
                ...globalErrorContextRef.current.metadata,
                mutationKey: JSON.stringify(mutation.options.mutationKey),
              },
            },
            { debugMode: debug }
          );
        }
      },
    }),
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (client errors)
          if (error instanceof Error) {
            const message = error.message.toLowerCase();
            if (
              message.includes('400') ||
              message.includes('401') ||
              message.includes('403') ||
              message.includes('404')
            ) {
              return false;
            }
          }
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
      },
    },
  });
```

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
    message: string;               // Error message
    stack?: string;                // Stack trace
    name: string;                  // Error name (TypeError, etc.)
    category: ErrorCategory;       // Classified category
    severity: ErrorSeverity;       // Classified severity
    component_stack?: string[];    // React component hierarchy
  };
  context?: {
    flow?: string;                 // Current flow
    step?: string;                 // Current step
    metadata?: {
      employmentId?: string;       // Business context
      queryKey?: string;           // React Query context
      mutationKey?: string;        // React Query context
      [key: string]: unknown;
    };
  };
  metadata: {
    sdk_version: string;           // RemoteFlows version
    timestamp: string;             // ISO 8601 timestamp
    url: string;                   // Current page URL
    user_agent: string;            // Browser user agent
    environment: Environment;      // SDK environment
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
  environment="production"  // or "sandbox", "staging"
  debug={false}             // Enable verbose logging
  errorBoundary={{
    useParentErrorBoundary: true,  // Rethrow to parent
    fallback: <CustomErrorUI />    // Custom fallback UI
  }}
>
  {/* flows */}
</RemoteFlows>
```

### Error Boundary Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `useParentErrorBoundary` | `boolean` | `false` | If `true`, rethrows errors to parent boundary. If `false`, shows fallback UI. |
| `fallback` | `ReactNode \| ((error: Error) => ReactNode)` | `<FallbackErrorBoundary />` | Custom UI to show when error occurs. Can be static or function. |

**Default Fallback UI:**

```tsx
<div style={{
  padding: '20px',
  border: '1px solid #dc2626',
  borderRadius: '4px',
  backgroundColor: '#fef2f2',
  color: '#991b1b',
}}>
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
  metadata: { /* relevant business context */ },
});

// Update on step changes
useEffect(() => {
  updateErrorContext({ step: currentStep });
}, [currentStep]);
```

### 2. Test with Debug Mode

Always test error scenarios with `debug: true` to verify:
- Error context is correct
- Categorization makes sense
- Payload structure is valid

### 3. Custom Fallback UI

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

### 4. Monitor Telemetry Data

Use telemetry data to:
- Identify critical errors affecting users
- Track error frequency by flow/step
- Prioritize fixes based on severity and impact
- Detect patterns in component stack traces

### 5. Handle Errors Gracefully

For errors in event handlers or async code (not caught by error boundaries):

```typescript
try {
  await someAsyncOperation();
} catch (error) {
  // Let window listener handle it automatically
  throw error;
  
  // Or report manually with context:
  reportTelemetryError(
    error,
    npmPackageVersion,
    client,
    environment,
    { flow: 'myFlow', step: 'myStep' },
    { debugMode: debug }
  );
}
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
    </RemoteFlows>
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

### Testing Error Context

```tsx
import { renderHook } from '@testing-library/react';
import { useErrorReporting } from '@remoteoss/remote-flows/internals';

it('should include flow context in error reports', () => {
  const { result } = renderHook(() =>
    useErrorReporting({
      flow: 'onboarding',
      metadata: { employmentId: 'emp_123' },
    })
  );
  
  result.current.updateErrorContext({ step: 'basic_information' });
  
  // Trigger error...
  
  expect(mockTelemetryAPI).toHaveBeenCalledWith({
    body: {
      context: {
        flow: 'onboarding',
        step: 'basic_information',
        metadata: { employmentId: 'emp_123' },
      },
    },
  });
});
```

### Testing Error Classification

```tsx
import { categorizeError, determineErrorSeverity } from '@remoteoss/remote-flows/internals';

it('should categorize network errors correctly', () => {
  const error = new Error('Network request failed: 500 Internal Server Error');
  const category = categorizeError(error);
  const severity = determineErrorSeverity(error, category);
  
  expect(category).toBe('NETWORK_ERROR');
  expect(severity).toBe('error');
});

it('should categorize render errors as critical', () => {
  const error = new Error('Element type is invalid');
  const category = categorizeError(error);
  const severity = determineErrorSeverity(error, category);
  
  expect(category).toBe('RENDER_ERROR');
  expect(severity).toBe('critical');
});
```

## Troubleshooting

### Errors Not Being Reported

**Check:**
1. Is `auth` function working? (Telemetry requires authentication)
2. Is the error filtered? (e.g., 404 errors are not reported)
3. Is deduplication catching it? (100ms window)
4. Enable `debug: true` to see console logs
5. Check browser console for `[RemoteFlows]` messages

**Common causes:**
- 404 errors are intentionally filtered
- Error occurred within deduplication window
- Authentication token expired
- Network connectivity issues

### Duplicate Error Reports

**Solutions:**
- System already deduplicates within 100ms window
- Check for multiple error boundaries or listeners
- Verify error boundary marks errors with `markErrorAsHandled()`
- Review error signature generation logic

### Missing Context

**Solutions:**
- Ensure `useErrorReporting()` is called at flow level
- Verify `updateErrorContext()` is called on step changes
- Check `globalErrorContextRef` is synchronized
- Confirm ErrorContextProvider wraps all flows

### Error Boundary Not Catching Errors

**Check:**
- Error must be thrown during render (not in event handlers)
- Error boundaries don't catch:
  - Async errors (use try/catch or window listener)
  - Event handler errors (use try/catch or window listener)
  - Server-side errors
  - Errors in error boundary itself
- Use `useErrorReportingForUnhandledErrors` for async/event errors

### Network Errors Not Reported

**Check:**
- Error message format matches patterns
- Status code is reportable (5xx, 401, 403, 429, timeout)
- 404 and 400 errors are intentionally filtered
- React Query retry logic may delay error reporting

## Performance Considerations

### Minimal Overhead

- Error context uses React Context with memoization
- Deduplication uses efficient Map with periodic cleanup
- Telemetry API calls are non-blocking (fire-and-forget)
- Stack trace parsing only happens on errors
- Component stack parsing is optimized with early returns

### Memory Management

**Deduplication Map:**
- Auto-cleans entries older than 100ms
- Keeps maximum 100 entries in memory
- Periodic cleanup runs when map size exceeds 100

**Handled Errors WeakSet:**
- Auto-garbage-collects when errors are no longer referenced
- No manual cleanup needed
- Minimal memory footprint

### Network Impact

- Single POST request per unique error
- Payload size typically < 5KB
- Failed telemetry calls don't retry (fail silently)
- No impact on user-facing functionality

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
- [TanStack Query Error Handling](https://tanstack.com/query/latest/docs/react/guides/query-cancellation)
- [OpenAPI Schema](../openapi-ts.config.ts)

