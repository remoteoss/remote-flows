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
                onChange: (value: any) => {
                  field.onChange(value);
                  onChange?.(value);
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
                {...field}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  field.onChange(event);
                  onChange?.(event);
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
