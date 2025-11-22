import {
  parseComponentStack,
  categorizeError,
  determineErrorSeverity,
} from '@/src/components/error-handling/utils';

describe('Error Handling Utils', () => {
  describe('parseComponentStack', () => {
    it('should return undefined when no stack is provided', () => {
      const error = new Error('Test error');
      const result = parseComponentStack(error);

      expect(result).toBeUndefined();
    });

    it('should extract component name from error message', () => {
      const error = new Error('Check the render method of `MyComponent`.');
      const stack =
        'Error: Something\n  at MyComponent (http://localhost:3000)';

      const result = parseComponentStack(error, stack);

      expect(result).toContain('MyComponent');
    });

    it('should extract component names from stack trace with at pattern', () => {
      const error = new Error('Test error');
      const stack = `Error: Test
        at ComponentA (http://localhost:3000/app.js:10:15)
        at ComponentB.render (http://localhost:3000/app.js:20:15)
        at ComponentC (http://localhost:3000/app.js:30:15)`;

      const result = parseComponentStack(error, stack);

      expect(result).toEqual(['ComponentA', 'ComponentB', 'ComponentC']);
    });

    it('should extract component names from stack trace with symbol pattern', () => {
      const error = new Error('Test error');
      const stack = `ComponentA@http://localhost:3000/app.js:10:15
        ComponentB@http://localhost:3000/app.js:20:15`;

      const result = parseComponentStack(error, stack);

      expect(result).toEqual(['ComponentA', 'ComponentB']);
    });

    it('should filter out React internal component names', () => {
      const error = new Error('Test error');
      const stack = `Error: Test
        at Fragment (http://localhost:3000/app.js:10:15)
        at MyComponent (http://localhost:3000/app.js:20:15)
        at ErrorBoundary (http://localhost:3000/app.js:30:15)
        at Suspense (http://localhost:3000/app.js:40:15)
        at AnotherComponent (http://localhost:3000/app.js:50:15)`;

      const result = parseComponentStack(error, stack);

      expect(result).toEqual(['MyComponent', 'AnotherComponent']);
      expect(result).not.toContain('Fragment');
      expect(result).not.toContain('ErrorBoundary');
      expect(result).not.toContain('Suspense');
    });

    it('should not include duplicate component names', () => {
      const error = new Error('Test error');
      const stack = `Error: Test
        at MyComponent (http://localhost:3000/app.js:10:15)
        at MyComponent (http://localhost:3000/app.js:20:15)
        at OtherComponent (http://localhost:3000/app.js:30:15)`;

      const result = parseComponentStack(error, stack);

      expect(result).toEqual(['MyComponent', 'OtherComponent']);
    });

    it('should return undefined when no components are found', () => {
      const error = new Error('Test error');
      const stack = `Error: Test
        at Function (http://localhost:3000/app.js:10:15)
        at Object (http://localhost:3000/app.js:20:15)`;

      const result = parseComponentStack(error, stack);

      expect(result).toBeUndefined();
    });

    it('should handle lowercase component names (should not match)', () => {
      const error = new Error('Test error');
      const stack = `Error: Test
        at mycomponent (http://localhost:3000/app.js:10:15)
        at MyComponent (http://localhost:3000/app.js:20:15)`;

      const result = parseComponentStack(error, stack);

      expect(result).toEqual(['MyComponent']);
    });
  });

  describe('categorizeError', () => {
    it('should categorize render errors', () => {
      expect(categorizeError(new Error('element type is invalid'))).toBe(
        'RENDER_ERROR',
      );
      expect(categorizeError(new Error('Error rendering component'))).toBe(
        'RENDER_ERROR',
      );
      expect(categorizeError(new Error('Hydration failed'))).toBe(
        'RENDER_ERROR',
      );
    });

    it('should categorize network errors', () => {
      expect(categorizeError(new Error('Failed to fetch'))).toBe(
        'NETWORK_ERROR',
      );
      expect(categorizeError(new Error('Network error'))).toBe('NETWORK_ERROR');
      expect(categorizeError(new Error('HTTP 500 error'))).toBe(
        'NETWORK_ERROR',
      );
      expect(categorizeError(new Error('Request timeout'))).toBe(
        'NETWORK_ERROR',
      );
    });

    it('should categorize validation errors', () => {
      expect(categorizeError(new Error('Validation failed'))).toBe(
        'VALIDATION_ERROR',
      );
      expect(categorizeError(new Error('Invalid email format'))).toBe(
        'VALIDATION_ERROR',
      );
      expect(categorizeError(new Error('Field is required'))).toBe(
        'VALIDATION_ERROR',
      );
    });

    it('should categorize hook errors', () => {
      expect(categorizeError(new Error('Invalid hook call'))).toBe(
        'HOOK_ERROR',
      );
      expect(categorizeError(new Error('useEffect error'))).toBe('HOOK_ERROR');
      expect(
        categorizeError(
          new Error('Rendered more hooks than in the previous render'),
        ),
      ).toBe('HOOK_ERROR');
      expect(
        categorizeError(new Error('Rendered fewer hooks than expected')),
      ).toBe('HOOK_ERROR');
    });

    it('should categorize state errors', () => {
      expect(categorizeError(new Error('State update error'))).toBe(
        'STATE_ERROR',
      );
      expect(categorizeError(new Error('Context not found'))).toBe(
        'STATE_ERROR',
      );
      expect(categorizeError(new Error('Provider missing'))).toBe(
        'STATE_ERROR',
      );
    });

    it('should categorize runtime errors by name', () => {
      const typeError = new TypeError('Cannot read property');
      expect(categorizeError(typeError)).toBe('RUNTIME_ERROR');

      const refError = new ReferenceError('undefined is not defined');
      expect(categorizeError(refError)).toBe('RUNTIME_ERROR');

      const rangeError = new RangeError('Invalid range');
      expect(categorizeError(rangeError)).toBe('RUNTIME_ERROR');
    });

    it('should return UNKNOWN_ERROR for unmatched errors', () => {
      expect(categorizeError(new Error('Some random error'))).toBe(
        'UNKNOWN_ERROR',
      );
      expect(categorizeError(new Error(''))).toBe('UNKNOWN_ERROR');
    });

    it('should be case insensitive', () => {
      expect(categorizeError(new Error('VALIDATION ERROR'))).toBe(
        'VALIDATION_ERROR',
      );
      expect(categorizeError(new Error('FeTcH fAiLeD'))).toBe('NETWORK_ERROR');
    });
  });

  describe('determineErrorSeverity', () => {
    it('should return critical for render errors', () => {
      const renderError = new Error('element type is invalid');
      expect(determineErrorSeverity(renderError, 'RENDER_ERROR')).toBe(
        'critical',
      );
    });

    it('should return critical for hydration errors', () => {
      const hydrationError = new Error('hydration mismatch');
      expect(determineErrorSeverity(hydrationError, 'RENDER_ERROR')).toBe(
        'critical',
      );
    });

    it('should return critical for property read errors', () => {
      const propertyError = new Error('cannot read property of undefined');
      expect(determineErrorSeverity(propertyError, 'RUNTIME_ERROR')).toBe(
        'critical',
      );
    });

    it('should return critical for "is not a function" errors', () => {
      const funcError = new Error('x is not a function');
      expect(determineErrorSeverity(funcError, 'RUNTIME_ERROR')).toBe(
        'critical',
      );
    });

    it('should return critical for hook errors', () => {
      const hookError = new Error('Invalid hook call');
      expect(determineErrorSeverity(hookError, 'HOOK_ERROR')).toBe('critical');
    });

    it('should return error for network errors', () => {
      const networkError = new Error('Failed to fetch');
      expect(determineErrorSeverity(networkError, 'NETWORK_ERROR')).toBe(
        'error',
      );
    });

    it('should return error for validation errors', () => {
      const validationError = new Error('Validation failed');
      expect(determineErrorSeverity(validationError, 'VALIDATION_ERROR')).toBe(
        'error',
      );
    });

    it('should return error for state errors', () => {
      const stateError = new Error('State update failed');
      expect(determineErrorSeverity(stateError, 'STATE_ERROR')).toBe('error');
    });

    it('should return error for unknown errors', () => {
      const unknownError = new Error('Something went wrong');
      expect(determineErrorSeverity(unknownError, 'UNKNOWN_ERROR')).toBe(
        'error',
      );
    });

    it('should prioritize error message over category for render errors', () => {
      const error = new Error('Normal error');
      expect(determineErrorSeverity(error, 'RENDER_ERROR')).toBe('critical');
    });
  });
});
