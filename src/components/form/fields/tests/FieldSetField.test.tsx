import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FieldSetField, FieldSetProps } from '../FieldSetField';
import { FormProvider, useForm } from 'react-hook-form';
import { useFormFields } from '@/src/context';
import { $TSFixMe } from '@/src/types/remoteFlows';

vi.mock('@/src/context', () => ({
  useFormFields: vi.fn(),
}));

const defaultProps = {
  name: 'test-fieldset',
  title: 'Test Fieldset',
  fields: [],
  label: 'Test Fieldset',
  description: 'Test Description',
  components: {},
  isFlatFieldset: false,
  variant: 'outset' as const,
};

const renderWithFormContext = (
  props: Partial<FieldSetProps> = defaultProps,
) => {
  const TestComponent = () => {
    const methods = useForm({
      defaultValues: {
        'test-fieldset._expanded': false,
      },
    });
    return (
      <FormProvider {...methods}>
        <FieldSetField {...defaultProps} {...props} />
      </FormProvider>
    );
  };

  return render(<TestComponent />);
};

describe('FieldSetField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useFormFields as $TSFixMe).mockReturnValue({ components: {} });
  });
  it('renders with default variant (outset)', () => {
    renderWithFormContext();

    // Title should be in legend
    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByRole('group')).toHaveTextContent('Test Fieldset');
  });

  it('renders with inset variant', () => {
    renderWithFormContext({
      variant: 'inset',
    });

    // Title should be inside fieldset as heading
    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByRole('group')).toHaveTextContent('Test Fieldset');
    expect(screen.getByRole('heading')).toHaveTextContent('Test Fieldset');
  });

  describe('toggle feature', () => {
    it('should render toggle button when enabled', () => {
      renderWithFormContext({
        variant: 'inset',
        features: {
          toggle: {
            enabled: true,
            defaultExpanded: false,
            labels: {
              expand: 'Define',
              collapse: 'Remove',
            },
          },
        },
      });

      expect(
        screen.getByRole('button', { name: 'Show Test Fieldset' }),
      ).toBeInTheDocument();
    });

    it('should not render toggle button when disabled', () => {
      renderWithFormContext({
        variant: 'inset',
        features: {
          toggle: {
            enabled: false,
          },
        },
      });

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should toggle content visibility when clicked', async () => {
      renderWithFormContext({
        variant: 'inset',
        features: {
          toggle: {
            enabled: true,
            stateField: 'test-fieldset._expanded',
            defaultExpanded: false,
            labels: {
              expand: 'Define',
              collapse: 'Remove',
            },
          },
        },
        fields: [
          {
            name: 'test',
            label: 'Test Field',
            description: 'Test Description',
            inputType: 'text',
            type: 'text',
          },
        ],
      });

      const button = screen.getByRole('button', { name: 'Show Test Fieldset' });
      expect(button).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(button);
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });
});
