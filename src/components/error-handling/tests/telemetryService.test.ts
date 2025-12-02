import {
  buildErrorPayload,
  reportTelemetryError,
  shouldReportError,
} from '@/src/components/error-handling/telemetryService';
import * as utils from '@/src/components/error-handling/utils';
import { postReportErrorsTelemetry } from '@/src/client/sdk.gen';
import { $TSFixMe } from '@/src/types/remoteFlows';

// Mock the utility functions
vi.mock('@/src/components/error-handling/utils', () => ({
  categorizeError: vi.fn(),
  determineErrorSeverity: vi.fn(),
  parseComponentStack: vi.fn(),
}));

vi.mock('@/src/client/sdk.gen', () => ({
  postReportErrorsTelemetry: vi.fn(() => Promise.resolve()),
}));

describe('telemetryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should build error payload with all required fields', () => {
    const error = new Error('Test error');
    const sdkVersion = '1.0.0';
    const context = { flow: 'test-flow', step: 'basic_info' };

    vi.mocked(utils.categorizeError).mockReturnValue('RENDER_ERROR');
    vi.mocked(utils.determineErrorSeverity).mockReturnValue('error');
    vi.mocked(utils.parseComponentStack).mockReturnValue([
      'Component1',
      'Component2',
    ]);

    const payload = buildErrorPayload(error, sdkVersion, 'production', context);

    expect(payload.error.message).toBe('Test error');
    expect(payload.error.category).toBe('RENDER_ERROR');
    expect(payload.error.severity).toBe('error');
    expect(payload.context).toEqual(context);
    expect(payload.metadata.sdk_version).toBe('1.0.0');
    expect(payload.metadata.timestamp).toBeDefined();
    expect(payload.metadata.url).toBe('https://telemetry.local/report');
    expect(payload.metadata.environment).toBe('production');
  });

  it('should report non-network errors', () => {
    const error = new Error('Render error');

    vi.mocked(utils.categorizeError).mockReturnValue('RENDER_ERROR');
    vi.mocked(utils.determineErrorSeverity).mockReturnValue('error');
    vi.mocked(utils.parseComponentStack).mockReturnValue([]);

    const payload = buildErrorPayload(error, '1.0.0', 'production');

    expect(shouldReportError(error, payload)).toBe(true);
  });

  it('should skip 404 network errors', () => {
    const error = new Error('HTTP 404: Not Found');

    vi.mocked(utils.categorizeError).mockReturnValue('NETWORK_ERROR');
    vi.mocked(utils.determineErrorSeverity).mockReturnValue('error');
    vi.mocked(utils.parseComponentStack).mockReturnValue([]);

    const payload = buildErrorPayload(error, '1.0.0', 'production');

    expect(shouldReportError(error, payload)).toBe(false);
  });

  it('should report server errors', () => {
    const error = new Error('HTTP 500: Internal Server Error');

    vi.mocked(utils.categorizeError).mockReturnValue('NETWORK_ERROR');
    vi.mocked(utils.determineErrorSeverity).mockReturnValue('error');
    vi.mocked(utils.parseComponentStack).mockReturnValue([]);

    const payload = buildErrorPayload(error, '1.0.0', 'production');

    expect(shouldReportError(error, payload)).toBe(true);
  });

  it('should deduplicate rapid duplicate calls', () => {
    // Unique error message for this test
    const error = new Error('Deduplication test error 1');
    const mockClient = {} as $TSFixMe;

    vi.mocked(utils.categorizeError).mockReturnValue('RENDER_ERROR');
    vi.mocked(utils.determineErrorSeverity).mockReturnValue('error');
    vi.mocked(utils.parseComponentStack).mockReturnValue([]);

    reportTelemetryError(error, '1.0.0', mockClient, 'production', undefined, {
      debugMode: false,
    });
    reportTelemetryError(error, '1.0.0', mockClient, 'production', undefined, {
      debugMode: false,
    });

    expect(postReportErrorsTelemetry).toHaveBeenCalledTimes(1);
  });

  it('should report again after deduplication window expires', () => {
    // Different unique error message
    const error = new Error('Deduplication test error 2');
    const mockClient = {} as $TSFixMe;

    vi.mocked(utils.categorizeError).mockReturnValue('RENDER_ERROR');
    vi.mocked(utils.determineErrorSeverity).mockReturnValue('error');
    vi.mocked(utils.parseComponentStack).mockReturnValue([]);

    reportTelemetryError(error, '1.0.0', mockClient, 'production', undefined, {
      debugMode: false,
    });
    expect(postReportErrorsTelemetry).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(150);

    reportTelemetryError(error, '1.0.0', mockClient, 'production', undefined, {
      debugMode: false,
    });
    expect(postReportErrorsTelemetry).toHaveBeenCalledTimes(2);
  });
});
