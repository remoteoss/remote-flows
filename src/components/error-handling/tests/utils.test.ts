import {
  categorizeError,
  determineErrorSeverity,
} from '@/src/components/error-handling/utils';
import {
  ErrorCategory,
  ErrorSeverity,
} from '@/src/components/error-handling/types';

/**
 * Test case definitions for data-driven testing
 */
type ErrorTestCase = {
  description: string;
  error: Error;
  expectedCategory: ErrorCategory;
  expectedSeverity: ErrorSeverity;
};

/**
 * Comprehensive test matrix for error categorization and severity
 * Covers all major error types and edge cases
 */
const ERROR_TEST_CASES: ErrorTestCase[] = [
  // Render errors (Priority 1)
  {
    description: 'invalid element type',
    error: new Error('Element type is invalid: expected a string'),
    expectedCategory: 'RENDER_ERROR',
    expectedSeverity: 'critical',
  },
  {
    description: 'hydration error',
    error: new Error('Hydration failed because the server rendered HTML'),
    expectedCategory: 'RENDER_ERROR',
    expectedSeverity: 'critical',
  },
  {
    description: 'rendered more hooks',
    error: new Error('Rendered more hooks than during the previous render'),
    expectedCategory: 'RENDER_ERROR',
    expectedSeverity: 'critical',
  },
  {
    description: 'rendered fewer hooks',
    error: new Error('Rendered fewer hooks than expected'),
    expectedCategory: 'RENDER_ERROR',
    expectedSeverity: 'critical',
  },

  // Hook errors (Priority 2)
  {
    description: 'invalid hook call',
    error: new Error('Invalid hook call. Hooks can only be called inside'),
    expectedCategory: 'HOOK_ERROR',
    expectedSeverity: 'critical',
  },
  {
    description: 'useEffect error',
    error: new Error('useEffect cleanup function must return undefined'),
    expectedCategory: 'HOOK_ERROR',
    expectedSeverity: 'critical',
  },
  {
    description: 'useState error',
    error: new Error('useState can only be called in function components'),
    expectedCategory: 'HOOK_ERROR',
    expectedSeverity: 'critical',
  },
  {
    description: 'useContext error',
    error: new Error('useContext must be called within a provider'),
    expectedCategory: 'HOOK_ERROR',
    expectedSeverity: 'critical',
  },

  // State errors (Priority 4)
  {
    description: 'state update error',
    error: new Error('Cannot update state during render'),
    expectedCategory: 'STATE_ERROR',
    expectedSeverity: 'error',
  },
  {
    description: 'context not found',
    error: new Error('Context value not found'),
    expectedCategory: 'STATE_ERROR',
    expectedSeverity: 'error',
  },
  {
    description: 'provider missing',
    error: new Error('Provider is missing for this context'),
    expectedCategory: 'STATE_ERROR',
    expectedSeverity: 'error',
  },

  // Runtime errors (Priority 6)
  {
    description: 'TypeError',
    error: new TypeError('Cannot read properties of undefined'),
    expectedCategory: 'RUNTIME_ERROR',
    expectedSeverity: 'critical',
  },
  {
    description: 'ReferenceError',
    error: new ReferenceError('x is not defined'),
    expectedCategory: 'RUNTIME_ERROR',
    expectedSeverity: 'critical',
  },
  {
    description: 'RangeError',
    error: new RangeError('Maximum call stack size exceeded'),
    expectedCategory: 'RUNTIME_ERROR',
    expectedSeverity: 'error',
  },

  // Edge cases - Priority testing
  {
    description: 'hook error with "invalid" keyword',
    error: new Error('Invalid hook call detected'),
    expectedCategory: 'HOOK_ERROR',
    expectedSeverity: 'critical',
  },

  // Critical severity by message pattern
  {
    description: 'cannot read property error',
    error: new Error('Cannot read property "foo" of null'),
    expectedCategory: 'UNKNOWN_ERROR',
    expectedSeverity: 'critical',
  },
  {
    description: 'is not a function error',
    error: new Error('myFunc is not a function'),
    expectedCategory: 'UNKNOWN_ERROR',
    expectedSeverity: 'critical',
  },
  {
    description: 'is not defined error',
    error: new Error('myVar is not defined'),
    expectedCategory: 'UNKNOWN_ERROR',
    expectedSeverity: 'critical',
  },

  // Warning severity
  {
    description: 'deprecated API warning',
    error: new Error('Warning: componentWillMount is deprecated'),
    expectedCategory: 'UNKNOWN_ERROR',
    expectedSeverity: 'warning',
  },

  // Unknown errors
  {
    description: 'unrecognized error',
    error: new Error('Something unexpected happened'),
    expectedCategory: 'UNKNOWN_ERROR',
    expectedSeverity: 'error',
  },
  {
    description: 'empty error message',
    error: new Error(''),
    expectedCategory: 'UNKNOWN_ERROR',
    expectedSeverity: 'error',
  },
];

describe('Error Handling Utils', () => {
  describe('categorizeError and determineErrorSeverity - Comprehensive Test Matrix', () => {
    // Data-driven test that validates all error patterns
    ERROR_TEST_CASES.forEach(
      ({ description, error, expectedCategory, expectedSeverity }) => {
        it(`should correctly categorize and determine severity for: ${description}`, () => {
          const actualCategory = categorizeError(error);
          expect(actualCategory).toBe(expectedCategory);

          const actualSeverity = determineErrorSeverity(error, actualCategory);
          expect(actualSeverity).toBe(expectedSeverity);
        });
      },
    );
  });
});
