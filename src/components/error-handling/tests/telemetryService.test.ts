import {
  buildErrorPayload,
  shouldReportError,
} from '@/src/components/error-handling/telemetryService';
import * as utils from '@/src/components/error-handling/utils';

// Mock the utility functions
vi.mock('@/src/components/error-handling/utils', () => ({
  categorizeError: vi.fn(),
  determineErrorSeverity: vi.fn(),
  parseComponentStack: vi.fn(),
}));

describe('telemetryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    expect(payload.metadata.url).toBe(window.location.href);
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
});
