import type { Environment } from '@/src/environments';

/**
 * Error context - basic flow/step information
 */
export type ErrorContextData = {
  flow?: string;
  step?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Error category types
 */
export type ErrorCategory =
  | 'RENDER_ERROR' // React rendering errors (invalid components, hydration, etc.)
  | 'STATE_ERROR' // State management issues
  | 'HOOK_ERROR' // React hooks errors (rules of hooks violations)
  | 'RUNTIME_ERROR' // General runtime errors
  | 'UNKNOWN_ERROR'; // Uncategorized errors

/**
 * Error severity levels
 */
export type ErrorSeverity =
  | 'critical' // App-breaking errors (white screen, cannot continue)
  | 'error' // Feature-breaking errors (form cannot submit, page cannot load)
  | 'warning' // Non-blocking errors (optional feature failed)
  | 'info'; // Informational (deprecated API usage, etc.)

/**
 * Error payload that would be sent to telemetry API
 */
export type ErrorPayload = {
  error: {
    message: string;
    stack?: string;
    name: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    component_stack?: string[]; // Parsed React component names from stack trace
  };
  context?: ErrorContextData;
  metadata: {
    sdk_version: string;
    timestamp: string;
    url: string;
    user_agent: string;
    environment: Environment;
  };
};
