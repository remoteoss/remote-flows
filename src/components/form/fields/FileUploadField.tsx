/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';

import { useFormFields } from '@/src/context';
import { cn } from '@/src/lib/utils';
import { JSFField } from '@/src/types/remoteFlows';
import { useFormContext } from 'react-hook-form';
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

export type FileUploadFieldProps = JSFField & {
  onChange?: (value: any) => void;
  multiple?: boolean;
};

export function FileUploadField({
  name,
  description,
  label,
  multiple,
  onChange,
  ...rest
}: FileUploadFieldProps) {
  const { components } = useFormFields();
  const { control } = useFormContext();
  const convertFilesToBase64 = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files ? Array.from(event.target.files) : [];

    const fileObjects = await Promise.all(
      files.map(async (file) => {
        const base64 = await toBase64(file);
        return {
          name: file.name,
          content: base64.split(',')[1],
        };
      }),
    );
    if (multiple) {
      return fileObjects;
    }
    return fileObjects[0];
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        if (components?.file) {
          const CustomFileUploadField = components?.file;
          const customFileUploadFieldProps = {
            name,
            description,
            label,
            multiple,
            ...rest,
          };
          return (
            <CustomFileUploadField
              field={{
                ...field,
                value: null,
                onChange: async (value: any) => {
                  const files = await convertFilesToBase64(value);
                  field.onChange(files);
                  onChange?.(files);
                },
              }}
              fieldState={fieldState}
              fieldData={customFileUploadFieldProps}
            />
          );
        }
        return (
          <FormItem className={`RemoteFlows__FileUpload__Item__${name}`}>
            <FormLabel className="RemoteFlows__FileUpload__Label">
              {label}
            </FormLabel>
            <FormControl>
              <FileUploader
                onChange={async (
                  event: React.ChangeEvent<HTMLInputElement>,
                ) => {
                  const files = await convertFilesToBase64(event);
                  field.onChange(files);
                  onChange?.(files);
                }}
                multiple={multiple}
                className={cn('RemoteFlows__FileUpload__Input')}
              />
            </FormControl>
            {description && (
              <div className="flex items-center justify-between">
                <FormDescription className="RemoteFlows__FileUpload__Description">
                  {description}
                </FormDescription>
              </div>
            )}
            {fieldState.error && (
              <FormMessage className="RemoteFlows__FileUpload__Error" />
            )}
          </FormItem>
        );
      }}
    />
  );
}
