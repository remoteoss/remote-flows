/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { string } from 'yup';
import { FileUploadField, FileUploadFieldProps } from '../FileUploadField';

// Mock dependencies
vi.mock('@/src/context', () => ({
  useFormFields: vi.fn(),
}));

describe('FileUploadField Component', () => {
  const mockOnChange = vi.fn();
  const defaultProps: FileUploadFieldProps = {
    name: 'testField',
    label: 'Test Field',
    description: 'This is a test field',
    type: 'file',
    computedAttributes: {},
    errorMessage: {
      required: 'This field is required',
    },
    inputType: 'file' as const,
    isVisible: true,
    jsonType: 'string',
    required: true,
    schema: string(),
    scopedJsonSchema: {},
  };

  // Helper function to render the component with a form context
  const renderWithFormContext = (props: FileUploadFieldProps) => {
    const TestComponent = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <FileUploadField {...props} />
        </FormProvider>
      );
    };

    return render(<TestComponent />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFormFields as any).mockReturnValue({ components: {} });
  });

  it('renders the default implementation correctly', () => {
    renderWithFormContext(defaultProps);

    expect(screen.getByText('Test Field')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('This is a test field')).toBeInTheDocument();
  });

  it('handles file upload change correctly', () => {
    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByLabelText('File upload');
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('renders custom file upload component when provided', () => {
    const CustomFileUploadField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid="custom-file-upload-field">
          Custom File Upload Field
        </div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { file: CustomFileUploadField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    expect(CustomFileUploadField).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('custom-file-upload-field')).toBeInTheDocument();
  });

  it('passes field props to custom component correctly', () => {
    const CustomFileUploadField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid="custom-file-upload-field">
          Custom File Upload Field
        </div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { file: CustomFileUploadField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const call = CustomFileUploadField.mock.calls[0][0];
    expect(call.fieldData).toMatchObject(defaultProps);
    expect(call.field).toBeDefined();
    expect(call.fieldState).toBeDefined();
  });

  it('handles onChange in custom file upload component', () => {
    const CustomFileUploadField = vi.fn().mockImplementation(({ field }) => {
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        field.onChange(e);
      };

      return (
        <input
          type="file"
          data-testid="custom-file-input"
          onChange={handleChange}
        />
      );
    });

    (useFormFields as any).mockReturnValue({
      components: { file: CustomFileUploadField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const customFileInput = screen.getByTestId('custom-file-input');
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(customFileInput, { target: { files: [file] } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });
});
