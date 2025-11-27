import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';
import { FileUploader } from '@/src/components/ui/file-uploader';
import { cn } from '@/src/lib/utils';
import { FileComponentProps } from '@/src/types/remoteFlows';

export function FileUploadFieldDefault({
  field,
  fieldState,
  fieldData,
}: FileComponentProps) {
  const { name, label, description, multiple, accept } = fieldData;

  return (
    <FormItem
      data-field={name}
      className={`RemoteFlows__FileUpload__Item__${name}`}
    >
      <FormLabel className='RemoteFlows__FileUpload__Label'>{label}</FormLabel>
      <FormControl>
        <FileUploader
          onChange={field.onChange}
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
}