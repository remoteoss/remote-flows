import { renderHook, act } from '@testing-library/react';
import { useSearchParams } from '../useSearchParams';

// Mock window.location
const mockLocation = {
  search: '?initial=value&test=123',
  href: 'https://example.com/test?initial=value&test=123',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock event listeners
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

Object.defineProperty(window, 'addEventListener', {
  value: mockAddEventListener,
  writable: true,
});

Object.defineProperty(window, 'removeEventListener', {
  value: mockRemoveEventListener,
  writable: true,
});

describe('useSearchParams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset location search for each test
    mockLocation.search = '?initial=value&test=123';
  });

  describe('initialization', () => {
    it('should initialize with current URL search params', () => {
      const { result } = renderHook(() => useSearchParams());

      expect(result.current.get('initial')).toBe('value');
      expect(result.current.get('test')).toBe('123');
    });

    it('should initialize with empty params when no search string', () => {
      mockLocation.search = '';
      const { result } = renderHook(() => useSearchParams());

      expect(result.current.get('any')).toBeNull();
      expect(result.current.toString()).toBe('');
    });

    it('should setup event listeners on mount', () => {
      renderHook(() => useSearchParams());

      expect(mockAddEventListener).toHaveBeenCalledWith(
        'popstate',
        expect.any(Function),
      );
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'urlChanged',
        expect.any(Function),
      );
    });
  });

  describe('cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const { unmount } = renderHook(() => useSearchParams());

      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'popstate',
        expect.any(Function),
      );
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'urlChanged',
        expect.any(Function),
      );
    });
  });

  describe('get method', () => {
    it('should return correct values for existing params', () => {
      const { result } = renderHook(() => useSearchParams());

      expect(result.current.get('initial')).toBe('value');
      expect(result.current.get('test')).toBe('123');
    });

    it('should return null for non-existing params', () => {
      const { result } = renderHook(() => useSearchParams());

      expect(result.current.get('nonexistent')).toBeNull();
    });

    it('should handle URL-encoded values', () => {
      mockLocation.search = '?encoded=hello%20world&special=test%26value';
      const { result } = renderHook(() => useSearchParams());

      expect(result.current.get('encoded')).toBe('hello world');
      expect(result.current.get('special')).toBe('test&value');
    });

    it('should handle empty string values', () => {
      mockLocation.search = '?empty=&hasValue=test';
      const { result } = renderHook(() => useSearchParams());

      expect(result.current.get('empty')).toBe('');
      expect(result.current.get('hasValue')).toBe('test');
    });
  });

  describe('has method', () => {
    it('should return true for existing params', () => {
      const { result } = renderHook(() => useSearchParams());

      expect(result.current.has('initial')).toBe(true);
      expect(result.current.has('test')).toBe(true);
    });

    it('should return false for non-existing params', () => {
      const { result } = renderHook(() => useSearchParams());

      expect(result.current.has('nonexistent')).toBe(false);
    });

    it('should return true for params with empty values', () => {
      mockLocation.search = '?empty=';
      const { result } = renderHook(() => useSearchParams());

      expect(result.current.has('empty')).toBe(true);
    });
  });

  describe('toString method', () => {
    it('should return the search params as string', () => {
      const { result } = renderHook(() => useSearchParams());

      expect(result.current.toString()).toBe('initial=value&test=123');
    });

    it('should return empty string when no params', () => {
      mockLocation.search = '';
      const { result } = renderHook(() => useSearchParams());

      expect(result.current.toString()).toBe('');
    });

    it('should handle URL encoding in string output', () => {
      mockLocation.search = '?space=hello%20world&special=test%26value';
      const { result } = renderHook(() => useSearchParams());

      expect(result.current.toString()).toContain('space=hello+world');
      expect(result.current.toString()).toContain('special=test%26value');
    });
  });

  describe('searchParams property', () => {
    it('should expose the URLSearchParams instance', () => {
      const { result } = renderHook(() => useSearchParams());

      expect(result.current.searchParams).toBeInstanceOf(URLSearchParams);
      expect(result.current.searchParams.get('initial')).toBe('value');
    });
  });

  describe('URL change handling', () => {
    it('should update when urlChanged event is fired', () => {
      const { result } = renderHook(() => useSearchParams());

      // Get the event handler that was registered
      const urlChangedHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === 'urlChanged',
      )?.[1];

      expect(urlChangedHandler).toBeDefined();

      // Simulate URL change
      mockLocation.search = '?updated=newValue&another=param';

      act(() => {
        urlChangedHandler();
      });

      expect(result.current.get('updated')).toBe('newValue');
      expect(result.current.get('another')).toBe('param');
      expect(result.current.get('initial')).toBeNull(); // Old param should be gone
    });

    it('should update when popstate event is fired', () => {
      const { result } = renderHook(() => useSearchParams());

      // Get the popstate handler
      const popstateHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === 'popstate',
      )?.[1];

      expect(popstateHandler).toBeDefined();

      // Simulate browser back/forward navigation
      mockLocation.search = '?fromBrowser=navigation';

      act(() => {
        popstateHandler();
      });

      expect(result.current.get('fromBrowser')).toBe('navigation');
    });

    it('should handle multiple rapid URL changes', () => {
      const { result } = renderHook(() => useSearchParams());

      const urlChangedHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === 'urlChanged',
      )?.[1];

      // Rapid changes
      mockLocation.search = '?step=1';
      act(() => urlChangedHandler());

      mockLocation.search = '?step=2';
      act(() => urlChangedHandler());

      mockLocation.search = '?step=3&final=true';
      act(() => urlChangedHandler());

      expect(result.current.get('step')).toBe('3');
      expect(result.current.get('final')).toBe('true');
    });
  });

  describe('edge cases', () => {
    it('should handle malformed search strings gracefully', () => {
      mockLocation.search = '?invalid=value&malformed';

      expect(() => {
        renderHook(() => useSearchParams());
      }).not.toThrow();
    });

    it('should handle search strings without leading question mark', () => {
      mockLocation.search = 'param=value&another=test';
      const { result } = renderHook(() => useSearchParams());

      expect(result.current.get('param')).toBe('value');
      expect(result.current.get('another')).toBe('test');
    });

    it('should handle duplicate parameter names', () => {
      mockLocation.search = '?param=first&param=second';
      const { result } = renderHook(() => useSearchParams());

      // URLSearchParams takes the first value for duplicates
      expect(result.current.get('param')).toBe('first');
    });

    it('should handle very long parameter values', () => {
      const longValue = 'a'.repeat(1000);
      mockLocation.search = `?long=${encodeURIComponent(longValue)}`;
      const { result } = renderHook(() => useSearchParams());

      expect(result.current.get('long')).toBe(longValue);
    });
  });

  describe('integration scenarios', () => {
    it('should work correctly after multiple mount/unmount cycles', () => {
      // First mount
      const { unmount: unmount1 } = renderHook(() => useSearchParams());
      unmount1();

      // Second mount with different search
      mockLocation.search = '?second=mount';
      const { result } = renderHook(() => useSearchParams());

      expect(result.current.get('second')).toBe('mount');
    });

    it('should handle event listener cleanup properly', () => {
      const { unmount } = renderHook(() => useSearchParams());

      // Verify listeners were added
      expect(mockAddEventListener).toHaveBeenCalledTimes(2);

      unmount();

      // Verify listeners were removed
      expect(mockRemoveEventListener).toHaveBeenCalledTimes(2);
    });
  });
});
