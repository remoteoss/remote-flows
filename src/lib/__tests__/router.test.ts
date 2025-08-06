// src/lib/__tests__/router.test.ts
import { renderHook, act } from '@testing-library/react';
import { useRouter } from '../router';
import { $TSFixMe } from '@/src/types/remoteFlows';

// Mock window.history and window.dispatchEvent
const mockPushState = vi.fn();
const mockReplaceState = vi.fn();
const mockBack = vi.fn();
const mockForward = vi.fn();
const mockDispatchEvent = vi.fn();

Object.defineProperty(window, 'history', {
  value: {
    pushState: mockPushState,
    replaceState: mockReplaceState,
    back: mockBack,
    forward: mockForward,
  },
  writable: true,
});

Object.defineProperty(window, 'dispatchEvent', {
  value: mockDispatchEvent,
  writable: true,
});

// Mock window.location
delete (window as $TSFixMe).location;
window.location = {
  href: 'https://example.com/test?existing=param',
} as $TSFixMe;

describe('useRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset location href for each test
    window.location.href = 'https://example.com/test?existing=param';
  });

  describe('push', () => {
    it('should call window.history.pushState with correct arguments', () => {
      const { result } = renderHook(() => useRouter());
      const testUrl = 'https://example.com/new-page';

      act(() => {
        result.current.push(testUrl);
      });

      expect(mockPushState).toHaveBeenCalledWith({}, '', testUrl);
    });

    it('should dispatch urlChanged event', () => {
      const { result } = renderHook(() => useRouter());

      act(() => {
        result.current.push('https://example.com/new-page');
      });

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'urlChanged',
        }),
      );
    });
  });

  describe('replace', () => {
    it('should call window.history.replaceState with correct arguments', () => {
      const { result } = renderHook(() => useRouter());
      const testUrl = 'https://example.com/replaced-page';

      act(() => {
        result.current.replace(testUrl);
      });

      expect(mockReplaceState).toHaveBeenCalledWith({}, '', testUrl);
    });

    it('should dispatch urlChanged event', () => {
      const { result } = renderHook(() => useRouter());

      act(() => {
        result.current.replace('https://example.com/replaced-page');
      });

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'urlChanged',
        }),
      );
    });
  });

  describe('back', () => {
    it('should call window.history.back', () => {
      const { result } = renderHook(() => useRouter());

      act(() => {
        result.current.back();
      });

      expect(mockBack).toHaveBeenCalled();
    });

    it('should not dispatch urlChanged event for back navigation', () => {
      const { result } = renderHook(() => useRouter());

      act(() => {
        result.current.back();
      });

      expect(mockDispatchEvent).not.toHaveBeenCalled();
    });
  });

  describe('forward', () => {
    it('should call window.history.forward', () => {
      const { result } = renderHook(() => useRouter());

      act(() => {
        result.current.forward();
      });

      expect(mockForward).toHaveBeenCalled();
    });

    it('should not dispatch urlChanged event for forward navigation', () => {
      const { result } = renderHook(() => useRouter());

      act(() => {
        result.current.forward();
      });

      expect(mockDispatchEvent).not.toHaveBeenCalled();
    });
  });

  describe('setSearchParams', () => {
    beforeEach(() => {
      // Reset to a clean URL for search params tests
      window.location.href = 'https://example.com/test';
    });

    it('should add new search parameters', () => {
      const { result } = renderHook(() => useRouter());

      act(() => {
        result.current.setSearchParams({
          articleId: '123',
          tab: 'details',
        });
      });

      expect(mockPushState).toHaveBeenCalledWith(
        {},
        '',
        'https://example.com/test?articleId=123&tab=details',
      );
    });

    it('should update existing search parameters', () => {
      window.location.href =
        'https://example.com/test?articleId=456&existing=value';
      const { result } = renderHook(() => useRouter());

      act(() => {
        result.current.setSearchParams({
          articleId: '789',
        });
      });

      expect(mockPushState).toHaveBeenCalledWith(
        {},
        '',
        'https://example.com/test?articleId=789&existing=value',
      );
    });

    it('should remove search parameters when value is null', () => {
      window.location.href =
        'https://example.com/test?articleId=123&tab=details';
      const { result } = renderHook(() => useRouter());

      act(() => {
        result.current.setSearchParams({
          articleId: null,
        });
      });

      expect(mockPushState).toHaveBeenCalledWith(
        {},
        '',
        'https://example.com/test?tab=details',
      );
    });

    it('should handle mixed add/update/remove operations', () => {
      window.location.href = 'https://example.com/test?old=value&keep=this';
      const { result } = renderHook(() => useRouter());

      act(() => {
        result.current.setSearchParams({
          old: null, // remove
          keep: 'updated', // update
          new: 'added', // add
        });
      });

      expect(mockPushState).toHaveBeenCalledWith(
        {},
        '',
        'https://example.com/test?keep=updated&new=added',
      );
    });

    it('should dispatch urlChanged event', () => {
      const { result } = renderHook(() => useRouter());

      act(() => {
        result.current.setSearchParams({ test: 'value' });
      });

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'urlChanged',
        }),
      );
    });

    it('should handle empty search params object', () => {
      const { result } = renderHook(() => useRouter());

      act(() => {
        result.current.setSearchParams({});
      });

      expect(mockPushState).toHaveBeenCalledWith(
        {},
        '',
        'https://example.com/test',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in search params', () => {
      const { result } = renderHook(() => useRouter());

      act(() => {
        result.current.setSearchParams({
          special: 'hello world & test=123',
          encoded: 'test%20value',
        });
      });

      expect(mockPushState).toHaveBeenCalledWith(
        {},
        '',
        expect.stringContaining('special=hello+world+%26+test%3D123'),
      );
    });
  });
});
