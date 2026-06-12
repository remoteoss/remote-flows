import {
  ErrorResponse,
  extractFieldErrors,
  mutationToPromise,
  normalizeFieldErrors,
  FieldError,
  isMutationError,
} from '@/src/lib/mutations';
import { $TSFixMe, Meta, NestedMeta } from '@/src/types/remoteFlows';

describe('extractFieldErrors', () => {
  it('should extract messages from a plain array of strings', () => {
    expect(
      extractFieldErrors({
        errors: {
          name: ['is required', 'is too short'],
        },
      }),
    ).toEqual<FieldError[]>([
      { field: 'name', messages: ['is required', 'is too short'] },
    ]);
  });

  it('should extract messages from a nested object of arrays', () => {
    expect(
      extractFieldErrors({
        errors: {
          basic_information: {
            name: ['is required'],
          },
        },
      }),
    ).toEqual<FieldError[]>([{ field: 'name', messages: ['is required'] }]);
  });

  it('should extract inner error messages when the value is an array-wrapped AI validation object', () => {
    // The backend's normalize_errors wraps non-list values in an array, so the
    // AI validation error arrives as a single-element array of objects.
    expect(
      extractFieldErrors({
        errors: {
          services_and_deliverables: [
            {
              error: ['Possible misclassification risk'],
              source: 'REMOTE_AI',
              skippable: true,
            },
          ],
        },
      }),
    ).toEqual<FieldError[]>([
      {
        field: 'services_and_deliverables',
        messages: ['Possible misclassification risk'],
      },
    ]);
  });

  it('should not produce "[object Object]" for array-wrapped object errors', () => {
    const result = extractFieldErrors({
      errors: {
        services_and_deliverables: [
          {
            error: ['Possible misclassification risk'],
            source: 'REMOTE_AI',
            skippable: false,
          },
        ],
      },
    });

    expect(result[0].messages).not.toContain('[object Object]');
  });

  it('should handle the nested error.error wrapper structure', () => {
    expect(
      extractFieldErrors({
        error: {
          errors: {
            name: ['is required'],
          },
        },
      }),
    ).toEqual<FieldError[]>([{ field: 'name', messages: ['is required'] }]);
  });

  it('should return an empty array when there are no errors', () => {
    expect(extractFieldErrors({})).toEqual([]);
    expect(extractFieldErrors({ errors: null })).toEqual([]);
  });
});

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
            response: undefined,
          });
        }),
      };

      await expect(
        mutationToPromise(mockMutation as $TSFixMe).mutateAsyncOrThrow({}),
      ).rejects.toEqual({
        error: new Error('Nested error message'),
        rawError: { error: { message: 'Nested error message' } },
        normalizedErrors: {},
        fieldErrors: [],
        response: undefined,
      });
    });

    it('should reject with flat error structure', async () => {
      const mockMutation = {
        mutate: vi.fn((_, { onSuccess }) => {
          onSuccess({
            data: null,
            error: { message: 'Flat error message' },
            response: undefined,
          });
        }),
      };

      await expect(
        mutationToPromise(mockMutation as $TSFixMe).mutateAsyncOrThrow({}),
      ).rejects.toEqual({
        error: new Error('Flat error message'),
        rawError: { message: 'Flat error message' },
        normalizedErrors: {},
        fieldErrors: [],
        response: undefined,
      });
    });

    it('should populate normalizedErrors from nested error.error.errors structure', async () => {
      const mockMutation = {
        mutate: vi.fn((_, { onSuccess }) => {
          onSuccess({
            data: null,
            error: {
              error: {
                message: 'Validation error',
                errors: {
                  services_and_deliverables: {
                    error: ['AI validation failed'],
                    source: 'remote_ai',
                    skippable: true,
                  },
                  email: ['Email is invalid'],
                },
              },
            },
            response: undefined,
          });
        }),
      };

      await expect(
        mutationToPromise(mockMutation as $TSFixMe).mutateAsyncOrThrow({}),
      ).rejects.toEqual({
        error: new Error('Validation error'),
        rawError: {
          error: {
            message: 'Validation error',
            errors: {
              services_and_deliverables: {
                error: ['AI validation failed'],
                source: 'remote_ai',
                skippable: true,
              },
              email: ['Email is invalid'],
            },
          },
        },
        normalizedErrors: {
          services_and_deliverables: {
            error: ['AI validation failed'],
            source: 'remote_ai',
            skippable: true,
          },
          email: ['Email is invalid'],
        },
        fieldErrors: [
          { field: 'error', messages: ['AI validation failed'] },
          { field: 'email', messages: ['Email is invalid'] },
        ],
        response: undefined,
      });
    });

    it('should populate normalizedErrors from flat error.errors structure', async () => {
      const mockMutation = {
        mutate: vi.fn((_, { onSuccess }) => {
          onSuccess({
            data: null,
            error: {
              message: 'Validation error',
              errors: {
                name: ['Name is required'],
                age: ['Age must be positive'],
              },
            },
            response: undefined,
          });
        }),
      };

      await expect(
        mutationToPromise(mockMutation as $TSFixMe).mutateAsyncOrThrow({}),
      ).rejects.toEqual({
        error: new Error('Validation error'),
        rawError: {
          message: 'Validation error',
          errors: {
            name: ['Name is required'],
            age: ['Age must be positive'],
          },
        },
        normalizedErrors: {
          name: ['Name is required'],
          age: ['Age must be positive'],
        },
        fieldErrors: [
          { field: 'name', messages: ['Name is required'] },
          { field: 'age', messages: ['Age must be positive'] },
        ],
        response: undefined,
      });
    });
  });

  describe('isMutationError', () => {
    it('should return true for valid MutationErrorStructure', () => {
      const error = {
        error: new Error('test'),
        rawError: {},
        normalizedErrors: {},
        fieldErrors: [],
      };

      expect(isMutationError(error)).toBe(true);
    });

    it('should return false for non-mutation errors', () => {
      expect(isMutationError(new Error('test'))).toBe(false);
      expect(isMutationError(null)).toBe(false);
      expect(isMutationError(undefined)).toBe(false);
      expect(isMutationError('error string')).toBe(false);
      expect(isMutationError({ message: 'error' })).toBe(false);
    });
  });
});
