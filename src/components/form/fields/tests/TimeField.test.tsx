import { useFormFields } from '@/src/context';
import { fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { string } from 'yup';
import { TimeField, TimeFieldProps } from '../TimeField';
import { TimeFieldDefault } from '@/src/components/form/fields/default/TimeFieldDefault';
import { $TSFixMe } from '@/src/types/remoteFlows';

vi.mock('@/src/context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/context')>();
  return {
    ...actual,
    useFormFields: vi.fn(),
  };
});

describe('TimeField Component', () => {
  const mockOnChange = vi.fn();
  const defaultProps: TimeFieldProps = {
    name: 'testTimeField',
    label: 'Start Time',
    description: 'Select start time',
    type: 'time',
    computedAttributes: {},
    errorMessage: {
      required: 'This field is required',
    },
    inputType: 'time' as const,
    isVisible: true,
    jsonType: 'string',
    required: true,
    schema: string(),
    scopedJsonSchema: {},
  };

  const renderWithFormContext = (props: TimeFieldProps) => {
    const TestComponent = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <TimeField {...props} />
        </FormProvider>
      );
    };

    return render(<TestComponent />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFormFields as $TSFixMe).mockReturnValue({
      components: {
        time: TimeFieldDefault,
      },
    });
  });

  it('renders the default implementation correctly', () => {
    renderWithFormContext(defaultProps);

    expect(screen.getByText('Start Time')).toBeInTheDocument();
    expect(screen.getByText('Select start time')).toBeInTheDocument();
  });

  it('handles time change correctly', () => {
    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const input = screen.getByPlaceholderText('Start Time');
    fireEvent.change(input, { target: { value: '09:30' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });
});
