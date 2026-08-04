import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';
import { FileUploader } from '@/src/components/ui/file-uploader';
import { HelpCenter } from '@/src/components/shared/zendesk-drawer/HelpCenter';
import { cn } from '@/src/lib/utils';
import { FileComponentProps } from '@/src/types/fields';

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
      {(description || fieldData.meta?.helpCenter) && (
        <div className='flex items-center justify-between'>
          <FormDescription
            className='RemoteFlows__FileUpload__Description'
            helpCenter={<HelpCenter helpCenter={fieldData.meta?.helpCenter} />}
          >
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
