import {
  buildErrorPayload,
  reportTelemetryError,
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

  it('should deduplicate rapid duplicate calls', () => {
    // Unique error message for this test
    const error = new Error('Deduplication test error 1');
    const mockClient = {} as $TSFixMe;

    vi.mocked(utils.categorizeError).mockReturnValue('RENDER_ERROR');
    vi.mocked(utils.determineErrorSeverity).mockReturnValue('error');

    reportTelemetryError(
      {
        error,
        sdkVersion: '1.0.0',
        client: mockClient,
        environment: 'production',
      },
      undefined,
      {
        debugMode: false,
      },
    );
    reportTelemetryError(
      {
        error,
        sdkVersion: '1.0.0',
        client: mockClient,
        environment: 'production',
      },
      undefined,
      {
        debugMode: false,
      },
    );

    expect(postReportErrorsTelemetry).toHaveBeenCalledTimes(1);
  });

  it('should report again after deduplication window expires', () => {
    // Different unique error message
    const error = new Error('Deduplication test error 2');
    const mockClient = {} as $TSFixMe;

    vi.mocked(utils.categorizeError).mockReturnValue('RENDER_ERROR');
    vi.mocked(utils.determineErrorSeverity).mockReturnValue('error');

    reportTelemetryError(
      {
        error,
        sdkVersion: '1.0.0',
        client: mockClient,
        environment: 'production',
      },
      undefined,
      {
        debugMode: false,
      },
    );
    expect(postReportErrorsTelemetry).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(150);

    reportTelemetryError(
      {
        error,
        sdkVersion: '1.0.0',
        client: mockClient,
        environment: 'production',
      },
      undefined,
      {
        debugMode: false,
      },
    );
    expect(postReportErrorsTelemetry).toHaveBeenCalledTimes(2);
  });
});
