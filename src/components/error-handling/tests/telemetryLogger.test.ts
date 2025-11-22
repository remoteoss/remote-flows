// src/components/error-handling/tests/telemetryLogger.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildErrorPayload,
  logDebugPayload,
  reportTelemetryError,
} from '@/src/components/error-handling/telemetryLogger';
import * as utils from '@/src/components/error-handling/utils';
import { $TSFixMe } from '@/src/types/remoteFlows';

// Mock the utility functions
vi.mock('@/src/components/error-handling/utils', () => ({
  categorizeError: vi.fn(),
  determineErrorSeverity: vi.fn(),
  parseComponentStack: vi.fn(),
}));

describe('telemetryLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('buildErrorPayload', () => {
    it('should build error payload with categorized error', () => {
      const error = new Error('Test error');
      const sdkVersion = '1.0.0';
      const context = { flow: 'test-flow', step: 'basic_info' };

      vi.mocked(utils.categorizeError).mockReturnValue('RENDER_ERROR');
      vi.mocked(utils.determineErrorSeverity).mockReturnValue('error');
      vi.mocked(utils.parseComponentStack).mockReturnValue([
        'Component1',
        'Component2',
      ]);

      const payload = buildErrorPayload(error, sdkVersion, context);

      expect(payload.error.message).toBe('Test error');
      expect(payload.error.name).toBe('Error');
      expect(payload.error.category).toBe('RENDER_ERROR');
      expect(payload.error.severity).toBe('error');
      expect(payload.error.componentStack).toEqual([
        'Component1',
        'Component2',
      ]);
      expect(payload.context).toEqual(context);
      expect(payload.metadata.sdkVersion).toBe('1.0.0');
    });

    it('should build error payload without context', () => {
      const error = new Error('Another error');
      const sdkVersion = '2.0.0';

      vi.mocked(utils.categorizeError).mockReturnValue('VALIDATION_ERROR');
      vi.mocked(utils.determineErrorSeverity).mockReturnValue('warning');
      vi.mocked(utils.parseComponentStack).mockReturnValue([]);

      const payload = buildErrorPayload(error, sdkVersion);

      expect(payload.context).toBeUndefined();
      expect(payload.error.componentStack).toEqual([]);
      expect(payload.metadata.sdkVersion).toBe('2.0.0');
    });

    it('should include timestamp and url in metadata', () => {
      const error = new Error('Test');

      vi.mocked(utils.categorizeError).mockReturnValue('RUNTIME_ERROR');
      vi.mocked(utils.determineErrorSeverity).mockReturnValue('critical');
      vi.mocked(utils.parseComponentStack).mockReturnValue([]);

      const payload = buildErrorPayload(error, '1.0.0');

      expect(payload.metadata.timestamp).toBeDefined();
      expect(payload.metadata.url).toBe(window.location.href);
      expect(payload.metadata.userAgent).toBe(navigator.userAgent);
    });
  });

  describe('logDebugPayload', () => {
    it('should log to console in debug mode', () => {
      const consoleSpy = vi.spyOn(console, 'group');

      const payload = {
        error: {
          message: 'Test error',
          name: 'Error',
          category: 'runtime_error',
          severity: 'error',
          componentStack: ['Component1'],
          stack: 'Error: Test\n  at test.js:1',
        },
        context: { flow: 'test' },
        metadata: {
          sdkVersion: '1.0.0',
          timestamp: '2025-01-01T00:00:00Z',
          url: 'http://localhost',
          userAgent: 'Test Agent',
        },
      };

      logDebugPayload(payload as $TSFixMe, true);

      expect(consoleSpy).toHaveBeenCalledWith(
        '📮 [RemoteFlows] Error Report (Debug Mode)',
      );
      consoleSpy.mockRestore();
    });

    it('should not log when debug mode is false', () => {
      const consoleSpy = vi.spyOn(console, 'group');

      logDebugPayload({} as $TSFixMe, false);

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('reportTelemetryError', () => {
    it('should call buildErrorPayload and logDebugPayload', () => {
      const error = new Error('Report test');
      const sdkVersion = '1.0.0';
      const context = { flow: 'test' };

      vi.mocked(utils.categorizeError).mockReturnValue('RUNTIME_ERROR');
      vi.mocked(utils.determineErrorSeverity).mockReturnValue('error');
      vi.mocked(utils.parseComponentStack).mockReturnValue([]);

      const consoleSpy = vi.spyOn(console, 'group');

      reportTelemetryError(error, sdkVersion, context, { debugMode: true });

      // Verify buildErrorPayload was called correctly via the error payload structure
      expect(consoleSpy).toHaveBeenCalledWith(
        '📮 [RemoteFlows] Error Report (Debug Mode)',
      );
      consoleSpy.mockRestore();
    });
  });
});
