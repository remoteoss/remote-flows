import { render, screen } from '@testing-library/react';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import { engagementDetailsSchemaV1GermanySimplified } from '@/src/flows/Onboarding/tests/fixtures';
import {
  assertWorkingDaysVisible,
  waitForFormToLoad,
  createTestFormFromSchema,
} from '@/src/flows/Onboarding/tests/helpers';

import { Form } from '@/src/components/ui/form';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { useJSONSchemaForm } from '@/src/components/form/useJSONSchemaForm';
import { JSFFields, JSFFieldset, Components } from '@/src/types/remoteFlows';
import { ValidationResult } from '@remoteoss/remote-json-schema-form-kit';

type TestOnboardingFormProps = {
  defaultValues: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
  fields: JSFFields;
  fieldsets?: JSFFieldset;
  handleValidation: (
    values: Record<string, unknown>,
  ) => Promise<ValidationResult | null>;
  components?: Components;
};

function TestOnboardingForm({
  defaultValues,
  onSubmit,
  fields,
  fieldsets,
  handleValidation,
  components,
}: TestOnboardingFormProps) {
  const form = useJSONSchemaForm({
    handleValidation,
    defaultValues,
    checkFieldUpdates: () => {}, // No-op for tests
  });

  const handleFormSubmit = async (values: Record<string, unknown>) => {
    await onSubmit(values);
  };

  // Get live field values for rendering
  const fieldValues = form.watch();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <JSONSchemaFormFields
          components={components}
          fields={fields}
          fieldsets={fieldsets}
          fieldValues={fieldValues}
        />

        {/* Debug helper for tests */}
        <div data-testid='debug-form-values' style={{ display: 'none' }}>
          {JSON.stringify(fieldValues)}
        </div>
      </form>
    </Form>
  );
}

const mockOnSubmit = vi.fn();

describe('Germany EOR - working_days default values', () => {
  beforeEach(() => {
    queryClient.clear();
    mockOnSubmit.mockClear();
  });

  const createMockValidation = () => {
    return vi.fn().mockResolvedValue({ isValid: true, errors: {} });
  };

  describe('conditional field visibility', () => {
    it('should not show working_days when has_similar_roles is no', async () => {
      const schema = engagementDetailsSchemaV1GermanySimplified.data;
      const { fields, meta } = createTestFormFromSchema(schema, {
        has_similar_roles: 'no',
      });
      const mockValidation = createMockValidation();

      render(
        <TestProviders>
          <TestOnboardingForm
            defaultValues={{ has_similar_roles: 'no' }}
            onSubmit={mockOnSubmit}
            fields={fields}
            fieldsets={meta['x-jsf-fieldsets']}
            handleValidation={mockValidation}
          />
        </TestProviders>,
      );

      await waitForFormToLoad();
      await assertWorkingDaysVisible(false);
    });
  });

  describe('default value preloading', () => {
    it('should preload working_days default when has_similar_roles is set to yes', async () => {
      const schema = engagementDetailsSchemaV1GermanySimplified.data;
      const { fields, meta } = createTestFormFromSchema(schema, {
        has_similar_roles: 'yes',
      });
      const mockValidation = createMockValidation();

      render(
        <TestProviders>
          <TestOnboardingForm
            defaultValues={{
              has_similar_roles: 'yes',
              working_days: [
                'monday',
                'tuesday',
                'wednesday',
                'thursday',
                'friday',
              ],
            }}
            onSubmit={mockOnSubmit}
            fields={fields}
            fieldsets={meta['x-jsf-fieldsets']}
            handleValidation={mockValidation}
          />
        </TestProviders>,
      );

      await waitForFormToLoad();

      await assertWorkingDaysVisible(true);

      expect(screen.getByText('Monday')).toBeInTheDocument();
      expect(screen.getByText('Tuesday')).toBeInTheDocument();
      expect(screen.getByText('Wednesday')).toBeInTheDocument();
      expect(screen.getByText('Thursday')).toBeInTheDocument();
      expect(screen.getByText('Friday')).toBeInTheDocument();
    });
  });
});
