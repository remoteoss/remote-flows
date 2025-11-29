import { useFormFields } from '@/src/context';
import { Components, JSFField } from '@/src/types/remoteFlows';
import {
  ControllerRenderProps,
  FieldValues,
  useFormContext,
} from 'react-hook-form';
import { FormField } from '../../ui/form';
import { FieldDataProps } from '@/src/types/fields';

const validateFileSize = (files: File[], maxSize?: number): string | null => {
  if (!maxSize) return null;

  for (const file of files) {
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      const fileSizeMB = Math.round(file.size / (1024 * 1024));
      return `File "${file.name}" exceeds maximum size of ${maxSizeMB}MB (file is ${fileSizeMB}MB)`;
    }
  }
  return null;
};

export type FieldFileDataProps = FieldDataProps & {
  accept?: string;
  multiple?: boolean;
  maxFileSize?: number;
};

export type FileUploadFieldProps = JSFField & {
  onChange?: (value: File[]) => void;
  multiple?: boolean;
  component?: Components['file'];
  maxSize?: number;
  accept?: string;
};

export function FileUploadField({
  name,
  description,
  label,
  multiple,
  onChange,
  component,
  accept,
  maxSize,
  ...rest
}: FileUploadFieldProps) {
  const { components } = useFormFields();
  const { control, setError, clearErrors } = useFormContext();

  const handleOnChange = async (
    files: File[],
    field: ControllerRenderProps<FieldValues, string>,
  ) => {
    const sizeError = validateFileSize(files, maxSize);
    if (sizeError) {
      setError(name, { message: sizeError });
      return;
    }

    clearErrors(name);
    field.onChange(files);
    onChange?.(files);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const CustomFileUploadField = component || components.file;

        const fieldData: FieldFileDataProps = {
          name,
          description,
          label,
          multiple,
          accept,
          maxFileSize: maxSize,
          ...rest,
        };

        return (
          <CustomFileUploadField
            field={{
              ...field,
              value: field.value,
              onChange: async (value: File[]) => handleOnChange(value, field),
            }}
            fieldState={fieldState}
            fieldData={fieldData}
          />
        );
      }}
    />
  );
}
