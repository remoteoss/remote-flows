/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { string } from 'yup';
import { FileUploadField, FileUploadFieldProps } from '../FileUploadField';
import { defaultComponents } from '@/src/default-components';

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
    (useFormFields as any).mockReturnValue({ components: defaultComponents });
  });

  it('renders the default implementation correctly', () => {
    renderWithFormContext(defaultProps);

    expect(screen.getByText('Test Field')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('This is a test field')).toBeInTheDocument();
  });

  it('handles file upload change correctly', async () => {
    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByLabelText('File upload');
    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledOnce();
    });
  });

  it('renders custom file upload component when provided', () => {
    const CustomFileUploadField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='custom-file-upload-field'>
          Custom File Upload Field
        </div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { ...defaultComponents, file: CustomFileUploadField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    expect(CustomFileUploadField).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('custom-file-upload-field')).toBeInTheDocument();
  });

  it('passes field props to custom component correctly', async () => {
    const CustomFileUploadField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='custom-file-upload-field'>
          Custom File Upload Field
        </div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { ...defaultComponents, file: CustomFileUploadField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const call = CustomFileUploadField.mock.calls[0][0];
    expect(call.fieldData).toMatchObject(defaultProps);
    expect(call.field).toBeDefined();
    expect(call.fieldState).toBeDefined();
  });

  it('handles onChange in custom file upload component', async () => {
    const CustomFileUploadField = vi.fn().mockImplementation(({ field }) => {
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        field.onChange(files);
      };

      return (
        <input
          type='file'
          data-testid='custom-file-input'
          onChange={handleChange}
        />
      );
    });

    (useFormFields as any).mockReturnValue({
      components: { ...defaultComponents, file: CustomFileUploadField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const customFileInput = screen.getByTestId('custom-file-input');
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(customFileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledOnce();
    });
  });

  it('component prop takes precedence over useFormFields().components', () => {
    const CustomFileUploadFieldFromContext = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='context-file-upload-field'>
          Context File Upload Field
        </div>
      ));
    const CustomFileUploadFieldProp = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='prop-file-upload-field'>Prop File Upload Field</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: {
        ...defaultComponents,
        file: CustomFileUploadFieldFromContext,
      },
    });

    renderWithFormContext({
      ...defaultProps,
      onChange: mockOnChange,
      component: CustomFileUploadFieldProp,
    });

    expect(CustomFileUploadFieldProp).toHaveBeenCalled();
    expect(screen.getByTestId('prop-file-upload-field')).toBeInTheDocument();
    expect(
      screen.queryByTestId('context-file-upload-field'),
    ).not.toBeInTheDocument();
  });

  it('displays error when file exceeds max size limit', async () => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.txt', {
      type: 'text/plain',
    }); // 10MB file

    renderWithFormContext({ ...defaultProps, maxSize, onChange: mockOnChange });

    const fileInput = screen.getByLabelText('File upload');
    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(
        screen.getByText(
          'File "large.txt" exceeds maximum size of 5MB (file is 10MB)',
        ),
      ).toBeInTheDocument();
    });
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('accepts file within max size limit', async () => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const smallFile = new File(['test content'], 'small.txt', {
      type: 'text/plain',
    }); // Small file

    renderWithFormContext({ ...defaultProps, maxSize, onChange: mockOnChange });

    const fileInput = screen.getByLabelText('File upload');
    fireEvent.change(fileInput, { target: { files: [smallFile] } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledOnce();
      expect(mockOnChange.mock.calls[0][0]).toEqual([smallFile]);
    });
  });

  it('should preserve existing files when uploading additional files', async () => {
    const TestComponent = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <FileUploadField {...defaultProps} onChange={mockOnChange} />
        </FormProvider>
      );
    };

    render(<TestComponent />);

    const fileInput = screen.getByLabelText('File upload');

    // Upload first file
    const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [file1] } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith([file1]);
    });

    // Upload second file
    const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [file2] } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenLastCalledWith([file1, file2]);
    });
  });
});
