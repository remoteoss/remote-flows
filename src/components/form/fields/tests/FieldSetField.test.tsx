import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FieldSetField, FieldSetProps } from '../FieldSetField';
import { FormProvider, useForm } from 'react-hook-form';
import { useFormFields } from '@/src/context';
import { $TSFixMe } from '@/src/types/remoteFlows';

vi.mock('@/src/context', () => ({
  useFormFields: vi.fn(),
}));

vi.mock('@/src/components/shared/zendesk-drawer/ZendeskTriggerButton', () => ({
  ZendeskTriggerButton: ({ zendeskId, children, className }: $TSFixMe) => (
    <button className={className} data-testid={`zendesk-button-${zendeskId}`}>
      {children}
    </button>
  ),
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

    it('should use custom button component when provided', () => {
      const CustomButton = vi
        .fn()
        .mockImplementation(({ children, ...props }) => (
          <button {...props} data-testid='custom-button'>
            {children}
          </button>
        ));

      (useFormFields as $TSFixMe).mockReturnValue({
        components: {
          fieldsetToggle: CustomButton,
        },
      });

      renderWithFormContext({
        variant: 'inset',
        features: {
          toggle: {
            enabled: true,
            stateField: 'test-fieldset._expanded',
            labels: {
              expand: 'Define',
              collapse: 'Remove',
            },
          },
        },
      });

      // Verify custom button was rendered
      expect(screen.getByTestId('custom-button')).toBeInTheDocument();
      expect(CustomButton).toHaveBeenCalledWith(
        expect.objectContaining({
          'aria-expanded': false,
          'aria-controls': 'test-fieldset-content',
          'aria-label': 'Show Test Fieldset',
        }),
        expect.anything(),
      );
    });

    it('should pass correct props to custom button when toggled', async () => {
      const CustomButton = vi
        .fn()
        .mockImplementation(({ isExpanded, onToggle }) => (
          <button
            aria-expanded={isExpanded}
            onClick={onToggle}
            data-testid='custom-button'
          >
            {isExpanded ? 'Remove' : 'Define'}
          </button>
        ));

      (useFormFields as $TSFixMe).mockReturnValue({
        components: {
          fieldsetToggle: CustomButton,
        },
      });

      renderWithFormContext({
        variant: 'inset',
        features: {
          toggle: {
            enabled: true,
            stateField: 'test-fieldset._expanded',
            labels: {
              expand: 'Define',
              collapse: 'Remove',
            },
          },
        },
      });

      const button = screen.getByTestId('custom-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(CustomButton).toHaveBeenLastCalledWith(
          expect.objectContaining({
            'aria-expanded': true,
            children: 'Remove', // Should use collapse label
          }),
          expect.anything(),
        );
      });
    });
  });

  describe('helpCenter link support', () => {
    it('should render helpCenter link when provided with outset variant', () => {
      renderWithFormContext({
        variant: 'outset',
        meta: {
          helpCenter: {
            callToAction: 'Learn more about this',
            id: 12345,
            url: 'https://zendesk.example.com/article/12345',
            label: 'Help Center',
          },
        },
      });

      const helpLink = screen.getByRole('button', {
        name: 'Learn more about this',
      });
      expect(helpLink).toBeInTheDocument();
    });

    it('should not render helpCenter link in outset variant when not provided', () => {
      renderWithFormContext({
        variant: 'outset',
      });

      expect(
        screen.queryByRole('button', { name: 'Learn more about this' }),
      ).not.toBeInTheDocument();
    });

    it('should render helpCenter link in inset variant header when provided', () => {
      renderWithFormContext({
        variant: 'inset',
        meta: {
          helpCenter: {
            callToAction: 'Need help?',
            id: 54321,
            url: 'https://zendesk.example.com/article/54321',
            label: 'Help',
          },
        },
      });

      const helpLinks = screen.getAllByRole('button', {
        name: 'Need help?',
      });
      expect(helpLinks.length).toBe(1);
    });
  });

  describe('nested fieldsets', () => {
    it('should render nested fieldset without throwing runtime exceptions', () => {
      renderWithFormContext({
        fields: [
          {
            name: 'nested',
            label: 'Nested Section',
            description: 'Nested',
            type: 'fieldset',
            inputType: 'fieldset',
            fields: [],
          } as $TSFixMe,
        ],
      });

      expect(screen.getByText('Nested Section')).toBeInTheDocument();
    });

    it('should render flat nested fieldset', () => {
      renderWithFormContext({
        fields: [
          {
            name: 'flat-nested',
            label: 'Flat Nested',
            description: 'Flat',
            type: 'fieldset-flat',
            inputType: 'fieldset-flat',
            fields: [],
          } as $TSFixMe,
        ],
      });

      expect(screen.getByText('Flat Nested')).toBeInTheDocument();
    });

    it('should skip hidden and deprecated nested fieldsets', () => {
      renderWithFormContext({
        fields: [
          {
            name: 'visible',
            label: 'Visible',
            description: '',
            type: 'fieldset',
            inputType: 'fieldset',
            fields: [],
          } as $TSFixMe,
          {
            name: 'hidden',
            label: 'Hidden',
            description: 'Hidden',
            type: 'fieldset',
            inputType: 'fieldset',
            fields: [],
            isVisible: false,
          } as $TSFixMe,
          {
            name: 'deprecated',
            label: 'Deprecated',
            description: 'Deprecated',
            type: 'fieldset',
            inputType: 'fieldset',
            fields: [],
            deprecated: true,
          } as $TSFixMe,
        ],
      });

      expect(screen.getByText('Visible')).toBeInTheDocument();
      expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
      expect(screen.queryByText('Deprecated')).not.toBeInTheDocument();
    });
  });
});
