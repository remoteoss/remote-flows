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
        const CustomFileUploadField = component || components?.file;
        if (CustomFileUploadField) {
          const customFileUploadFieldProps: FieldFileDataProps = {
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
                files={field.value}
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
