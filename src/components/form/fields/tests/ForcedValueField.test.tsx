import { useFormFields } from '@/src/context';
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { ForcedValueField, ForcedValueFieldProps } from '../ForcedValueField';
import { ForcedValueFieldDefault } from '@/src/components/form/fields/default/ForcedValueFieldDefault';
import { $TSFixMe } from '@/src/types/remoteFlows';

vi.mock('@/src/context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/context')>();
  return {
    ...actual,
    useFormFields: vi.fn(),
  };
});

describe('ForcedValueField Component', () => {
  const defaultProps: ForcedValueFieldProps = {
    name: 'testField',
    value: 'forced-value',
    description: 'This is a test description',
    label: 'Test Label',
  };

  const renderWithFormContext = (
    props: ForcedValueFieldProps,
    setValue = vi.fn(),
  ) => {
    const TestComponent = () => {
      const methods = { ...useForm(), setValue };
      return (
        <FormProvider {...methods}>
          <ForcedValueField {...props} />
        </FormProvider>
      );
    };

    return { setValue, ...render(<TestComponent />) };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFormFields as $TSFixMe).mockReturnValue({
      components: { forcedValue: ForcedValueFieldDefault },
    });
  });

  it('sets the form value using setValue from useFormContext', () => {
    const { setValue } = renderWithFormContext(defaultProps);

    expect(setValue).toHaveBeenCalledWith('testField', 'forced-value');
  });

  it('renders the resolved label and description via the registered component', () => {
    renderWithFormContext(defaultProps);

    expect(screen.getByText('This is a test description')).toBeInTheDocument();
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('falls back to label/description when statement fields are undefined', () => {
    renderWithFormContext({
      ...defaultProps,
      statement: { title: undefined, description: undefined },
    });

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('This is a test description')).toBeInTheDocument();
  });

  it('prioritizes statement title/description over label/description', () => {
    renderWithFormContext({
      ...defaultProps,
      statement: {
        title: 'Statement Title',
        description: 'Statement Description',
      },
    });

    expect(screen.getByText('Statement Title')).toBeInTheDocument();
    expect(screen.getByText('Statement Description')).toBeInTheDocument();
    expect(
      screen.queryByText('This is a test description'),
    ).not.toBeInTheDocument();
  });

  it('renders a custom forcedValue component when provided', () => {
    const CustomForcedValue = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='custom-forced-value'>Custom Forced Value</div>
      ));

    (useFormFields as $TSFixMe).mockReturnValue({
      components: { forcedValue: CustomForcedValue },
    });

    renderWithFormContext(defaultProps);

    expect(CustomForcedValue).toHaveBeenCalled();
    expect(screen.getByTestId('custom-forced-value')).toBeInTheDocument();
  });

  describe('when there is nothing to show', () => {
    it('still sets the form value but renders nothing, without requiring a registered component', () => {
      (useFormFields as $TSFixMe).mockReturnValue({ components: {} });

      const { setValue, container } = renderWithFormContext({
        ...defaultProps,
        description: '',
      });

      expect(setValue).toHaveBeenCalledWith('testField', 'forced-value');
      expect(container.firstChild).toBeNull();
    });
  });

  it('throws when no forcedValue component is registered and there is content to show', () => {
    (useFormFields as $TSFixMe).mockReturnValue({ components: {} });

    expect(() => renderWithFormContext(defaultProps)).toThrow(
      'Forced value component not found for field testField',
    );
  });
});
