import { ErrorResponse, mutationToPromise } from '@/src/lib/mutations';
import { $TSFixMe } from '@/src/types/remoteFlows';

describe('mutationToPromise', () => {
  describe('mutateAsync', () => {
    it('should handle nested error structure (error.error exists)', async () => {
      const mockMutation = {
        mutate: vi.fn((_, { onSuccess }) => {
          onSuccess({
            data: null,
            error: {
              error: { message: 'Nested error message' },
            },
          });
        }),
      };

      const result = await mutationToPromise(
        mockMutation as $TSFixMe,
      ).mutateAsync({});
      expect((result as ErrorResponse<{ message: string }>).error.message).toBe(
        'Nested error message',
      );
    });

    it('should handle flat error structure (only error exists)', async () => {
      const mockMutation = {
        mutate: vi.fn((_, { onSuccess }) => {
          onSuccess({
            data: null,
            error: { message: 'Flat error message' },
          });
        }),
      };

      const result = await mutationToPromise(
        mockMutation as $TSFixMe,
      ).mutateAsync({});
      expect((result as ErrorResponse<{ message: string }>).error.message).toBe(
        'Flat error message',
      );
    });
  });

  describe('mutateAsyncOrThrow', () => {
    it('should resolve with data on success', async () => {
      const mockMutation = {
        mutate: vi.fn((_, { onSuccess }) => {
          onSuccess({
            data: { id: 1, name: 'Test' },
            error: null,
          });
        }),
      };

      const result = await mutationToPromise(
        mockMutation as $TSFixMe,
      ).mutateAsyncOrThrow({});
      expect(result).toEqual({ id: 1, name: 'Test' });
    });

    it('should reject with nested error structure', async () => {
      const mockMutation = {
        mutate: vi.fn((_, { onSuccess }) => {
          onSuccess({
            data: null,
            error: {
              error: { message: 'Nested error message' },
            },
          });
        }),
      };

      await expect(
        mutationToPromise(mockMutation as $TSFixMe).mutateAsyncOrThrow({}),
      ).rejects.toEqual({
        error: new Error('Nested error message'),
        rawError: { error: { message: 'Nested error message' } },
        fieldErrors: [],
      });
    });

    it('should reject with flat error structure', async () => {
      const mockMutation = {
        mutate: vi.fn((_, { onSuccess }) => {
          onSuccess({
            data: null,
            error: { message: 'Flat error message' },
          });
        }),
      };

      await expect(
        mutationToPromise(mockMutation as $TSFixMe).mutateAsyncOrThrow({}),
      ).rejects.toEqual({
        error: new Error('Flat error message'),
        rawError: { message: 'Flat error message' },
        fieldErrors: [],
      });
    });
  });
});