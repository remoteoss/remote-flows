import * as React from 'react';

import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import { FileUploader } from '../../ui/file-uploader';
import { cn } from '@/src/lib/utils';

type FileUploadFieldProps = {
  label: string;
  description?: string;
  name: string;
  multiple?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function FileUploadField({
  name,
  description,
  label,
  multiple,
  onChange,
}: FileUploadFieldProps) {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
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
