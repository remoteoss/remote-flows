/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';

import { useFormFields } from '@/src/context';
import { cn } from '@/src/lib/utils';
import { Components, JSFField } from '@/src/types/remoteFlows';
import {
  ControllerRenderProps,
  FieldValues,
  useFormContext,
} from 'react-hook-form';
import { FileUploader } from '../../ui/file-uploader';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';

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
      return {
        name: file.name,
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
  onChange?: (value: any) => void;
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
    event: React.ChangeEvent<HTMLInputElement>,
    field: ControllerRenderProps<FieldValues, string>,
  ) => {
    const files = event.target.files ? Array.from(event.target.files) : [];

    const sizeError = validateFileSize(files, maxSize);
    if (sizeError) {
      setError(name, { message: sizeError });
      return;
    }

    clearErrors(name);
    const base64Files = await convertFilesToBase64(files);
    field.onChange(base64Files);
    onChange?.(base64Files);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const CustomFileUploadField = component || components?.file;
        if (CustomFileUploadField) {
          const customFileUploadFieldProps = {
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
                value: null,
                onChange: async (value: any) => handleOnChange(value, field),
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
                onChange={(evt) => handleOnChange(evt, field)}
                multiple={multiple}
                className={cn('RemoteFlows__FileUpload__Input')}
                accept={accept}
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
