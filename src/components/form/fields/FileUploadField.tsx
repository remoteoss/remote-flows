import { useFormFields } from '@/src/context';
import { cn } from '@/src/lib/utils';
import { Components, FieldDataProps, JSFField } from '@/src/types/remoteFlows';
import {
  ControllerRenderProps,
  FieldValues,
  useFormContext,
} from 'react-hook-form';
import React from 'react';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';
import { FileUploader } from '@/src/components/ui/file-uploader';

export type FieldFileDataProps = FieldDataProps & {
  accept?: string;
  multiple?: boolean;
  maxFileSize?: number;
  onRemoveFile?: (file: File) => void;
};

const toBase64 = (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const convertFilesToBase64 = async (files: File[]) => {
  const base64Files = await Promise.all(
    files.map(async (file) => {
      const base64 = await toBase64(file);
      // the ...file makes typescript compiler to say we're returning a FILE interface but we aren't
      // we just return name, size, type and content
      // File interface makes it easy for everybody to use
      // if we remove the ...file, typescript will complain about the return type
      return {
        ...file,
        name: file.name,
        size: file.size,
        type: file.type,
        content: base64.split(',')[1],
      };
    }),
  );
  return base64Files;
};

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

  const handleFileChange = async (
    files: File[],
    field: ControllerRenderProps<FieldValues, string>,
  ) => {
    const sizeError = validateFileSize(files, maxSize);
    if (sizeError) {
      setError(name, { message: sizeError });
      return;
    }

    clearErrors(name);
    const base64Files = await convertFilesToBase64(files);
    field.onChange(base64Files as unknown as File[]);
    onChange?.(base64Files as unknown as File[]);
  };

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    field: ControllerRenderProps<FieldValues, string>,
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files);
      await handleFileChange(newFiles, field);
    }
  };

  const handleRemoveFile = async (
    file: File,
    field: ControllerRenderProps<FieldValues, string>,
  ) => {
    const updatedFiles = (field.value as File[]).filter(
      (f) => f.name !== file.name,
    );
    await handleFileChange(updatedFiles, field);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const CustomFileUploadField = component || components?.file;
        if (CustomFileUploadField) {
          const customFileUploadFieldProps: FieldFileDataProps = {
            name,
            description,
            label,
            multiple,
            accept,
            maxFileSize: maxSize,
            onRemoveFile: (file: File) => handleRemoveFile(file, field),
            ...rest,
          };
          return (
            <CustomFileUploadField
              field={{
                ...field,
                value: field.value,
                onChange: async (value: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange(value, field),
              }}
              fieldState={fieldState}
              fieldData={customFileUploadFieldProps}
            />
          );
        }
        return (
          <FormItem
            data-field={name}
            className={`RemoteFlows__FileUpload__Item__${name}`}
          >
            <FormLabel className='RemoteFlows__FileUpload__Label'>
              {label}
            </FormLabel>
            <FormControl>
              <FileUploader
                onChange={(evt) => handleInputChange(evt, field)}
                onRemoveFile={(file) => handleRemoveFile(file, field)}
                multiple={multiple}
                className={cn('RemoteFlows__FileUpload__Input')}
                accept={accept}
                files={field.value || []}
              />
            </FormControl>
            {description && (
              <div className='flex items-center justify-between'>
                <FormDescription className='RemoteFlows__FileUpload__Description'>
                  {description}
                </FormDescription>
              </div>
            )}
            {fieldState.error && (
              <FormMessage className='RemoteFlows__FileUpload__Error' />
            )}
          </FormItem>
        );
      }}
    />
  );
}
