import { renderHook, act } from '@testing-library/react';
import { useRouter } from '../router';
import { useSearchParams } from '../useSearchParams';

// Mock window APIs
const mockPushState = vi.fn();
const mockReplaceState = vi.fn();
const mockDispatchEvent = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

// Mock location object
const mockLocation = {
  href: 'https://example.com/test',
  search: '',
  origin: 'https://example.com',
  pathname: '/test',
};

// Setup window mocks
Object.defineProperty(window, 'history', {
  value: {
    pushState: mockPushState,
    replaceState: mockReplaceState,
  },
  configurable: true,
});

Object.defineProperty(window, 'location', {
  value: mockLocation,
  configurable: true,
});

Object.defineProperty(window, 'dispatchEvent', {
  value: mockDispatchEvent,
  configurable: true,
});

Object.defineProperty(window, 'addEventListener', {
  value: mockAddEventListener,
  configurable: true,
});

Object.defineProperty(window, 'removeEventListener', {
  value: mockRemoveEventListener,
  configurable: true,
});

describe('useRouter + useSearchParams integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = 'https://example.com/test';
    mockLocation.search = '';
  });

  it('should synchronize URL state between hooks', () => {
    const { result: routerResult } = renderHook(() => useRouter());
    const { result: searchParamsResult } = renderHook(() => useSearchParams());

    // Router changes URL -> SearchParams should reflect it
    act(() => {
      routerResult.current.setSearchParams({ test: 'value' });
    });

    // Simulate the event dispatch and listener response
    const urlChangedHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === 'urlChanged',
    )?.[1];

    mockLocation.search = '?test=value';
    act(() => urlChangedHandler?.());

    expect(searchParamsResult.current.get('test')).toBe('value');
  });

  it('should handle cross-hook URL navigation', () => {
    const { result: routerResult } = renderHook(() => useRouter());

    // Test that router push triggers searchParams updates
    act(() => {
      routerResult.current.push('https://example.com/new?integrated=true');
    });

    expect(mockPushState).toHaveBeenCalledWith(
      {},
      '',
      'https://example.com/new?integrated=true',
    );
  });
});
