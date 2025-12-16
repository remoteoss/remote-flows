import {
  ErrorCategory,
  ErrorSeverity,
} from '@/src/components/error-handling/types';

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
