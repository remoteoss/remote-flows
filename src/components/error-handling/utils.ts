import {
  ErrorCategory,
  ErrorSeverity,
} from '@/src/components/error-handling/types';

/**
 * Component names to filter out from stack traces
 * Includes React internals and JavaScript built-ins
 */
const FILTERED_COMPONENT_NAMES = [
  // React internals
  'Fragment',
  'StrictMode',
  'Suspense',
  'ErrorBoundary',
  'Profiler',
  // JavaScript built-ins
  'Function',
  'Object',
  'Array',
  'String',
  'Number',
  'Boolean',
] as const;

/**
 * Parses React component stack from error stack trace or error message
 * Extracts component names from stack trace lines and error messages
 */
export const parseComponentStack = (
  error: Error,
  stack?: string,
): string[] | undefined => {
  if (!stack) return undefined;

  const componentStack: string[] = [];
  const lines = stack.split('\n');

  // First, check if the error message mentions a component
  // Example: "Check the render method of `FieldSetField`."
  const messageComponentMatch = error.message.match(/`([A-Z][a-zA-Z0-9_]*)`/);
  if (messageComponentMatch?.[1]) {
    componentStack.push(messageComponentMatch[1]);
  }

  // Then parse stack trace for component names
  for (const line of lines) {
    // Match React component patterns in stack traces
    // Examples:
    // - "at ComponentName (http://..."
    // - "at ComponentName.render (http://..."
    // - "ComponentName@http://..."
    const atMatch = line.match(/at\s+([A-Z][a-zA-Z0-9_]*)/);
    const symbolMatch = line.match(/([A-Z][a-zA-Z0-9_]*)@/);

    const componentName = atMatch?.[1] || symbolMatch?.[1];

    if (componentName && !componentStack.includes(componentName)) {
      // Filter out React internal and JS built-in names
      if (
        !FILTERED_COMPONENT_NAMES.includes(
          componentName as (typeof FILTERED_COMPONENT_NAMES)[number],
        )
      ) {
        componentStack.push(componentName);
      }
    }
  }

  return componentStack.length > 0 ? componentStack : undefined;
};

/**
 * Error pattern matching configuration
 * Patterns are checked in order - first match wins
 */
type ErrorPattern = {
  category: ErrorCategory;
  severity: ErrorSeverity;
  messagePatterns: string[];
  namePatterns: string[];
};

/**
 * Configuration for error categorization and severity determination
 * Order matters - patterns are checked from top to bottom
 */
const ERROR_PATTERNS: readonly ErrorPattern[] = [
  // Priority 1: React rendering errors (most critical)
  {
    category: 'RENDER_ERROR',
    severity: 'critical',
    messagePatterns: [
      'element type is invalid',
      'hydration',
      'rendered more hooks',
      'rendered fewer hooks',
    ],
    namePatterns: ['invariantviolation'],
  },

  // Priority 2: Hook errors (critical React violations)
  {
    category: 'HOOK_ERROR',
    severity: 'critical',
    messagePatterns: ['hook', 'useeffect', 'usestate', 'usecontext'],
    namePatterns: [],
  },

  // Priority 4: State errors (must come before render to avoid "render" keyword collision)
  {
    category: 'STATE_ERROR',
    severity: 'error',
    messagePatterns: ['state', 'context', 'provider'],
    namePatterns: [],
  },

  // Priority 6: Lower priority render errors
  {
    category: 'RENDER_ERROR',
    severity: 'critical',
    messagePatterns: ['render', 'component'],
    namePatterns: [],
  },

  // Priority 7: Runtime errors (critical TypeErrors and ReferenceErrors)
  {
    category: 'RUNTIME_ERROR',
    severity: 'critical',
    messagePatterns: [],
    namePatterns: ['typeerror', 'referenceerror'],
  },

  // Priority 8: Range errors (non-critical runtime errors)
  {
    category: 'RUNTIME_ERROR',
    severity: 'error',
    messagePatterns: [],
    namePatterns: ['rangeerror'],
  },
] as const;

/**
 * Additional severity patterns that override category-based severity
 */
const CRITICAL_MESSAGE_PATTERNS = [
  'cannot read property',
  'is not a function',
  'is not defined',
] as const;

const WARNING_MESSAGE_PATTERNS = ['warning', 'deprecated'] as const;

/**
 * Categorizes error based on error message and name using pattern matching
 */
export const categorizeError = (error: Error): ErrorCategory => {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  // Early return for warnings to prevent categorization as other error types
  if (WARNING_MESSAGE_PATTERNS.some((p) => message.includes(p))) {
    return 'UNKNOWN_ERROR';
  }

  // Check each pattern in priority order
  for (const pattern of ERROR_PATTERNS) {
    const matchesMessage = pattern.messagePatterns.some((p) =>
      message.includes(p),
    );
    const matchesName = pattern.namePatterns.some((p) => name.includes(p));

    if (matchesMessage || matchesName) {
      return pattern.category;
    }
  }

  return 'UNKNOWN_ERROR';
};

/**
 * Determines error severity based on category and message patterns
 */
export const determineErrorSeverity = (
  error: Error,
  category: ErrorCategory,
): ErrorSeverity => {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  // Check for warning patterns first
  if (WARNING_MESSAGE_PATTERNS.some((p) => message.includes(p))) {
    return 'warning';
  }

  // Check for critical message patterns that override category
  if (CRITICAL_MESSAGE_PATTERNS.some((p) => message.includes(p))) {
    return 'critical';
  }

  // Find the exact pattern that matched this error
  // We need to re-match to get the correct severity for errors with multiple patterns
  for (const pattern of ERROR_PATTERNS) {
    if (pattern.category !== category) continue;

    const matchesMessage = pattern.messagePatterns.some((p) =>
      message.includes(p),
    );
    const matchesName = pattern.namePatterns.some((p) => name.includes(p));

    if (matchesMessage || matchesName) {
      return pattern.severity;
    }
  }

  // Default to error for unknown categories
  return 'error';
};
