import {
  categorizeError,
  determineErrorSeverity,
  parseComponentStack,
} from '@/src/components/error-handling/utils';
import { buildErrorPayload } from '@/src/components/error-handling/telemetryLogger';

/**
 * Edge case and browser-specific error scenarios
 *
 * This test suite focuses on:
 * - Browser-specific error formats (Safari, Firefox, Chrome)
 * - Real production error examples that may not be covered by the comprehensive test matrix
 * - Complex scenarios with multiple error patterns
 * - Performance characteristics
 * - Edge cases around error payload building
 *
 * For standard error categorization and severity tests, see utils.test.ts
 */
describe('Edge Case Error Scenarios', () => {
  describe('Browser-specific error formats', () => {
    it('should handle Safari-specific "null is not an object" error', () => {
      const error = new Error(
        "null is not an object (evaluating 'user.profile')",
      );
      const category = categorizeError(error);
      const severity = determineErrorSeverity(error, category);

      expect(severity).toBe('critical');
    });

    it('should handle Firefox-specific "undefined is not an object" error', () => {
      const error = new Error(
        "undefined is not an object (evaluating 'data.items')",
      );
      const category = categorizeError(error);
      const severity = determineErrorSeverity(error, category);

      expect(severity).toBe('critical');
    });

    it('should handle unhandled promise rejections with critical patterns', () => {
      const error = new Error(
        'Unhandled promise rejection: data.user is not defined',
      );
      const category = categorizeError(error);
      const severity = determineErrorSeverity(error, category);

      expect(severity).toBe('critical');
    });

    it('should handle 404 errors as non-critical network errors', () => {
      const error = new Error('HTTP 404: Resource not found');
      const category = categorizeError(error);
      const severity = determineErrorSeverity(error, category);

      expect(category).toBe('NETWORK_ERROR');
      expect(severity).toBe('error');
    });
  });

  describe('Complex error messages with multiple patterns', () => {
    it('should prioritize most severe pattern when error contains multiple keywords', () => {
      // This error contains "network" (NETWORK_ERROR) and "is not a function" (critical severity)
      const error = new Error('Network handler is not a function');
      const category = categorizeError(error);
      const severity = determineErrorSeverity(error, category);

      // Should categorize as NETWORK_ERROR but still detect critical severity
      expect(category).toBe('NETWORK_ERROR');
      expect(severity).toBe('critical'); // "is not a function" should make it critical
    });

    it('should handle errors with both validation and state keywords', () => {
      const error = new Error('Invalid state update detected');
      const category = categorizeError(error);
      const severity = determineErrorSeverity(error, category);

      // STATE_ERROR has higher priority (4) than VALIDATION_ERROR (5)
      expect(category).toBe('STATE_ERROR');
      expect(severity).toBe('error');
    });
  });

  describe('Null/undefined safety', () => {
    it('should handle errors with no stack trace', () => {
      const error = new Error('Something went wrong');
      error.stack = undefined;

      const category = categorizeError(error);
      const severity = determineErrorSeverity(error, category);
      const componentStack = parseComponentStack(error, error.stack);

      expect(category).toBe('UNKNOWN_ERROR');
      expect(severity).toBe('error');
      expect(componentStack).toBeUndefined();
    });

    it('should handle buildErrorPayload with minimal error', () => {
      const error = new Error('Test');
      const payload = buildErrorPayload(error, '1.0.0');

      expect(payload.error.message).toBe('Test');
      expect(payload.error.category).toBe('UNKNOWN_ERROR');
      expect(payload.error.severity).toBe('error');
      expect(payload.metadata.sdkVersion).toBe('1.0.0');
    });
  });

  describe('Real production error examples', () => {
    it('should handle chunk loading failures', () => {
      const error = new Error('Loading chunk 5 failed');
      const category = categorizeError(error);
      const severity = determineErrorSeverity(error, category);

      // This is an edge case - chunk loading failures are serious but pattern doesn't catch them
      // They would be UNKNOWN_ERROR with 'error' severity
      expect(category).toBe('UNKNOWN_ERROR');
      expect(severity).toBe('error');

      // Note: You might want to add a pattern for chunk loading failures
    });
  });

  describe('Compound errors (error with cause)', () => {
    it('should categorize based on the main error message', () => {
      const error = new Error('Failed to load user data');

      const category = categorizeError(error);
      const severity = determineErrorSeverity(error, category);

      // Categorizes based on main message, not cause
      expect(category).toBe('UNKNOWN_ERROR');
      expect(severity).toBe('error');
    });
  });

  describe('Performance - Pattern matching should be fast', () => {
    it('should categorize 1000 errors in reasonable time', () => {
      const errors = Array.from(
        { length: 1000 },
        (_, i) =>
          new Error(`Test error ${i}: Cannot read property of undefined`),
      );

      const start = performance.now();
      errors.forEach((error) => {
        categorizeError(error);
        determineErrorSeverity(error, 'UNKNOWN_ERROR');
      });
      const end = performance.now();

      const duration = end - start;
      // Should process 1000 errors in under 100ms
      expect(duration).toBeLessThan(100);
    });
  });
});
