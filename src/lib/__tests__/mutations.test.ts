import { ErrorResponse, mutationToPromise } from '@/src/lib/mutations';
import { $TSFixMe } from '@/src/types/remoteFlows';

describe('mutationToPromise', () => {
  describe('onSuccess with error response', () => {
    it('should handle nested error structure (error.error exists)', async () => {
      // response.error.error case
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
      // response.error case
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
});
