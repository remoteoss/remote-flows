import {
  ErrorResponse,
  mutationToPromise,
  normalizeFieldErrors,
  FieldError,
} from '@/src/lib/mutations';
import { $TSFixMe, Meta, NestedMeta } from '@/src/types/remoteFlows';

describe('normalizeFieldErrors', () => {
  it('should return empty array when no errors', () => {
    expect(normalizeFieldErrors([])).toEqual([]);
  });

  it('should use field name when no meta provided', () => {
    const fieldErrors: FieldError[] = [
      { field: 'email', messages: ['Email is required'] },
    ];

    const result = normalizeFieldErrors(fieldErrors);

    expect(result).toEqual([
      {
        field: 'email',
        messages: ['Email is required'],
        userFriendlyLabel: 'email',
      },
    ]);
  });

  it('should use label from meta when available', () => {
    const fieldErrors: FieldError[] = [
      { field: 'email', messages: ['Email is required'] },
    ];
    const meta: Meta = { email: { label: 'Email Address' } };

    const result = normalizeFieldErrors(fieldErrors, meta);

    expect(result).toEqual([
      {
        field: 'email',
        messages: ['Email is required'],
        userFriendlyLabel: 'Email Address',
      },
    ]);
  });

  it('should handle one level nested field with slash notation', () => {
    const fieldErrors: FieldError[] = [
      {
        field: 'service_duration/expiration_date',
        messages: ['date must be after start date'],
      },
    ];
    const meta: NestedMeta = {
      service_duration: {
        expiration_date: { label: 'Service end date' },
      },
    };

    const result = normalizeFieldErrors(fieldErrors, meta);

    expect(result).toEqual([
      {
        field: 'service_duration/expiration_date',
        messages: ['date must be after start date'],
        userFriendlyLabel: 'Service end date',
      },
    ]);
  });

  it('should handle multiple level nested fields', () => {
    const fieldErrors: FieldError[] = [
      {
        field: 'contact/address/street',
        messages: ['Street is required'],
      },
    ];
    const meta: NestedMeta = {
      contact: {
        address: {
          street: { label: 'Street Address' },
        },
      },
    };

    const result = normalizeFieldErrors(fieldErrors, meta);

    expect(result).toEqual([
      {
        field: 'contact/address/street',
        messages: ['Street is required'],
        userFriendlyLabel: 'Street Address',
      },
    ]);
  });
});

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
